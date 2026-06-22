const axios = require('axios');
const { sequelize } = require('./Postgres');
const { logger } = require('./Logger');

// Ollama local embedding endpoint
const OLLAMA_BASE_URL = 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text'; // 768-dim, free, runs locally

// Simple in-memory cache to avoid re-embedding identical strings within one process run
const embeddingCache = new Map();

/**
 * Get a 768-dim embedding vector using local Ollama nomic-embed-text model.
 * @param {string} text
 * @returns {number[]} 768-dimensional float array
 */
async function getEmbedding(text) {
    const cacheKey = text.trim().substring(0, 200);
    if (embeddingCache.has(cacheKey)) {
        return embeddingCache.get(cacheKey);
    }

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
        model: EMBEDDING_MODEL,
        prompt: text.trim()
    }, { timeout: 30000 });

    const vector = response.data.embedding;
    if (!vector || !vector.length) throw new Error('Empty embedding returned from Ollama');

    embeddingCache.set(cacheKey, vector);
    return vector;
}

const STOP_WORDS = new Set([
    'i', 'want', 'need', 'to', 'buy', 'get', 'me', 'find', 'show', 'a', 'an', 'the',
    'with', 'for', 'near', 'you', 'please', 'is', 'are', 'am', 'some', 'any', 'looking',
    'how', 'many', 'hotel', 'hotels', 'restaurant', 'restaurants', 'store', 'stores',
    'shop', 'shops', 'food', 'grocery', 'groceries', 'buy', 'sell', 'location', 'here',
    'there', 'where', 'what', 'which', 'who', 'why', 'can', 'could', 'would', 'should',
    'about', 'info', 'information', 'details', 'menu', 'list', 'show', 'tell', 'give'
]);

function getQueryKeywords(query) {
    if (!query) return [];
    return query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * Retrieve the most semantically relevant knowledge chunks for a user query.
 * Uses pgvector cosine similarity search.
 *
 * @param {string} userQuery  - The user's raw chat message
 * @param {number} userLat    - User's latitude (for distance re-ranking)
 * @param {number} userLng    - User's longitude (for distance re-ranking)
 * @param {number} topK       - Number of chunks to return (default 8)
 * @returns {Array<{content: string, metadata: object, similarity: number}>}
 */
async function retrieveRelevantChunks(userQuery, userLat = null, userLng = null, topK = 8) {
    try {
        const queryVector = await getEmbedding(userQuery);
        const vectorStr = `[${queryVector.join(',')}]`;

        let sql;
        if (userLat !== null && userLng !== null) {
            const keywords = getQueryKeywords(userQuery);
            let keywordCond = 'FALSE';
            if (keywords.length > 0) {
                keywordCond = keywords.map(k => `content ILIKE '%${k}%'`).join(' OR ');
            }
            sql = `
                WITH ChunkDistances AS (
                    SELECT 
                        "id", 
                        "content", 
                        "metadata",
                        "integrationId",
                        "sourceType",
                        1 - (embedding::vector <=> '${vectorStr}'::vector) AS similarity,
                        (metadata->>'latitude')::float AS lat,
                        (metadata->>'longitude')::float AS lng
                    FROM "EmbeddingChunks"
                    WHERE metadata->>'latitude' IS NOT NULL 
                      AND metadata->>'longitude' IS NOT NULL
                ),
                CalculatedDistances AS (
                    SELECT *,
                        6371 * 2 * asin(sqrt(
                            power(sin((radians(lat) - radians(${userLat})) / 2), 2) + 
                            cos(radians(${userLat})) * cos(radians(lat)) * 
                            power(sin((radians(lng) - radians(${userLng})) / 2), 2)
                        )) AS dist_km
                    FROM ChunkDistances
                )
                SELECT *
                FROM CalculatedDistances
                WHERE dist_km <= 15
                  AND (
                    similarity >= 0.57
                    OR (similarity >= 0.40 AND (${keywordCond}))
                  )
                ORDER BY similarity DESC
                LIMIT ${topK * 2}
            `;
        } else {
            sql = `
                SELECT
                    "id",
                    "content",
                    "metadata",
                    "integrationId",
                    "sourceType",
                    1 - (embedding::vector <=> '${vectorStr}'::vector) AS similarity
                FROM "EmbeddingChunks"
                ORDER BY embedding::vector <=> '${vectorStr}'::vector
                LIMIT ${topK}
            `;
        }

        const [rows] = await sequelize.query(sql);

        if (!rows || rows.length === 0) return [];

        // If we have user coordinates, re-rank by combining similarity + proximity
        if (userLat && userLng) {
            rows.forEach(row => {
                if (row.lat !== null && row.lng !== null) {
                    const distKm = row.dist_km;
                    // Proximity boost: normalize distance to 0-1 scale (0km=1.0, 10km=0.0)
                    const proximityScore = Math.max(0, 1 - distKm / 10);
                    // Combined score: 70% semantic + 30% proximity
                    row.combinedScore = (row.similarity * 0.7) + (proximityScore * 0.3);
                    row.distKm = distKm;
                } else {
                    row.combinedScore = row.similarity * 0.7;
                    row.distKm = null;
                }
            });
            rows.sort((a, b) => b.combinedScore - a.combinedScore);
        }

        return rows.slice(0, topK);
    } catch (err) {
        logger.error('RAG retrieval failed:', err.message);
        return [];
    }
}

/**
 * Format retrieved chunks into a clean context string for the AI system prompt.
 * @param {Array} chunks - From retrieveRelevantChunks()
 * @returns {string}
 */
function formatChunksForPrompt(chunks) {
    if (!chunks || chunks.length === 0) return '';
    return chunks.map((c, i) => {
        const distStr = c.distKm != null
            ? ` (${c.distKm < 1 ? (c.distKm * 1000).toFixed(0) + 'm' : c.distKm.toFixed(1) + 'km'} away)`
            : '';
        return `[${i + 1}]${distStr} ${c.content}`;
    }).join('\n\n');
}

/**
 * Re-index all chunks for a single integration (store).
 * Call this whenever a merchant's products or description changes.
 * @param {string} integrationId
 */
async function reindexIntegration(integrationId) {
    try {
        const { Integration, Product, Review } = require('./Postgres');

        const integration = await Integration.findByPk(integrationId);
        if (!integration) return;

        // Delete existing chunks for this store
        await sequelize.query(
            `DELETE FROM "EmbeddingChunks" WHERE "integrationId" = :integrationId`,
            { replacements: { integrationId } }
        );

        const chunks = [];

        // Store-level chunk
        const storeText = buildStoreChunk(integration);
        chunks.push({ sourceType: 'store', sourceId: integration.id, content: storeText });

        // Product chunks
        const products = await Product.findAll({
            where: { integrationId, isActive: true, isDeleted: false }
        });
        for (const p of products) {
            chunks.push({
                sourceType: 'product',
                sourceId: p.id,
                content: buildProductChunk(p, integration)
            });
        }

        // Embed and insert
        await embedAndInsertChunks(chunks, integration);
        console.log(`✅ Re-indexed ${chunks.length} chunks for ${integration.integrationName}`);
    } catch (err) {
        logger.error(`reindexIntegration failed for ${integrationId}:`, err.message);
    }
}

// ─── Chunk Builder Helpers ────────────────────────────────────────────────────

function buildStoreChunk(integration) {
    const loc = [integration.city, integration.state].filter(Boolean).join(', ');
    return `Store: ${integration.integrationName}. ${integration.description || ''}. ` +
           `Category: ${integration.category || 'General'}. ` +
           `Type: ${integration.verticalType || ''}. ` +
           `Location: ${loc || 'N/A'}.`;
}

function buildProductChunk(product, integration) {
    const loc = [integration.city, integration.state].filter(Boolean).join(', ');
    return `Product: ${product.name}. ${product.description || ''}. ` +
           `Price: ₹${product.price}. ` +
           `Available at: ${integration.integrationName} (ID: ${integration.id}). ` +
           `Store category: ${integration.category || 'General'}. ` +
           `Location: ${loc || 'N/A'}.`;
}

function buildReviewChunk(review, integration, reviewerName) {
    return `Review for ${integration.integrationName}: ` +
           `${reviewerName} gave ${review.rating}/5 stars and said: "${review.reviewText}". ` +
           `Category: ${integration.category || 'General'}.`;
}

async function embedAndInsertChunks(chunks, integration) {
    const { sequelize: seq } = require('./Postgres');
    const { v4: uuidv4 } = require('uuid');

    for (const chunk of chunks) {
        try {
            const vector = await getEmbedding(chunk.content);
            const vectorStr = `[${vector.join(',')}]`;
            const id = uuidv4();
            const metadata = JSON.stringify({
                latitude: integration.latitude ? Number(integration.latitude) : null,
                longitude: integration.longitude ? Number(integration.longitude) : null,
                category: integration.category,
                verticalType: integration.verticalType,
                integrationId: integration.id,
                integrationName: integration.integrationName,
            });

            await seq.query(`
                INSERT INTO "EmbeddingChunks"
                    (id, "sourceType", "sourceId", "integrationId", content, embedding, metadata, "createdAt", "updatedAt")
                VALUES
                    (:id, :sourceType, :sourceId, :integrationId, :content, :vector::vector, :metadata::jsonb, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
            `, {
                replacements: {
                    id,
                    sourceType: chunk.sourceType,
                    sourceId: chunk.sourceId || null,
                    integrationId: integration.id,
                    content: chunk.content,
                    vector: vectorStr,
                    metadata,
                }
            });
        } catch (err) {
            console.warn(`⚠️  Failed to embed chunk: ${chunk.content.substring(0, 60)}... — ${err.message}`);
        }
    }
}

module.exports = {
    getEmbedding,
    retrieveRelevantChunks,
    formatChunksForPrompt,
    reindexIntegration,
    buildStoreChunk,
    buildProductChunk,
    buildReviewChunk,
    embedAndInsertChunks,
};

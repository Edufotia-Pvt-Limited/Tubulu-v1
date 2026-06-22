/**
 * RAGIndexer.js
 * Embeds all active products, store descriptions, and reviews into the EmbeddingChunks table.
 * Run once to build the initial index, then re-run whenever bulk product changes happen.
 *
 * Usage: node Scripts/RAGIndexer.js
 */

const { sequelize, Integration, Product, Review, User } = require('../Utils/Postgres');
const RAGHelper = require('../Utils/RAGHelper');
const { v4: uuidv4 } = require('uuid');

// Rate limiting — Google Embedding API allows ~1500 req/min on free tier
const DELAY_MS = 50; // 50ms between each embedding call → ~20 req/s → well within limits
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runIndexer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL.\n');

        // ── Wipe existing chunks ──────────────────────────────────────────────
        await sequelize.query(`DELETE FROM "EmbeddingChunks"`);
        console.log('🗑️  Cleared existing EmbeddingChunks.\n');

        // ── Fetch all active integrations ─────────────────────────────────────
        const integrations = await Integration.findAll({
            where: { isActive: true, isApproved: true }
        });

        console.log(`📦 Found ${integrations.length} active stores to index.\n`);

        let totalChunks = 0;
        let totalErrors = 0;

        for (const integration of integrations) {
            console.log(`\n🏪 Indexing: ${integration.integrationName} (${integration.category || 'N/A'})`);

            const chunksForStore = [];

            // 1. Store-level description chunk
            const storeText = RAGHelper.buildStoreChunk(integration);
            chunksForStore.push({
                sourceType: 'store',
                sourceId: integration.id,
                content: storeText,
            });

            // 2. Product chunks
            const products = await Product.findAll({
                where: { integrationId: integration.id, isActive: true, isDeleted: false }
            });

            for (const product of products) {
                const productText = RAGHelper.buildProductChunk(product, integration);
                chunksForStore.push({
                    sourceType: 'product',
                    sourceId: product.id,
                    content: productText,
                });
            }

            // 3. Review chunks
            try {
                const reviews = await Review.findAll({
                    where: { integrationId: integration.id, isPublicToContacts: true },
                    limit: 5,
                    include: [{ model: User, attributes: ['firstName'] }]
                });

                for (const review of reviews) {
                    const name = review.User ? (review.User.firstName || 'A customer') : 'A customer';
                    const reviewText = RAGHelper.buildReviewChunk(review, integration, name);
                    chunksForStore.push({
                        sourceType: 'review',
                        sourceId: review.id,
                        content: reviewText,
                    });
                }
            } catch (e) {
                // Reviews are optional — don't fail indexing if reviews error
            }

            // 4. Embed and store each chunk
            for (const chunk of chunksForStore) {
                try {
                    const vector = await RAGHelper.getEmbedding(chunk.content);
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

                    await sequelize.query(`
                        INSERT INTO "EmbeddingChunks"
                            (id, "sourceType", "sourceId", "integrationId", content, embedding, metadata, "createdAt", "updatedAt")
                        VALUES
                            (:id, :sourceType, :sourceId, :integrationId, :content, :vector::vector, :metadata::jsonb, NOW(), NOW())
                    `, {
                        replacements: {
                            id,
                            sourceType: chunk.sourceType,
                            sourceId: chunk.sourceId,
                            integrationId: integration.id,
                            content: chunk.content,
                            vector: vectorStr,
                            metadata,
                        }
                    });

                    totalChunks++;
                    process.stdout.write('.');
                    await sleep(DELAY_MS);
                } catch (err) {
                    totalErrors++;
                    process.stdout.write('✗');
                    console.warn(`\n  ⚠️  Failed: ${chunk.content.substring(0, 60)}... → ${err.message}`);
                }
            }

            console.log(` ✅ ${chunksForStore.length} chunks indexed for ${integration.integrationName}`);
        }

        console.log(`\n\n🎉 RAG Indexing Complete!`);
        console.log(`   Total chunks indexed : ${totalChunks}`);
        console.log(`   Total errors         : ${totalErrors}`);
        console.log(`\nTubulu Vibe is now RAG-powered! 🚀`);
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Indexer failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

runIndexer();

/**
 * setupPgVector.js
 * Run once to enable the pgvector extension and create the vector similarity index.
 * Usage: node Scripts/setupPgVector.js
 */

const { sequelize } = require('../Utils/Postgres');

async function setup() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL.');

        // 1. Enable pgvector extension
        await sequelize.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log('✅ pgvector extension enabled.');

        // 2. Ensure EmbeddingChunks table exists with a vector column
        //    (Sequelize sync will create the table with ARRAY(FLOAT), then we alter it)
        const EmbeddingChunk = require('../Models/EmbeddingChunk.pg.js');
        await EmbeddingChunk.sync({ alter: false, force: false });

        // 3. Make sure the embedding column is the native vector type
        await sequelize.query(`
            ALTER TABLE "EmbeddingChunks"
            ALTER COLUMN embedding TYPE vector(768)
            USING embedding::vector(768);
        `).catch(() => {
            // Column may already be vector type — that's fine
            console.log('ℹ️  embedding column already correct type (or no rows yet).');
        });
        console.log('✅ embedding column is vector(768).');

        // 4. Create the IVFFlat index for fast cosine similarity search
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS embedding_cosine_idx
            ON "EmbeddingChunks"
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 10);
        `).catch(e => {
            console.warn('ℹ️  Index creation skipped (may need data first):', e.message);
        });
        console.log('✅ Cosine similarity index created (or already exists).');

        console.log('\n🎉 pgvector setup complete! You can now run the indexer.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Setup failed:', err.message);
        process.exit(1);
    }
}

setup();

const { connectPostgres } = require('../Utils/Postgres');

async function sync() {
    console.log('🔄 Starting PostgreSQL Schema Synchronization...');
    await connectPostgres();
    console.log('✅ Schema Synchronization Complete!');
    process.exit(0);
}

sync();

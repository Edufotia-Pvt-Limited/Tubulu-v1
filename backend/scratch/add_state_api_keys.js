const { Sequelize } = require('sequelize');
const { config } = require('../config');

const sequelize = new Sequelize(
    config.POSTGRES.database,
    config.POSTGRES.user,
    config.POSTGRES.password,
    {
        host: config.POSTGRES.host,
        port: config.POSTGRES.port,
        dialect: 'postgres',
        logging: false
    }
);

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        
        console.log('Adding columns sarvamApiKey and geminiApiKey to States table...');
        await sequelize.query(`
            ALTER TABLE "States" 
            ADD COLUMN IF NOT EXISTS "sarvamApiKey" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "geminiApiKey" VARCHAR(255);
        `);
        console.log('Columns added successfully.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

run();

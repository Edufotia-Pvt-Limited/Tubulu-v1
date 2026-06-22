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
        
        console.log('Adding column geminiApiKey to Integrations table...');
        await sequelize.query(`
            ALTER TABLE "Integrations" 
            ADD COLUMN IF NOT EXISTS "geminiApiKey" VARCHAR(255);
        `);
        console.log('Column added successfully.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

run();

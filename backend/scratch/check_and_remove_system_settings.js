const { Sequelize } = require('sequelize');
const { config } = require('../config');
const fs = require('fs');
const path = require('path');

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
        
        console.log('Deleting GEMINI_API_KEY, SARVAM_API_KEY, and OPENAI_API_KEY from SystemSettings...');
        await sequelize.query(`
            DELETE FROM "SystemSettings" 
            WHERE key IN ('GEMINI_API_KEY', 'SARVAM_API_KEY', 'OPENAI_API_KEY');
        `);
        console.log('Keys deleted from database successfully.');

        // Print final settings
        const [results] = await sequelize.query('SELECT * FROM "SystemSettings";');
        console.log('Remaining SystemSettings:', results);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

run();

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

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const [results] = await sequelize.query(`
            SELECT id, "integrationName", "pstnDID", "sarvamApiKey", "isActive" 
            FROM "Integrations"
        `);
        console.log('All Integrations:', results);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

check();

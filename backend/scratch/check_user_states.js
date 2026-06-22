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
        
        const [users] = await sequelize.query(`
            SELECT id, "phoneNumber", "firstName", "state", "scopedStateId" 
            FROM "Users" 
            WHERE "phoneNumber" IN ('9898989898', '6868686868');
        `);
        console.log('Users info:', users);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

run();

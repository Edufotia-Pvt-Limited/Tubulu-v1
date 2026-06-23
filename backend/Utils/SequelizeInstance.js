// Shared Sequelize instance to break circular dependencies
// Models that cannot require Postgres.js (due to circular deps) should require this file instead
const { Sequelize } = require('sequelize');
const { config } = require('../config');

const sequelize = new Sequelize(
    config.POSTGRES.database,
    config.POSTGRES.user,
    config.POSTGRES.password,
    {
        host: config.POSTGRES.host,
        dialect: 'postgres',
        port: config.POSTGRES.port,
        logging: false,
    }
);

module.exports = { sequelize };

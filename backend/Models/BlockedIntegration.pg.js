const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const BlockedIntegration = sequelize.define('BlockedIntegration', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = BlockedIntegration;

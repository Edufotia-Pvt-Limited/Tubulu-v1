const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const ServiceProvider = sequelize.define('ServiceProvider', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    serviceType: {
        type: DataTypes.ENUM('LLM', 'STT_TTS', 'Payments'),
        allowNull: false,
    },
    serviceProvider: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    tableName: 'ServiceProviders',
});

module.exports = ServiceProvider;

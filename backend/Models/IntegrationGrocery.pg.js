const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const IntegrationGrocery = sequelize.define('IntegrationGrocery', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'Integrations',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    organicCert: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deliverySlots: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    timestamps: true,
    tableName: 'IntegrationGroceries'
});

module.exports = IntegrationGrocery;

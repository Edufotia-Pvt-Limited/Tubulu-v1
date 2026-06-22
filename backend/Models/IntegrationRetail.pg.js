const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const IntegrationRetail = sequelize.define('IntegrationRetail', {
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
    returnPolicyDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    shippingRates: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
    }
}, {
    timestamps: true,
    tableName: 'IntegrationRetails'
});

module.exports = IntegrationRetail;

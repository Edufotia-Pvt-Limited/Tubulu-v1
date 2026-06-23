const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const IntegrationFB = sequelize.define('IntegrationFB', {
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
    prepTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    cuisineType: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'IntegrationFBs'
});

module.exports = IntegrationFB;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const City = sequelize.define('City', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    stateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'States', key: 'id' },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
    radius: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 20.0,
    },
    themeConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
    },
}, {
    timestamps: true,
    indexes: [{ unique: true, fields: ['name', 'stateId'] }]
});

module.exports = City;

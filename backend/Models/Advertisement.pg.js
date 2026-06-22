const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const Advertisement = sequelize.define('Advertisement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    bannerUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    targetCity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    targetState: {
        type: DataTypes.STRING,
        allowNull: true,
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
        type: DataTypes.INTEGER, // in KM
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Advertisement;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const StoreFeed = sequelize.define('StoreFeed', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    mediaUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    actionProductId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    startsAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = StoreFeed;

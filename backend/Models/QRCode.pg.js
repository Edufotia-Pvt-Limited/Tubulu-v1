const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const QRCode = sequelize.define('QRCode', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subTitle: {
        type: DataTypes.STRING,
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.UUID,
    },
    welcomeMessage: {
        type: DataTypes.TEXT,
    },
    welcomeMessageDocument: {
        type: DataTypes.STRING,
    },
    qrCodeURL: {
        type: DataTypes.STRING,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    scanCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    phoneBookGroups: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    deletedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = QRCode;

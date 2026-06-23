const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const CampaignTemplate = sequelize.define('CampaignTemplate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mediaType: {
        type: DataTypes.STRING,
    },
    mediaURL: {
        type: DataTypes.STRING,
    },
    messageBody: {
        type: DataTypes.TEXT,
    },
    messageActions: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('APPROVED', 'PENDING'),
        defaultValue: 'PENDING',
    },
    payload: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    variables: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    deletedAt: {
        type: DataTypes.DATE,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = CampaignTemplate;

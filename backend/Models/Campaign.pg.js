const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('SCHEDULED', 'IMMEDIATE'),
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    scheduledTime: {
        type: DataTypes.DATE,
    },
    phoneBookId: {
        type: DataTypes.UUID,
    },
    users: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'COMPLETED', 'ACTIVE', 'SCHEDULED', 'CANCELLED'),
        allowNull: false,
    },
    phoneBookIds: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    deletedAt: {
        type: DataTypes.DATE,
    },
    variables: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Campaign;

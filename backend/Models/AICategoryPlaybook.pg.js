const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const AICategoryPlaybook = sequelize.define('AICategoryPlaybook', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    categoryKey: {
        type: DataTypes.STRING, // e.g. 'GROCERY', 'FB', 'SERVICES', 'RETAIL'
        allowNull: false,
        unique: true,
    },
    displayName: {
        type: DataTypes.STRING, // e.g. 'Grocery & Essentials'
        allowNull: false,
    },
    masterPrompt: {
        type: DataTypes.TEXT, // Core AI guidelines and instructions
        allowNull: false,
    },
    requiredAttributes: {
        type: DataTypes.JSONB, // Array of fields needed for this category, e.g. ["brand", "weight"]
        defaultValue: [],
    },
    actionConfig: {
        type: DataTypes.JSONB, // Capability flags, e.g. { "hasCart": true }
        defaultValue: {},
    }
}, {
    timestamps: true,
});

module.exports = AICategoryPlaybook;

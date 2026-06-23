const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const VendorAIConfig = sequelize.define('VendorAIConfig', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    masterPrompt: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'The core personality and guidelines (The Brain)',
    },
    faqContext: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: 'Array of { question: string, answer: string }',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    catalogScoped: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'If true, AI will strictly use catalogue data',
    },
    modelName: {
        type: DataTypes.STRING,
        defaultValue: 'gpt-3.5-turbo',
    },
    temperature: {
        type: DataTypes.FLOAT,
        defaultValue: 0.7,
    }
}, {
    timestamps: true,
});

module.exports = VendorAIConfig;

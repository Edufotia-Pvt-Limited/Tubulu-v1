const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

/**
 * EmbeddingChunk — stores pre-computed text embeddings for RAG.
 * Each row represents one "knowledge chunk" (a product, store description, or review)
 * that has been converted into a 768-dimensional vector using Google text-embedding-004.
 */
const EmbeddingChunk = sequelize.define('EmbeddingChunk', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // What kind of data was embedded
    sourceType: {
        type: DataTypes.STRING, // 'product', 'store', 'review'
        allowNull: false,
    },
    // The ID of the original record (Product.id, Integration.id, Review.id)
    sourceId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    // Which store this chunk belongs to (for filtering by store)
    integrationId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    // The raw text that was embedded (for display / debugging)
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // The embedding vector is managed via raw SQL only (pgvector vector(768) type).
    // We intentionally exclude it from Sequelize model to prevent alter:true
    // from trying to cast vector(768) → FLOAT[] on every server start.
    // Use raw SQL queries in RAGHelper.js to read/write this column.

    // Extra fields for re-ranking (price, distance hints, category)
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },

}, {
    timestamps: true,
    tableName: 'EmbeddingChunks',
});

module.exports = EmbeddingChunk;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const ChatDocument = sequelize.define('ChatDocument', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    chatRoomId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    fileUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sender: {
        type: DataTypes.ENUM('user', 'assistant'),
        allowNull: true,
        defaultValue: 'user',
    },
}, {
    tableName: 'chat_documents',
    timestamps: true,
});

module.exports = ChatDocument;

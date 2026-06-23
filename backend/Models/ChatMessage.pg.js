const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const ChatRoom = require('./ChatRoom.pg.js');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chatRoomId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: ChatRoom,
            key: 'id'
        }
    },
    sender: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['chatRoomId'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = ChatMessage;

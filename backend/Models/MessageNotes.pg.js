const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const MessageNote = sequelize.define('MessageNote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    chatRoomId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    chatMessageId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    noteMessage: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'message_notes',
    timestamps: true,
});

module.exports = MessageNote;

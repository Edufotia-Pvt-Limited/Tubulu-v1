const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const MessageBookmark = sequelize.define('MessageBookmark', {
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
        allowNull: false,
    },
}, {
    tableName: 'message_bookmarks',
    timestamps: true,
});

module.exports = MessageBookmark;

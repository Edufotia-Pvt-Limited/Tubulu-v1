const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const User = require('./User.pg.model');
const Integration = require('./Integration.pg');

const ChatRoom = sequelize.define('ChatRoom', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Integration,
            key: 'id'
        }
    },
    lastMessage: {
        type: DataTypes.TEXT,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isAiActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true,
    indexes: [
        { 
            fields: ['userId', 'integrationId'], 
            unique: true,
            where: { isActive: true }
        }
    ]
});

module.exports = ChatRoom;

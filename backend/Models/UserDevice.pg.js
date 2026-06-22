const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const User = require('./User.pg.model');

const UserDevice = sequelize.define('UserDevice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    fcmToken: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    socketId: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    lastOnlineAt: {
        type: DataTypes.STRING,
        defaultValue: '',
    }
}, {
    timestamps: true
});

module.exports = UserDevice;

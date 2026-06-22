const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    profilePictureUrl: {
        type: DataTypes.TEXT,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
    },
    userName: {
        type: DataTypes.STRING,
    },
    firstName: {
        type: DataTypes.STRING,
    },
    lastName: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cc: {
        type: DataTypes.STRING,
        defaultValue: '+91',
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'User',
    },
    lastLoginAt: {
        type: DataTypes.STRING,
    },
    userVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    otp: {
        type: DataTypes.STRING,
    },
    otpExpiry: {
        type: DataTypes.STRING,
    },
    fcmToken: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    state: {
        type: DataTypes.STRING,
    },
    pinCode: {
        type: DataTypes.STRING,
    },
    addresses: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    cdpDetails: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    portfolioAccess: {
        type: DataTypes.JSONB,
        defaultValue: {
            accessType: 'GLOBAL', // 'GLOBAL', 'VERTICAL', or 'MERCHANT'
            verticals: [],       // e.g. ['FB', 'GROCERY']
            merchants: []        // e.g. ['uuid-1', 'uuid-2']
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'offline',
    },
    scopedCountryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Countries', key: 'id' },
    },
    scopedStateId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'States', key: 'id' },
    },
    scopedCityId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Cities', key: 'id' },
    },
    createdByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' }
    },
    enablerStats: {
        type: DataTypes.JSONB,
        defaultValue: {
            totalSubmitted: 0,
            totalApproved: 0,
            totalRejected: 0,
            lastActivityAt: null
        }
    },
    pinResetCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    pinResetDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    currentSessionToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
});

module.exports = User;

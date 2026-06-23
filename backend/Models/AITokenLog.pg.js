const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const User = require('./User.pg.model');
const Integration = require('./Integration.pg');

const AITokenLog = sequelize.define('AITokenLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Integration,
            key: 'id'
        }
    },
    featureName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stateId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    cityId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    promptTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    completionTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    totalTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    timestamps: true
});

module.exports = AITokenLog;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const Integration = require('./Integration.pg');

const Settlement = sequelize.define('Settlement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Integration,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // pending, success, failed
    },
    utr: {
        type: DataTypes.STRING, // Bank transaction reference
    },
    settlementDate: {
        type: DataTypes.DATE,
    },
    payoutId: {
        type: DataTypes.STRING, // External payout ID if using RazorpayX etc
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'payout' // 'payout' | 'commission'
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    timestamps: true
});

module.exports = Settlement;

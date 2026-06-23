const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const Integration = require('./Integration.pg');

const PaymentTransaction = sequelize.define('PaymentTransaction', {
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
    paymentGatewayOrderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentGatewayPaymentId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PENDING'),
        defaultValue: 'PENDING',
    },
    type: {
        type: DataTypes.ENUM('SUBSCRIPTION', 'TOKEN_RECHARGE', 'DELIVERY_RECHARGE'),
        allowNull: false,
    }
}, {
    timestamps: true
});

module.exports = PaymentTransaction;

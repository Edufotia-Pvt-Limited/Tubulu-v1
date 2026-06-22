const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const Integration = require('./Integration.pg');
const Order = require('./Order.pg');

const DeliveryTransaction = sequelize.define('DeliveryTransaction', {
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
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        }
    },
    amountDeducted: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    pidgeOrderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'SUCCESS',
    }
}, {
    timestamps: true
});

module.exports = DeliveryTransaction;

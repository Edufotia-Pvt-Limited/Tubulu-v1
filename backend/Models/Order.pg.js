const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const User = require('./User.pg.model');
const Integration = require('./Integration.pg');

const Order = sequelize.define('Order', {
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
    cartId: {
        type: DataTypes.STRING, // Can be UUID or MongoId string for now
        allowNull: true,
    },
    catalogueId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    addressId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    orderItems: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    discountAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    walletDiscount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    totalQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    orderMessage: {
        type: DataTypes.TEXT,
    },
    deliveryType: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'cod',
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
    },
    pidgeOrderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    trackingUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    deliveryQuote: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
    },
    status: {
        type: DataTypes.ENUM('waiting', 'accepted', 'packing', 'dispatched', 'delivered', 'canceled'),
        defaultValue: 'waiting',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    statusLogs: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    packedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    dispatchedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    personalNote: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    scheduledFor: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isRated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: true
});

module.exports = Order;

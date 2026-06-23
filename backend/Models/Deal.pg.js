const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const Integration = require('./Integration.pg');

const Deal = sequelize.define('Deal', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Integration,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descriptions: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'flat', 'bogo'),
        allowNull: false,
    },
    couponCode: {
        type: DataTypes.STRING,
    },
    couponType: {
        type: DataTypes.ENUM('store_coupon', 'payment_coupon'),
        defaultValue: 'store_coupon',
    },
    discountValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    buyQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    getQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    minOrderValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    maxDiscount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    perUserLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isDealOfTheDay: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    catalogueId: {
        type: DataTypes.STRING,
    },
    appliesOnProducts: {
        type: DataTypes.JSONB,
        defaultValue: [],
    }
}, {
    timestamps: true
});

module.exports = Deal;

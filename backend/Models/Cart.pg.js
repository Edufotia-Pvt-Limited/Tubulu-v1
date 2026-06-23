const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const User = require('./User.pg.model');
const Integration = require('./Integration.pg');

const Cart = sequelize.define('Cart', {
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
    catalogueId: {
        type: DataTypes.STRING, // Can be UUID or MongoId string
        allowNull: true,
    },
    items: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    appliedDeals: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    totalQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true
});

module.exports = Cart;

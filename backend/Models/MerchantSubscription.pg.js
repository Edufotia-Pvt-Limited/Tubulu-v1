const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const MerchantSubscription = sequelize.define('MerchantSubscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    planId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'PENDING'),
        defaultValue: 'PENDING',
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: true
});

module.exports = MerchantSubscription;

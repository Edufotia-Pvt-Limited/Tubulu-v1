const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const MerchantWallet = sequelize.define('MerchantWallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    tokenBalance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    deliveryCashBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    }
}, {
    timestamps: true
});

module.exports = MerchantWallet;

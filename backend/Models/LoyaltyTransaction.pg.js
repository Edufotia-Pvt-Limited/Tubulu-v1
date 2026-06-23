const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    walletId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('earn', 'redeem', 'referral_bonus', 'spend', 'refund'),
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    updatedAt: false,
});

module.exports = LoyaltyTransaction;

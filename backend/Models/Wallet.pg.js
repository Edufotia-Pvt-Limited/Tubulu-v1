const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    cashBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    referralCode: {
        type: DataTypes.STRING,
        unique: true,
    },
    referredBy: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}, {
    timestamps: true
});

module.exports = Wallet;

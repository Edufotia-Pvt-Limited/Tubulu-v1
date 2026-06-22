const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const UserDealUsage = sequelize.define('UserDealUsage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    dealId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['integrationId'] },
        { fields: ['dealId'] }
    ]
});

module.exports = UserDealUsage;

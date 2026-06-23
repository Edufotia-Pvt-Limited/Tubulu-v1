const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const User = require('./User.pg.model');
const Integration = require('./Integration.pg');

const MerchantMembership = sequelize.define('MerchantMembership', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    role: {
        type: DataTypes.ENUM('OWNER', 'MANAGER', 'CASHIER'),
        defaultValue: 'CASHIER',
        allowNull: false,
    },
    permissions: {
        type: DataTypes.JSONB,
        defaultValue: {
            canEditPricing: false,
            canEditCatalogue: false,
            canViewSettlements: false,
            canManageStaff: false,
        },
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'integrationId']
        }
    ]
});

module.exports = MerchantMembership;

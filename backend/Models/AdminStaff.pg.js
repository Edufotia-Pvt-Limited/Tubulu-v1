const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const AdminStaff = sequelize.define('AdminStaff', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Integrations',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('manager', 'cashier', 'support', 'delivery'),
        defaultValue: 'support',
    },
    permissions: {
        type: DataTypes.JSONB,
        defaultValue: {
            canManageOrders: true,
            canManageProducts: false,
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    delegatedToStaffId: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}, {
    timestamps: true
});

module.exports = AdminStaff;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const SupportTicket = sequelize.define('SupportTicket', {
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
    orderId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Orders',
            key: 'id'
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open',
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
    },
    attachments: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    replies: {
        type: DataTypes.JSONB,
        defaultValue: [], // Array of { sender: 'user' | 'staff', message: string, timestamp: Date }
    }
}, {
    timestamps: true
});

module.exports = SupportTicket;

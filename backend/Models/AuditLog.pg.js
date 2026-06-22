const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    staffId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    }
}, {
    timestamps: true,
    updatedAt: false, // Audit log is append-only
});

module.exports = AuditLog;

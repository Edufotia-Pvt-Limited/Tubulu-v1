const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const EnablerOnboarding = sequelize.define('EnablerOnboarding', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    enablerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Integrations', key: 'id' },
    },
    cityId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Cities', key: 'id' },
    },
    status: {
        type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'needs_reupload'),
        defaultValue: 'draft',
        allowNull: false,
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    reviewedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
    },
    fieldNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    gpsLatitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    gpsLongitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = EnablerOnboarding;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const StateServiceConfig = sequelize.define('StateServiceConfig', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    stateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'States',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    serviceProviderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ServiceProviders',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    config: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
}, {
    timestamps: true,
    tableName: 'StateServiceConfigs',
});

module.exports = StateServiceConfig;

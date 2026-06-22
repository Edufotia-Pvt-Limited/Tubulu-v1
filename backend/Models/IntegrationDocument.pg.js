const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const IntegrationDocument = sequelize.define('IntegrationDocument', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    documentUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documentOriginalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = IntegrationDocument;

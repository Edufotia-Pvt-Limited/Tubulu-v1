const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const QRCategory = sequelize.define('QRCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = QRCategory;

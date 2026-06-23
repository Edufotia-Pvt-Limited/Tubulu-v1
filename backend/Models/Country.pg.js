const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const Country = sequelize.define('Country', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true, // e.g. "IN", "US"
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, { timestamps: true });

module.exports = Country;

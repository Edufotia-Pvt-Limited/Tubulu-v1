const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const PhoneBookGroup = sequelize.define('PhoneBookGroup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    groupName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    integrationId: {
        type: DataTypes.UUID,
    },
}, {
    timestamps: true,
});

module.exports = PhoneBookGroup;

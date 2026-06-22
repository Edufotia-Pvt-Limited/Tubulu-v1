const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const PhoneBookGroupRelation = sequelize.define('PhoneBookGroupRelation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    phoneBookId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = PhoneBookGroupRelation;

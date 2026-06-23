const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const User = require('./User.pg.model');
const Integration = require('./Integration.pg');

const PhoneBook = sequelize.define('PhoneBook', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Integration,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = PhoneBook;

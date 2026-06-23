const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const User = require('./User.pg.model');

const UserContact = sequelize.define('UserContact', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    contactPhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contactName: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'contactPhoneNumber']
        }
    ]
});

module.exports = UserContact;

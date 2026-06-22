const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const Integration = require('./Integration.pg');
const Product = require('./Product.pg');

const Catalogue = sequelize.define('Catalogue', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    displayType: {
        type: DataTypes.STRING, // 'Grid', 'List', etc.
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Integration,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

module.exports = Catalogue;

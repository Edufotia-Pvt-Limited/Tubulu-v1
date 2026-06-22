const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const State = sequelize.define('State', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    countryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Countries', key: 'id' },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true,
    indexes: [{ unique: true, fields: ['name', 'countryId'] }]
});

module.exports = State;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');
const Integration = require('./Integration.pg');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    discountPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR',
    },
    category: {
        type: DataTypes.STRING,
    },
    subcategory: {
        type: DataTypes.STRING,
    },
    imageUrls: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    dietaryType: {
        type: DataTypes.STRING(20), // 'veg', 'non-veg', 'egg'
        defaultValue: 'veg',
    },
    isBestseller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    preparationTime: {
        type: DataTypes.INTEGER, // average minutes to prepare
        defaultValue: 15,
    },
    variantsConfig: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    /**
     * 🔹 Vertical-Specific Specifications
     * For FB: { foodType: 'Veg', spiceLevel: 'Medium' }
     * For Theater: { screen: 'Audi 1', showTime: '18:00' }
     * For Grocery: { unit: 'kg', isPerishable: true }
     */
    specifications: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    nutritionData: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    integrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Integration,
            key: 'id'
        }
    },
    catalogueId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    customizationId: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['sku'] },
        { fields: ['integrationId'] },
        { fields: ['category'] },
        { fields: ['catalogueId'] }
    ]
});

module.exports = Product;

const { config } = require('../config');
const Sequelize = require('sequelize');
const crypto = require('crypto');

const sequelize = new Sequelize(
  config.POSTGRES.database,
  config.POSTGRES.user,
  config.POSTGRES.password,
  {
    host: config.POSTGRES.host,
    dialect: 'postgres',
    logging: false
  }
);

const integrationId = '908fa830-7d67-4555-8d3b-a72b20636d44';

async function run() {
  try {
    console.log('Starting Food Catalogue Seeding for', integrationId);

    const catalogueId = 'cat_' + crypto.randomBytes(8).toString('hex');
    const now = new Date();

    // 1. Insert Catalogue
    await sequelize.query(`
      INSERT INTO "Catalogues" ("id", "integrationId", "name", "description", "displayType", "isActive", "createdAt", "updatedAt", "isDeleted")
      VALUES (:id, :integrationId, :name, :description, :displayType, :isActive, :now, :now, false);
    `, {
      replacements: {
        id: catalogueId,
        integrationId: integrationId,
        name: 'Main Food Menu',
        description: 'Standard test menu containing appetizers, mains, and desserts.',
        displayType: 'LIST',
        isActive: true,
        now: now
      }
    });
    console.log('Created Catalogue with ID:', catalogueId);

    const products = [
      { name: 'Classic Veg Burger', price: 159, sku: 'BRG-001', category: 'Burgers', desc: 'Tasty veggie burger with lettuce and special sauce.', specs: { foodType: 'Veg' } },
      { name: 'Margherita Pizza', price: 349, sku: 'PZA-002', category: 'Pizza', desc: 'Double cheese loaded freshly baked pizza.', specs: { foodType: 'Veg' } },
      { name: 'Peri Peri Fries', price: 99, sku: 'SD-003', category: 'Sides', desc: 'Crispy golden fries dusted with spicy peri peri powder.', specs: { foodType: 'Veg' } },
      { name: 'Grilled Chicken Sandwich', price: 210, sku: 'SDW-004', category: 'Sandwich', desc: 'Freshly grilled chicken loaded with cheese and mayo.', specs: { foodType: 'Non Veg' } },
      { name: 'Choco Lava Cake', price: 120, sku: 'DST-005', category: 'Desserts', desc: 'Molten hot chocolate filling inside gooey cake.', specs: { foodType: 'Egg' } }
    ];

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      const prodId = 'prod_' + crypto.randomBytes(8).toString('hex');
      
      await sequelize.query(`
        INSERT INTO "Products" ("id", "catalogueId", "integrationId", "name", "description", "price", "currency", "sku", "quantity", "isActive", "isDeleted", "createdAt", "updatedAt", "category", "specifications", "imageUrls", "discountPrice")
        VALUES (:id, :catalogueId, :integrationId, :name, :description, :price, :currency, :sku, :quantity, :isActive, false, :now, :now, :category, :specifications, '[]'::jsonb, 0);
      `, {
        replacements: {
          id: prodId,
          catalogueId: catalogueId,
          integrationId: integrationId,
          name: prod.name,
          description: prod.desc,
          price: prod.price,
          currency: 'INR',
          sku: prod.sku,
          quantity: 100,
          isActive: true,
          now: now,
          category: prod.category,
          specifications: JSON.stringify(prod.specs)
        }
      });
      console.log(`Inserted Product: ${prod.name} (${prodId})`);
    }

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (e) {
    console.error('ERROR DURING SEEDING:', e);
    process.exit(1);
  }
}
run();

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
    console.log('Seeding Supplementary Beverages Catalogue for', integrationId);

    const catalogueId = 'cat_' + crypto.randomBytes(8).toString('hex');
    const now = new Date();

    // 1. Insert Beverages Catalogue
    await sequelize.query(`
      INSERT INTO "Catalogues" ("id", "integrationId", "name", "description", "displayType", "isActive", "createdAt", "updatedAt", "isDeleted")
      VALUES (:id, :integrationId, :name, :description, :displayType, :isActive, :now, :now, false);
    `, {
      replacements: {
        id: catalogueId,
        integrationId: integrationId,
        name: 'Cold Drinks & Mocktails',
        description: 'Refreshing beverages, mocktails, and fruit juices.',
        displayType: 'LIST',
        isActive: true,
        now: now
      }
    });
    console.log('Created Beverages Catalogue ID:', catalogueId);

    const beverages = [
      { name: 'Fresh Lime Soda', price: 79, sku: 'BV-101', category: 'Mocktails', desc: 'Chilled lime soda with salt or sugar.', specs: { foodType: 'Veg' } },
      { name: 'Iced Caramel Macchiato', price: 189, sku: 'BV-102', category: 'Coffee', desc: 'Rich espresso with caramel drizzle served over ice.', specs: { foodType: 'Veg' } },
      { name: 'Mango Smoothie', price: 149, sku: 'BV-103', category: 'Smoothies', desc: 'Thick blended mango smoothie with milk and ice cream.', specs: { foodType: 'Veg' } },
      { name: 'Virgin Mojito', price: 129, sku: 'BV-104', category: 'Mocktails', desc: 'Refreshing mint and lime drink.', specs: { foodType: 'Veg' } },
      { name: 'Coca Cola 500ml', price: 45, sku: 'BV-105', category: 'Soft Drinks', desc: 'Regular Coke bottle chilled.', specs: { foodType: 'Veg' } }
    ];

    for (let i = 0; i < beverages.length; i++) {
      const bev = beverages[i];
      const prodId = 'prod_' + crypto.randomBytes(8).toString('hex');
      
      await sequelize.query(`
        INSERT INTO "Products" ("id", "catalogueId", "integrationId", "name", "description", "price", "currency", "sku", "quantity", "isActive", "isDeleted", "createdAt", "updatedAt", "category", "specifications", "imageUrls", "discountPrice")
        VALUES (:id, :catalogueId, :integrationId, :name, :description, :price, :currency, :sku, :quantity, :isActive, false, :now, :now, :category, :specifications, '[]'::jsonb, 0);
      `, {
        replacements: {
          id: prodId,
          catalogueId: catalogueId,
          integrationId: integrationId,
          name: bev.name,
          description: bev.desc,
          price: bev.price,
          currency: 'INR',
          sku: bev.sku,
          quantity: 250,
          isActive: true,
          now: now,
          category: bev.category,
          specifications: JSON.stringify(bev.specs)
        }
      });
      console.log(`Inserted Beverage: ${bev.name} (${prodId})`);
    }

    console.log('--- BEVERAGES SEEDING COMPLETE ---');
    process.exit(0);
  } catch (e) {
    console.error('ERROR DURING BEVERAGES SEEDING:', e);
    process.exit(1);
  }
}
run();

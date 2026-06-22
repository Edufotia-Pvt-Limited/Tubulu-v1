const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');
const Catalogue = require('../Models/Catalogue.pg');
const Product = require('../Models/Product.pg');

async function seedMerchant() {
    try {
        await sequelize.authenticate();
        console.log('Connected to Postgres');

        // 1. Create a Merchant Integration with +91 prefix
        const [integration, created] = await Integration.findOrCreate({
            where: { phoneNumber: '+918888888888' },
            defaults: {
                integrationName: 'Test Coffee Shop',
                description: 'Best coffee in town',
                isActive: true,
                isApproved: true,
                isOnboarded: true,
                isTubuluAppSetupDone: true,
                category: 'RETAIL',
                verticalType: 'FB'
            }
        });

        if (created) {
            console.log('Merchant created');
        } else {
            console.log('Merchant already exists');
        }

        // 2. Create a Catalogue for the Merchant
        const [catalogue, catCreated] = await Catalogue.findOrCreate({
            where: { integrationId: integration.id, name: 'Main Menu' },
            defaults: {
                id: require('uuid').v4(),
                isActive: true,
                description: 'Our primary coffee and snacks menu'
            }
        });

        if (catCreated) {
            console.log('Catalogue created');
        }

        // 3. Create some Products
        const productsCount = await Product.count({ where: { catalogueId: catalogue.id } });
        if (productsCount === 0) {
            await Product.bulkCreate([
                {
                    id: require('uuid').v4(),
                    sku: 'COFFEE-001',
                    name: 'Espresso',
                    catalogueId: catalogue.id,
                    integrationId: integration.id,
                    price: 120,
                    quantity: 100,
                    isActive: true,
                    description: 'Strong and bold shot',
                    imageUrls: ['https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=200']
                },
                {
                    id: require('uuid').v4(),
                    sku: 'COFFEE-002',
                    name: 'Cappuccino',
                    catalogueId: catalogue.id,
                    integrationId: integration.id,
                    price: 180,
                    quantity: 50,
                    isActive: true,
                    description: 'Frothy and creamy',
                    imageUrls: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200']
                },
                {
                    id: require('uuid').v4(),
                    sku: 'SNACK-001',
                    name: 'Blueberry Muffin',
                    catalogueId: catalogue.id,
                    integrationId: integration.id,
                    price: 150,
                    quantity: 20,
                    isActive: true,
                    description: 'Freshly baked',
                    imageUrls: ['https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?w=200']
                }
            ]);
            console.log('Sample products created');
        }

        console.log('\n--- Login Details (UPDATED) ---');
        console.log('Phone Number: +918888888888');
        console.log('OTP: 123456');
        console.log('------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding merchant:', error);
        process.exit(1);
    }
}

seedMerchant();

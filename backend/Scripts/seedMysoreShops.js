const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');
const Catalogue = require('../Models/Catalogue.pg');
const Product = require('../Models/Product.pg');
const { v4: uuidv4 } = require('uuid');

async function seedMysoreShops() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to local PostgreSQL database.');

        const centerLat = 12.3237008;
        const centerLng = 76.6022778;

        const stores = [
            {
                phoneNumber: '+919900000201',
                name: 'Mysore Royal Kitchen (Vijayanagar)',
                description: 'Authentic Mysore Masala Dosa, Kesari Bath, Veg Pulav, and traditional filter coffee.',
                logo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3245, // ~120m away
                longitude: 76.6030,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'MRK-COF-001', name: 'Mysore Special Filter Coffee', price: 30, desc: 'Rich, hot filter coffee brewed with fresh chicory blend.', dietary: 'veg' },
                    { sku: 'MRK-SNK-002', name: 'Authentic Mysore Masala Dosa', price: 90, desc: 'Dosa smeared with signature spicy red garlic chutney, filled with potato mash and dollop of butter.', dietary: 'veg' },
                    { sku: 'MRK-SNK-003', name: 'Kesari Bath', price: 50, desc: 'Sweet semolina pudding flavored with ghee, cardamom, saffron, and loaded with cashew raisins.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000202',
                name: 'Vijayanagar Organic Groceries',
                description: 'Earthy premium fresh fruits, organic local vegetables, unpolished pulses, and cold-pressed oils.',
                logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3225, // ~160m away
                longitude: 76.6015,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'VOG-VEG-001', name: 'Fresh Nanjangud Bananas (1 Dozen)', price: 80, desc: 'Geographical Indication (GI) tagged sweet local bananas from Mysuru district.', dietary: 'veg' },
                    { sku: 'VOG-VEG-002', name: 'Organic Sona Masuri Rice (5kg)', price: 320, desc: 'Aged, lightweight and aromatic unpolished Sona Masuri rice.', dietary: 'veg' },
                    { sku: 'VOG-OIL-003', name: 'Cold-Pressed Groundnut Oil (1L)', price: 210, desc: '100% natural, wood-pressed pure groundnut oil.', dietary: 'veg' },
                    { sku: 'VOG-EGG-004', name: 'Organic Country Eggs (Pack of 6)', price: 60, desc: 'Country chicken eggs, high protein and natural.', dietary: 'non-veg' }
                ]
            },
            {
                phoneNumber: '+919900000203',
                name: 'Chamundi Pure Veg Restaurant',
                description: 'Delectable South Indian meals, North Indian curries, fresh tandoori roti, and refreshing fruit juices.',
                logo: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3255, // ~300m away
                longitude: 76.6000,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'CPV-MEAL-001', name: 'Royal Chamundi South Meals', price: 150, desc: 'Rice, Sambar, Rasam, two dry curries, papad, curd, sweet, and pickle.', dietary: 'veg' },
                    { sku: 'CPV-CUR-002', name: 'Paneer Butter Masala & Roti Combo', price: 180, desc: 'Creamy paneer curry served with 2 hot butter tandoori rotis.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000204',
                name: 'Royal Heritage Supermarket',
                description: 'Convenient hypermarket for daily dairy products, fresh bakery bread, packaged foods, and household cleaning supplies.',
                logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3215, // ~350m away
                longitude: 76.6045,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'RHS-DY-001', name: 'Nandini GoodLife Toned Milk (1L)', price: 54, desc: 'UHT processed pasteurized toned milk, long shelf life.', dietary: 'veg' },
                    { sku: 'RHS-BAK-002', name: 'Fresh Sandwich Whole Wheat Bread', price: 45, desc: 'Freshly baked sliced whole wheat bread.', dietary: 'veg' },
                    { sku: 'RHS-SNC-003', name: 'Mysore Pak Premium Box (250g)', price: 120, desc: 'Rich, crumbly and melt-in-mouth traditional sweet made of ghee, gram flour, and sugar.', dietary: 'veg' },
                    { sku: 'RHS-EGG-004', name: 'Farm Eggs (Pack of 6)', price: 45, desc: 'Fresh table eggs from certified farms.', dietary: 'non-veg' }
                ]
            }
        ];

        for (const store of stores) {
            console.log(`\nProcessing Mysore store: ${store.name}`);

            const [integration, created] = await Integration.findOrCreate({
                where: { phoneNumber: store.phoneNumber },
                defaults: {
                    integrationName: store.name,
                    description: store.description,
                    logo: store.logo,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    category: store.category,
                    verticalType: store.verticalType,
                    isActive: true,
                    isApproved: true,
                    isOnboarded: true,
                    isTubuluAppSetupDone: true,
                    role: 'merchant_admin'
                }
            });

            if (created) {
                console.log(`- Created merchant integration with ID: ${integration.id}`);
            } else {
                await integration.update({
                    integrationName: store.name,
                    description: store.description,
                    logo: store.logo,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    verticalType: store.verticalType,
                    category: store.category,
                    isActive: true,
                    isApproved: true,
                    isOnboarded: true,
                    isTubuluAppSetupDone: true
                });
                console.log(`- Merchant already exists. Coordinates & details updated.`);
            }

            const [catalogue] = await Catalogue.findOrCreate({
                where: { integrationId: integration.id, name: 'Main Catalogue' },
                defaults: {
                    id: uuidv4(),
                    isActive: true,
                    description: `Primary offering catalogue for ${store.name}`
                }
            });

            // Re-seed products
            await Product.destroy({ where: { catalogueId: catalogue.id } });

            const productsToInsert = store.products.map(p => ({
                id: uuidv4(),
                sku: p.sku,
                name: p.name,
                description: p.desc,
                price: p.price,
                discountPrice: Math.round(p.price * 0.95),
                quantity: 100,
                isActive: true,
                dietaryType: p.dietary,
                imageUrls: [store.logo],
                catalogueId: catalogue.id,
                integrationId: integration.id,
                currency: 'INR',
                specifications: { unit: p.name.includes('500g') || p.name.includes('250g') ? 'g' : p.name.includes('1kg') || p.name.includes('5kg') ? 'kg' : p.name.includes('1L') ? 'L' : 'Pc' }
            }));

            await Product.bulkCreate(productsToInsert);
            console.log(`- Successfully seeded ${productsToInsert.length} products.`);
        }

        console.log('\n🎉 Successfully seeded Mysore shops near Vijayanagar 3rd Stage!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding Mysore shops:', err);
        process.exit(1);
    }
}

seedMysoreShops();

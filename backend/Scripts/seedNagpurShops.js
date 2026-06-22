const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');
const Catalogue = require('../Models/Catalogue.pg');
const Product = require('../Models/Product.pg');
const { v4: uuidv4 } = require('uuid');

async function seedNagpurShops() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to local PostgreSQL database.');

        const centerLat = 21.14765;
        const centerLng = 79.08375;

        const stores = [
            {
                phoneNumber: '+919900000101',
                name: 'Nagpur Coffee House (Tilak Nagar)',
                description: 'Famous filter coffee, fresh samosas, idli, dosa, and classic local Indian breakfast.',
                logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop',
                latitude: 21.1480, // ~100m away
                longitude: 79.0840,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'NCH-COF-001', name: 'Special South Indian Filter Coffee', price: 40, desc: 'Freshly brewed aromatic chicory-coffee blend with hot frothed milk.', dietary: 'veg' },
                    { sku: 'NCH-SNK-002', name: 'Nagpur Tari Samosa (2 Pcs)', price: 35, desc: 'Crispy potato samosas served with spicy chickpea (tari) gravy.', dietary: 'veg' },
                    { sku: 'NCH-SNK-003', name: 'Butter Masala Dosa', price: 80, desc: 'Crispy rice-lentil crepe stuffed with spiced potato mash, served with coconut chutney.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000102',
                name: 'Gokulpeth Daily Grocery Mart',
                description: 'Local neighborhood supermarket supplying fresh farm vegetables, pantry staples, spices, and household essentials.',
                logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
                latitude: 21.1450, // ~400m away
                longitude: 79.0810,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'GGM-VEG-001', name: 'Fresh Nasik Red Onions (1kg)', price: 45, desc: 'Premium, pungent local red onions from Maharashtra.', dietary: 'veg' },
                    { sku: 'GGM-VEG-002', name: 'Organic Country Tomatoes (1kg)', price: 50, desc: 'Vine-ripened, juicy local farm tomatoes.', dietary: 'veg' },
                    { sku: 'GGM-PNT-003', name: 'Unpolished Toor Dal (1kg)', price: 160, desc: 'High-protein, unpolished premium split pigeon peas.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000103',
                name: 'Dharampeth Sweet Palace',
                description: ' Nagpur Special Orange Burfi, fresh Kaju Katli, Bengali sweets, and evening hot chaat snacks.',
                logo: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600&auto=format&fit=crop',
                latitude: 21.1500, // ~400m away
                longitude: 79.0870,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'DSP-SWT-001', name: 'Nagpur Special Orange Burfi (500g)', price: 280, desc: 'Made from rich mawa and fresh Nagpur orange pulp.', dietary: 'veg' },
                    { sku: 'DSP-SWT-002', name: 'Premium Kaju Katli (250g)', price: 250, desc: 'Traditional cashew fudge dessert made with silver leaf topping.', dietary: 'veg' },
                    { sku: 'DSP-SNK-003', name: 'Hot Raj Kachori Chaat', price: 90, desc: 'Large crispy kachori stuffed with sprouts, potatoes, sweet yogurt, and tangy chutneys.', dietary: 'veg' }
                ]
            }
        ];

        for (const store of stores) {
            console.log(`\nProcessing Nagpur store: ${store.name}`);

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
                specifications: { unit: p.name.includes('500g') || p.name.includes('250g') ? 'g' : p.name.includes('1kg') ? 'kg' : 'Pc' }
            }));

            await Product.bulkCreate(productsToInsert);
            console.log(`- Successfully seeded ${productsToInsert.length} products.`);
        }

        console.log('\n🎉 Successfully seeded Nagpur shops near Law College Square!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding Nagpur shops:', err);
        process.exit(1);
    }
}

seedNagpurShops();

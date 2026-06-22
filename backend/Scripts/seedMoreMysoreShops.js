const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');
const Catalogue = require('../Models/Catalogue.pg');
const Product = require('../Models/Product.pg');
const { v4: uuidv4 } = require('uuid');

async function seedMoreMysoreShops() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to local PostgreSQL database.');

        const centerLat = 12.3237008;
        const centerLng = 76.6022778;

        const stores = [
            // --- 5 FB Stores ---
            {
                phoneNumber: '+919900000301',
                name: 'Mysore Filter Coffee House',
                description: 'Hot filter coffee, chicory blends, and traditional south Indian breakfast bites.',
                logo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3239,
                longitude: 76.6035,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'MFH-COF-01', name: 'Premium Degree Filter Coffee', price: 40, desc: 'Brewed with high-grade Peaberry and chicory blend.', dietary: 'veg' },
                    { sku: 'MFH-SNK-02', name: 'Steaming Rava Idli (2 Pcs)', price: 60, desc: 'Served with ghee, potato sagu, and coconut chutney.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000302',
                name: 'Cafe Heritage & Bakery',
                description: 'Artisanal breads, cream buns, hot pastries, and specialty tea.',
                logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3242,
                longitude: 76.6010,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'CHB-BAK-01', name: 'Honey Cake (Slice)', price: 70, desc: 'Soft sponge cake soaked in honey syrup, topped with jam and coconut flakes.', dietary: 'veg' },
                    { sku: 'CHB-BAK-02', name: 'Fresh Cream Bun', price: 35, desc: 'Sweet bun stuffed with fresh whipped cream and sugar dust.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000303',
                name: 'Chamundi Chat Center',
                description: 'Spicy Masala Puri, Sev Puri, Dahi Puri, and mouthwatering local chats.',
                logo: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3220,
                longitude: 76.6025,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'CCC-CHT-01', name: 'Special Mysore Masala Puri', price: 50, desc: 'Crushed puris drowned in hot spiced peas gravy, topped with onions, sev, and coriander.', dietary: 'veg' },
                    { sku: 'CCC-CHT-02', name: 'Dahi Puri Platter', price: 60, desc: 'Puris loaded with potato, sweet yogurt, green and sweet chutneys.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000304',
                name: 'Idli Mane Vijayanagar',
                description: 'Softest Tatte Idlis, Button Idlis with sambar, and home-style podi dosa.',
                logo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3250,
                longitude: 76.6040,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'IMV-IDL-01', name: 'Mysore Tatte Idli (1 Pc)', price: 45, desc: 'Large plate-sized soft idli served with butter, sambar, and chutney.', dietary: 'veg' },
                    { sku: 'IMV-DOS-02', name: 'Spicy Ghee Podi Dosa', price: 95, desc: 'Crispy rice crepe sprinkled with spicy gunpowder and ghee.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000305',
                name: 'Biryani Durbar Mysuru',
                description: 'Fragrant Donne Biryani, Kebabs, and traditional spices.',
                logo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3228,
                longitude: 76.6005,
                category: 'Food',
                verticalType: 'FB',
                products: [
                    { sku: 'BDM-BRY-01', name: 'Veg Donne Biryani Special', price: 160, desc: 'Jeera samba rice cooked with herbs, mint, and soya chunks.', dietary: 'veg' },
                    { sku: 'BDM-KBB-02', name: 'Crispy Veg Seekh Kebab', price: 130, desc: 'Mixed veg seekh kebabs grilled to perfection.', dietary: 'veg' }
                ]
            },

            // --- 5 Grocery Stores ---
            {
                phoneNumber: '+919900000401',
                name: 'Sri Manjunatha Provision Store',
                description: 'Local neighborhood grocery store for spices, flours, grains, and kitchen essentials.',
                logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3230,
                longitude: 76.6042,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'SMP-GR-01', name: 'Premium Toor Dal (1kg)', price: 170, desc: 'Unpolished, pesticide-free local yellow split pigeon peas.', dietary: 'veg' },
                    { sku: 'SMP-GR-02', name: 'Pure Cow Ghee (500ml)', price: 340, desc: 'Traditional aroma, clarified pure cow butter ghee.', dietary: 'veg' },
                    { sku: 'SMP-EGG-03', name: 'Fresh White Eggs (Pack of 12)', price: 80, desc: 'Clean, graded farm-fresh white eggs.', dietary: 'non-veg' }
                ]
            },
            {
                phoneNumber: '+919900000402',
                name: 'Vijayanagar Organic Farm Fresh',
                description: 'Direct-from-farm seasonal fruits, leafy greens, and exotic vegetables.',
                logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3248,
                longitude: 76.6018,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'VFF-VEG-01', name: 'Fresh Mysore Beetroot (1kg)', price: 60, desc: 'Sweet, organic local beetroots.', dietary: 'veg' },
                    { sku: 'VFF-FRT-02', name: 'Coorg Honey Orange (1kg)', price: 120, desc: 'Tangy, sweet and juicy premium oranges from Coorg region.', dietary: 'veg' },
                    { sku: 'VFF-EGG-03', name: 'Farm-Fresh Organic Eggs (Pack of 6)', price: 48, desc: 'Fresh, organic brown eggs direct from local poultry farms.', dietary: 'non-veg' }
                ]
            },
            {
                phoneNumber: '+919900000403',
                name: 'Heritage Daily & Grocery',
                description: 'Fresh paneer, buttermilk, cheese, premium eggs, and morning essentials.',
                logo: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3218,
                longitude: 76.6030,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'HDG-DY-01', name: 'Fresh Malai Paneer (200g)', price: 95, desc: 'Soft, creamy paneer made from pure whole milk.', dietary: 'veg' },
                    { sku: 'HDG-DY-02', name: 'Spiced Buttermilk (200ml)', price: 20, desc: 'Chilled buttermilk tempered with ginger, coriander, and curry leaves.', dietary: 'veg' },
                    { sku: 'HDG-EGG-03', name: 'Premium Farm Eggs (Pack of 6)', price: 42, desc: 'High-quality farm-fresh white eggs.', dietary: 'non-veg' }
                ]
            },
            {
                phoneNumber: '+919900000404',
                name: 'Cauvery Supermart',
                description: 'One-stop shop for packaged juices, tea leaf dust, dry fruits, and cleaning supplies.',
                logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3252,
                longitude: 76.6008,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'CSM-TEA-01', name: 'Wagh Bakri Leaf Tea (1kg)', price: 420, desc: 'Strong, premium quality Assam tea leaf dust.', dietary: 'veg' },
                    { sku: 'CSM-NUT-02', name: 'Premium Kaju Cashews (250g)', price: 240, desc: 'Large, clean and crunchy raw cashew nuts.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000405',
                name: 'Mysuru Organic & Groceries',
                description: 'Cold pressed oils, millets, brown rice, rock salt, and healthy alternatives.',
                logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
                latitude: 12.3235,
                longitude: 76.6050,
                category: 'Grocery',
                verticalType: 'GROCERY',
                products: [
                    { sku: 'MOG-OIL-01', name: 'Wood-Pressed Coconut Oil (1L)', price: 260, desc: 'Cold pressed, aromatic edible grade coconut oil.', dietary: 'veg' },
                    { sku: 'MOG-MIL-02', name: 'Organic Ragi Flour (1kg)', price: 65, desc: 'Finely milled local finger millet flour, rich in calcium.', dietary: 'veg' }
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
                specifications: { unit: p.name.includes('500g') || p.name.includes('250g') ? 'g' : p.name.includes('1kg') || p.name.includes('5kg') ? 'kg' : p.name.includes('1L') || p.name.includes('200ml') ? 'L' : 'Pc' }
            }));

            await Product.bulkCreate(productsToInsert);
            console.log(`- Successfully seeded ${productsToInsert.length} products.`);
        }

        console.log('\n🎉 Successfully seeded 5 FB & 5 Grocery Mysore shops near Vijayanagar 3rd Stage!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding Mysore shops:', err);
        process.exit(1);
    }
}

seedMoreMysoreShops();

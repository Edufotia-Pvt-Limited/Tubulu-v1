const { sequelize, User, Integration, Catalogue, Product, Country, State, City } = require('../Utils/Postgres');
const { generateUUID } = require('../Utils/Helper');
const { v4: uuidv4 } = require('uuid');

async function seedPuducherry() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to local PostgreSQL database.');

        const stateId = 'fb6a643d-95f4-434c-9738-7ccc6963cdca';
        const cityId = '39f91e8c-15bd-44fc-a6d0-6c9600e3e00f';

        // 1. Create or Update City Manager
        console.log('👤 Processing City Manager...');
        const cmEmail = 'puducherry_cm@tubulu.com';
        const cmPhone = '+919900000012';
        
        let cmUser = await User.findOne({ where: { email: cmEmail } });
        const cmData = {
            email: cmEmail,
            userName: cmEmail,
            phoneNumber: cmPhone,
            password: '2123',
            role: 'city_manager',
            firstName: 'Puducherry',
            lastName: 'City',
            scopedStateId: stateId,
            scopedCityId: cityId,
            userVerified: true
        };

        if (cmUser) {
            await cmUser.update(cmData);
            console.log('✅ City Manager updated successfully.');
        } else {
            await User.create({
                uuid: generateUUID(),
                ...cmData
            });
            console.log('✅ City Manager created successfully.');
        }

        // 2. Fetch India Country ID
        const india = await Country.findOne({ where: { name: 'India' } });
        const countryId = india ? india.id : null;

        // 3. Define 10 Stores (5 Food, 5 Grocery)
        const centerLat = 11.9416;
        const centerLng = 79.8083;

        const stores = [
            // --- FOOD STORES ---
            {
                phoneNumber: '+919900000301',
                name: 'Pondy Crepes & Cafe',
                description: 'Classic French crepes, croissants, baguettes, and fresh hot coffee in a colonial vibe.',
                category: 'Food',
                verticalType: 'FB',
                latOffset: 0.001,
                lngOffset: 0.001,
                products: [
                    { sku: 'PCC-001', name: 'French Butter Croissant', price: 90, desc: 'Flaky, buttery baked pastry.', dietary: 'veg' },
                    { sku: 'PCC-002', name: 'Nutella Banana Crepe', price: 160, desc: 'Fresh crepe loaded with Nutella and fresh banana slices.', dietary: 'veg' },
                    { sku: 'PCC-003', name: 'Cafe Au Lait', price: 80, desc: 'Fresh French-style hot coffee with milk.', dietary: 'veg' },
                    { sku: 'PCC-004', name: 'Chicken Baguette Sandwich', price: 180, desc: 'Grilled chicken, fresh lettuce, and mayo in a crusty baguette.', dietary: 'non-veg' },
                    { sku: 'PCC-005', name: 'Pain Au Chocolat', price: 100, desc: 'Flaky pastry filled with rich dark chocolate.', dietary: 'veg' },
                    { sku: 'PCC-006', name: 'Caramel Macchiato', price: 110, desc: 'Espresso with steamed milk and sweet caramel drizzle.', dietary: 'veg' },
                    { sku: 'PCC-007', name: 'Spinach & Mushroom Quiche', price: 140, desc: 'Savory egg tart with spinach and cheese.', dietary: 'non-veg' },
                    { sku: 'PCC-008', name: 'Classic Waffle with Maple Syrup', price: 120, desc: 'Golden crispy waffle served with maple syrup.', dietary: 'veg' },
                    { sku: 'PCC-009', name: 'Ice Lemon Tea', price: 60, desc: 'Refreshing iced black tea with fresh lemon juice.', dietary: 'veg' },
                    { sku: 'PCC-010', name: 'Chocolate Fudge Cake Slice', price: 130, desc: 'Rich, moist double chocolate cake.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000302',
                name: 'Sri Kamatchi Non-Veg Mess',
                description: 'Famous spicy Pondy-style biryani, mutton chukka, fish fry, and local non-veg meals.',
                category: 'Food',
                verticalType: 'FB',
                latOffset: -0.0015,
                lngOffset: 0.002,
                products: [
                    { sku: 'SKM-001', name: 'Pondy Mutton Biryani', price: 280, desc: 'Aromatic Seeraga Samba rice cooked with tender mutton.', dietary: 'non-veg' },
                    { sku: 'SKM-002', name: 'Spicy Mutton Chukka', price: 220, desc: 'Dry pan-fried mutton tossed in black pepper and local spices.', dietary: 'non-veg' },
                    { sku: 'SKM-003', name: 'Pondy Fish Fry (Vanjaram)', price: 190, desc: 'Vanjaram fish slice coated with spicy masala and tawa fried.', dietary: 'non-veg' },
                    { sku: 'SKM-004', name: 'Chicken 65 (Boneless)', price: 160, desc: 'Crispy fried spicy boneless chicken nuggets.', dietary: 'non-veg' },
                    { sku: 'SKM-005', name: 'Egg Parotta Combo (2 Pcs)', price: 120, desc: 'Soft layered parottas served with spicy chicken salna and egg.', dietary: 'non-veg' },
                    { sku: 'SKM-006', name: 'Mutton Bone Soup', price: 90, desc: 'Rich, peppery extract of mutton bones.', dietary: 'non-veg' },
                    { sku: 'SKM-007', name: 'Pepper Chicken Dry', price: 180, desc: 'Chicken chunks tossed with onions, green chillies, and pepper.', dietary: 'non-veg' },
                    { sku: 'SKM-008', name: 'Special Meals (Non-Veg)', price: 250, desc: 'Rice, mutton gravy, chicken gravy, fish gravy, rasam, and curd.', dietary: 'non-veg' },
                    { sku: 'SKM-009', name: 'Prawn Masala Fry', price: 210, desc: 'Fresh prawns stir-fried in a rich tomato-onion masala.', dietary: 'non-veg' },
                    { sku: 'SKM-010', name: 'Thums Up (Can)', price: 40, desc: 'Refreshing carbonated soft drink.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000303',
                name: 'Auroville Vegan Bites',
                description: 'Earthy organic salads, gluten-free vegan pizzas, raw cacao smoothies, and sugar-free desserts.',
                category: 'Food',
                verticalType: 'FB',
                latOffset: 0.0025,
                lngOffset: -0.001,
                products: [
                    { sku: 'AVB-001', name: 'Organic Quinoa Salad', price: 180, desc: 'Fluffy quinoa, cherry tomatoes, cucumbers, and lemon tahini dressing.', dietary: 'veg' },
                    { sku: 'AVB-002', name: 'Vegan Pesto Pizza (Personal)', price: 240, desc: 'Gluten-free crust with house-made basil pesto and vegan cashew cheese.', dietary: 'veg' },
                    { sku: 'AVB-003', name: 'Raw Cacao Smoothie', price: 130, desc: 'Blended banana, raw cacao, almond milk, and dates.', dietary: 'veg' },
                    { sku: 'AVB-004', name: 'Avocado Toast', price: 150, desc: 'Mashed avocado on sourdough bread with pumpkin seeds.', dietary: 'veg' },
                    { sku: 'AVB-005', name: 'Tofu Buddha Bowl', price: 210, desc: 'Brown rice, grilled tofu, edamame, purple cabbage, and peanut sauce.', dietary: 'veg' },
                    { sku: 'AVB-006', name: 'Cold Pressed Green Juice', price: 90, desc: 'Spinach, cucumber, apple, celery, and ginger juice.', dietary: 'veg' },
                    { sku: 'AVB-007', name: 'Almond ButterEnergy Balls', price: 80, desc: 'Pack of 3 healthy oats, dates, and almond butter energy bites.', dietary: 'veg' },
                    { sku: 'AVB-008', name: 'Vegan Chocolate Brownie', price: 110, desc: 'Rich fudgy chocolate brownie made without eggs or dairy.', dietary: 'veg' },
                    { sku: 'AVB-009', name: 'Kombucha (Apple Ginger)', price: 120, desc: 'Probiotic fermented tea drink.', dietary: 'veg' },
                    { sku: 'AVB-010', name: 'Sweet Potato Fries', price: 100, desc: 'Baked sweet potato fries served with vegan mayo.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000304',
                name: 'Coastal Curry House',
                description: 'Traditional coastal fish curries, crab masala, appam, and coconut-based coastal delicacies.',
                category: 'Food',
                verticalType: 'FB',
                latOffset: -0.003,
                lngOffset: -0.002,
                products: [
                    { sku: 'CCH-001', name: 'Traditional Coastal Fish Curry', price: 240, desc: 'Fish cooked in sour tamarind and thick coconut milk gravy.', dietary: 'non-veg' },
                    { sku: 'CCH-002', name: 'Appam (2 Pcs) with Coconut Milk', price: 90, desc: 'Soft-centered laced pancakes served with sweet coconut milk.', dietary: 'veg' },
                    { sku: 'CCH-003', name: 'Spicy Crab Masala', price: 320, desc: 'Fresh crab cooked in dry roast pepper masala gravy.', dietary: 'non-veg' },
                    { sku: 'CCH-004', name: 'Squid Butter Pepper Garlic', price: 200, desc: 'Stir-fried squid in rich butter, garlic, and fresh ground pepper.', dietary: 'non-veg' },
                    { sku: 'CCH-005', name: 'Neer Dosa (3 Pcs) with Fish Gravy', price: 160, desc: 'Paper-thin rice crepes served with spicy fish curry.', dietary: 'non-veg' },
                    { sku: 'CCH-006', name: 'Prawn Biryani', price: 260, desc: 'Aromatic basmati rice cooked with fresh spicy prawns.', dietary: 'non-veg' },
                    { sku: 'CCH-007', name: 'Coconut Souffle', price: 110, desc: 'Light and airy dessert flavored with tender coconut.', dietary: 'veg' },
                    { sku: 'CCH-008', name: 'Fish Head Curry (Family Size)', price: 420, desc: 'Authentic village-style fish head curry.', dietary: 'non-veg' },
                    { sku: 'CCH-009', name: 'Kerala Parotta (2 Pcs)', price: 50, desc: 'Layered flaky flatbread.', dietary: 'veg' },
                    { sku: 'CCH-010', name: 'Fresh Lime Soda', price: 50, desc: 'Refreshing lime drink, sweet and salted.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000305',
                name: 'The Lighthouse Roof Deck',
                description: 'Premium woodfired pizzas, loaded nachos, mocktails, cocktails, and continental finger foods.',
                category: 'Food',
                verticalType: 'FB',
                latOffset: 0.0035,
                lngOffset: 0.003,
                products: [
                    { sku: 'TLH-001', name: 'Woodfired Margherita Pizza', price: 260, desc: 'Classic sourdough pizza with fresh mozzarella and basil.', dietary: 'veg' },
                    { sku: 'TLH-002', name: 'Lighthouse Loaded Nachos', price: 180, desc: 'Tortilla chips topped with cheese sauce, salsa, and jalapenos.', dietary: 'veg' },
                    { sku: 'TLH-003', name: 'Blue Lagoon Mocktail', price: 110, desc: 'Refreshing blue curacao drink with lime and sprite.', dietary: 'veg' },
                    { sku: 'TLH-004', name: 'BBQ Chicken Pizza (12 inch)', price: 340, desc: 'Smoked BBQ chicken, red onions, and mozzarella.', dietary: 'non-veg' },
                    { sku: 'TLH-005', name: 'Garlic Bread with Cheese', price: 120, desc: 'Toasted baguette slices with garlic butter and melted cheese.', dietary: 'veg' },
                    { sku: 'TLH-006', name: 'Crispy Onion Rings', price: 90, desc: 'Golden batter-fried onion rings with garlic dip.', dietary: 'veg' },
                    { sku: 'TLH-007', name: 'Penne Arrabiata Pasta', price: 220, desc: 'Pasta tossed in spicy tomato sauce, olives, and basil.', dietary: 'veg' },
                    { sku: 'TLH-008', name: 'Tiramisu Cup', price: 150, desc: 'Coffee-flavoured Italian dessert.', dietary: 'veg' },
                    { sku: 'TLH-009', name: 'Chicken Wings (6 Pcs)', price: 190, desc: 'Crispy fried wings tossed in hot buffalo sauce.', dietary: 'non-veg' },
                    { sku: 'TLH-010', name: 'Virgin Mojito', price: 100, desc: 'Mint, lime, sugar, and club soda.', dietary: 'veg' }
                ]
            },

            // --- GROCERY STORES ---
            {
                phoneNumber: '+919900000306',
                name: 'Pondy Organic Fields',
                description: 'Earthy organic farm-fresh vegetables, seasonal local fruits, and country poultry products.',
                category: 'Grocery',
                verticalType: 'GROCERY',
                latOffset: 0.0005,
                lngOffset: -0.003,
                products: [
                    { sku: 'POF-001', name: 'Organic Red Onions (1kg)', price: 45, desc: 'Farm-fresh organic red onions.', dietary: 'veg' },
                    { sku: 'POF-002', name: 'Country Chicken Eggs (Pack of 6)', price: 70, desc: 'High-protein country eggs.', dietary: 'non-veg' },
                    { sku: 'POF-003', name: 'Fresh Country Tomatoes (1kg)', price: 50, desc: 'Juicy, vine-ripened organic tomatoes.', dietary: 'veg' },
                    { sku: 'POF-004', name: 'Local Sweet Papaya (1 Pc)', price: 60, desc: 'Organic locally grown sweet papaya.', dietary: 'veg' },
                    { sku: 'POF-005', name: 'Organic Potatoes (1kg)', price: 40, desc: 'Freshly harvested soil potatoes.', dietary: 'veg' },
                    { sku: 'POF-006', name: 'Green Chillies (250g)', price: 20, desc: 'Spicy fresh green chillies.', dietary: 'veg' },
                    { sku: 'POF-007', name: 'Organic Ladies Finger (500g)', price: 30, desc: 'Tender okra pods.', dietary: 'veg' },
                    { sku: 'POF-008', name: 'Local Lemon Pack (5 Pcs)', price: 25, desc: 'Juicy fresh local lemons.', dietary: 'veg' },
                    { sku: 'POF-009', name: 'Fresh Mint Leaves (Bunch)', price: 15, desc: 'Aromatic green mint leaves.', dietary: 'veg' },
                    { sku: 'POF-010', name: 'Organic Carrots (500g)', price: 35, desc: 'Sweet, orange crunch carrots.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000307',
                name: 'Sri Kamatchi Provision Stores',
                description: 'Bulk pulses, premium rice bags, spices, cooking oils, and traditional Indian dry goods.',
                category: 'Grocery',
                verticalType: 'GROCERY',
                latOffset: -0.002,
                lngOffset: 0.0015,
                products: [
                    { sku: 'KPS-001', name: 'Toor Dal Premium (1kg)', price: 160, desc: 'Unpolished premium yellow split peas.', dietary: 'veg' },
                    { sku: 'KPS-002', name: 'Gold Winner Sunflower Oil (1L)', price: 135, desc: 'Refined cooking sunflower oil.', dietary: 'veg' },
                    { sku: 'KPS-003', name: 'Seeraga Samba Rice (1kg)', price: 110, desc: 'Aromatic rice preferred for South Indian biryanis.', dietary: 'veg' },
                    { sku: 'KPS-004', name: 'Aashirvaad Atta (5kg)', price: 260, desc: '100% whole wheat flour.', dietary: 'veg' },
                    { sku: 'KPS-005', name: 'Tata Salt (1kg)', price: 28, desc: 'Iodized vacuum evaporated salt.', dietary: 'veg' },
                    { sku: 'KPS-006', name: 'Urad Dal Gota (1kg)', price: 150, desc: 'Whole black gram skinless.', dietary: 'veg' },
                    { sku: 'KPS-007', name: 'Gopal Sambar Powder (100g)', price: 35, desc: 'Traditional South Indian spice mix.', dietary: 'veg' },
                    { sku: 'KPS-008', name: 'Chana Dal (1kg)', price: 100, desc: 'Polished split baby chickpeas.', dietary: 'veg' },
                    { sku: 'KPS-009', name: 'Mustard Seeds (100g)', price: 20, desc: 'Black mustard seeds for tempering.', dietary: 'veg' },
                    { sku: 'KPS-010', name: 'Cumin Seeds (100g)', price: 45, desc: 'Aromatic whole cumin seeds.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000308',
                name: 'Nandini Dairy & Bakery Hub',
                description: 'Official distributor for Nandini milk, curd, butter, ghee, cheese, and fresh milk sweets.',
                category: 'Grocery',
                verticalType: 'GROCERY',
                latOffset: 0.002,
                lngOffset: 0.0025,
                products: [
                    { sku: 'NDH-001', name: 'Nandini Toned Milk (500ml)', price: 23, desc: 'Fresh pasteurized toned milk.', dietary: 'veg' },
                    { sku: 'NDH-002', name: 'Nandini Curd Packet (500g)', price: 30, desc: 'Thick, creamy set curd.', dietary: 'veg' },
                    { sku: 'NDH-003', name: 'Nandini Pure Ghee (200ml)', price: 140, desc: 'Traditional aroma cow ghee.', dietary: 'veg' },
                    { sku: 'NDH-004', name: 'Nandini Salted Butter (100g)', price: 56, desc: 'Creamy table butter.', dietary: 'veg' },
                    { sku: 'NDH-005', name: 'Fresh Paneer Block (200g)', price: 90, desc: 'Soft, fresh milk paneer.', dietary: 'veg' },
                    { sku: 'NDH-006', name: 'Nandini GoodLife Milk (1L)', price: 54, desc: 'UHT long life milk pack.', dietary: 'veg' },
                    { sku: 'NDH-007', name: 'Milk Peda Box (250g)', price: 110, desc: 'Traditional milk fudge sweet.', dietary: 'veg' },
                    { sku: 'NDH-008', name: 'Nandini Cheese Slices (200g)', price: 130, desc: 'Pack of 10 processed cheese slices.', dietary: 'veg' },
                    { sku: 'NDH-009', name: 'Fresh Cream (250ml)', price: 75, desc: 'Sterilized dairy fresh cream.', dietary: 'veg' },
                    { sku: 'NDH-010', name: 'Sweet Lassi (200ml)', price: 20, desc: 'Chilled sweet milk drink.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000309',
                name: 'Auroville Organic Grainery',
                description: 'Premium unpolished millets, cold-pressed oils, wild honey, and natural cosmetics.',
                category: 'Grocery',
                verticalType: 'GROCERY',
                latOffset: -0.004,
                lngOffset: -0.0035,
                products: [
                    { sku: 'AOG-001', name: 'Cold-Pressed Coconut Oil (1L)', price: 280, desc: 'Wood-pressed pure virgin coconut oil.', dietary: 'veg' },
                    { sku: 'AOG-002', name: 'Wild Forest Honey (250g)', price: 190, desc: '100% pure raw forest honey.', dietary: 'veg' },
                    { sku: 'AOG-003', name: 'Unpolished Foxtail Millet (1kg)', price: 120, desc: 'Gluten-free organic millet grains.', dietary: 'veg' },
                    { sku: 'AOG-004', name: 'Cold-Pressed Sesame Oil (1L)', price: 340, desc: 'Wood-pressed sesame cooking oil.', dietary: 'veg' },
                    { sku: 'AOG-005', name: 'Brown Basmati Rice (1kg)', price: 150, desc: 'High-fibre organic brown rice.', dietary: 'veg' },
                    { sku: 'AOG-006', name: 'Handmade Aloe Vera Soap', price: 60, desc: 'Natural organic skin soap.', dietary: 'veg' },
                    { sku: 'AOG-007', name: 'Organic Jaggery Powder (1kg)', price: 90, desc: 'Chemical-free natural sweetener.', dietary: 'veg' },
                    { sku: 'AOG-008', name: 'Rock Salt / Indhu Uppu (1kg)', price: 50, desc: 'Unrefined pink rock salt crystals.', dietary: 'veg' },
                    { sku: 'AOG-009', name: 'Organic Ragi Flour (1kg)', price: 70, desc: 'Finger millet flour.', dietary: 'veg' },
                    { sku: 'AOG-010', name: 'Apple Cider Vinegar (500ml)', price: 220, desc: 'Raw unfiltered ACV with mother.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000310',
                name: 'Heritage Gourmet Supermarket',
                description: 'Imported sauces, custom cheeses, ready-to-eat meals, and premium cleaning supplies.',
                category: 'Grocery',
                verticalType: 'GROCERY',
                latOffset: 0.0045,
                lngOffset: -0.004,
                products: [
                    { sku: 'HGS-001', name: 'Barilla Penne Rigate (500g)', price: 150, desc: 'Imported Italian durum wheat pasta.', dietary: 'veg' },
                    { sku: 'HGS-002', name: 'Epigamia Greek Yogurt (Blueberry)', price: 60, desc: 'High protein blueberry Greek yogurt.', dietary: 'veg' },
                    { sku: 'HGS-003', name: 'Hersheys Chocolate Syrup (650g)', price: 230, desc: 'Delicious chocolate flavoring syrup.', dietary: 'veg' },
                    { sku: 'HGS-004', name: 'Maggi 2-Min Noodles (Pack of 12)', price: 168, desc: 'Instant noodles with masala tastemaker.', dietary: 'veg' },
                    { sku: 'HGS-005', name: 'Nutella Hazelnut Spread (350g)', price: 320, desc: 'Sweet cocoa spread with hazelnuts.', dietary: 'veg' },
                    { sku: 'HGS-006', name: 'Oreo Chocolate Biscuits (120g)', price: 35, desc: 'Sandwich cookies with vanilla cream.', dietary: 'veg' },
                    { sku: 'HGS-007', name: 'Heinz Tomato Ketchup (500g)', price: 140, desc: 'Classic rich tomato ketchup.', dietary: 'veg' },
                    { sku: 'HGS-008', name: 'Kelloggs Corn Flakes (500g)', price: 185, desc: 'Crispy golden toasted corn flakes.', dietary: 'veg' },
                    { sku: 'HGS-009', name: 'Amul Cheese Block (200g)', price: 125, desc: 'Pasteurized processed cheese block.', dietary: 'veg' },
                    { sku: 'HGS-010', name: 'Nescafe Classic Coffee (100g)', price: 310, desc: '100% pure instant coffee powder.', dietary: 'veg' }
                ]
            }
        ];

        // 4. Seed Integrations and Products
        for (const store of stores) {
            console.log(`\nProcessing store: ${store.name}`);

            const storeLat = centerLat + store.latOffset;
            const storeLng = centerLng + store.lngOffset;

            const [integration, created] = await Integration.findOrCreate({
                where: { phoneNumber: store.phoneNumber },
                defaults: {
                    integrationName: store.name,
                    description: store.description,
                    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
                    latitude: storeLat,
                    longitude: storeLng,
                    category: store.category,
                    verticalType: store.verticalType,
                    isActive: true,
                    isApproved: true,
                    isOnboarded: true,
                    isTubuluAppSetupDone: true,
                    isDocumentsUploaded: true,
                    role: 'merchant_admin',
                    stateId: stateId,
                    cityId: cityId,
                    countryId: countryId,
                    city: 'Puducherry',
                    state: 'Puducherry',
                    country: 'India'
                }
            });

            if (created) {
                console.log(`- Created merchant integration with ID: ${integration.id}`);
            } else {
                await integration.update({
                    integrationName: store.name,
                    description: store.description,
                    latitude: storeLat,
                    longitude: storeLng,
                    verticalType: store.verticalType,
                    category: store.category,
                    isActive: true,
                    isApproved: true,
                    isOnboarded: true,
                    isTubuluAppSetupDone: true,
                    isDocumentsUploaded: true,
                    stateId: stateId,
                    cityId: cityId,
                    countryId: countryId,
                    city: 'Puducherry',
                    state: 'Puducherry',
                    country: 'India'
                });
                console.log(`- Merchant already exists. Details updated.`);
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
                imageUrls: ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop'],
                catalogueId: catalogue.id,
                integrationId: integration.id,
                currency: 'INR',
                specifications: { unit: p.name.includes('500g') || p.name.includes('250g') ? 'g' : p.name.includes('1kg') || p.name.includes('5kg') ? 'kg' : p.name.includes('1L') ? 'L' : 'Pc' }
            }));

            await Product.bulkCreate(productsToInsert);
            console.log(`- Successfully seeded ${productsToInsert.length} products.`);
        }

        console.log('\n🎉 Puducherry City Manager, Shops, and Products seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seedPuducherry();

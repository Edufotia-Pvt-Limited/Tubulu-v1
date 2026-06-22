const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');
const Catalogue = require('../Models/Catalogue.pg');
const Product = require('../Models/Product.pg');
const { v4: uuidv4 } = require('uuid');

async function seedGroceries() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to PostgreSQL database.');

        // Define the 5 stores with details
        const stores = [
            {
                phoneNumber: '+919900000001',
                name: 'Fresh & Green Organics',
                description: 'Earthy, farm-to-table organic produce, premium fresh fruits, herbs, and hydroponic greens.',
                logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
                latitude: 12.9725,
                longitude: 77.5955,
                category: 'GROCERY',
                verticalType: 'GROCERY',
                products: [
                    // Leafy Greens & Herbs
                    { sku: 'FGO-VEG-001', name: 'Organic Spinach (250g)', price: 45, qty: 80, desc: 'Freshly harvested organic baby spinach leaves, pre-washed.', dietary: 'veg' },
                    { sku: 'FGO-VEG-002', name: 'Hydroponic Butterhead Lettuce (1 Pc)', price: 99, qty: 30, desc: 'Crisp, hydroponically grown butterhead lettuce, rich in flavor.', dietary: 'veg' },
                    { sku: 'FGO-VEG-003', name: 'Fresh Coriander Bunch (100g)', price: 15, qty: 150, desc: 'Bright green, highly aromatic coriander leaves.', dietary: 'veg' },
                    { sku: 'FGO-VEG-004', name: 'Fresh Mint Leaves (100g)', price: 20, qty: 120, desc: 'Peppery, refreshing mint leaves perfect for teas and chutneys.', dietary: 'veg' },
                    { sku: 'FGO-VEG-005', name: 'Aromatic Sweet Basil (50g)', price: 40, qty: 45, desc: 'Fresh Italian sweet basil leaves, perfect for pesto.', dietary: 'veg' },
                    { sku: 'FGO-VEG-006', name: 'Fresh Rosemary (30g)', price: 60, qty: 25, desc: 'Woody, fragrant fresh rosemary sprigs for roasting.', dietary: 'veg' },
                    { sku: 'FGO-VEG-007', name: 'Fresh Thyme (30g)', price: 60, qty: 25, desc: 'Delicate, earthy thyme sprigs perfect for savory dishes.', dietary: 'veg' },
                    { sku: 'FGO-VEG-008', name: 'Fresh Curry Leaves (50g)', price: 12, qty: 180, desc: 'Highly aromatic curry leaves, key to South Indian tempering.', dietary: 'veg' },
                    { sku: 'FGO-VEG-009', name: 'Fresh Spring Onion Bunch (250g)', price: 35, qty: 70, desc: 'Crisp green shoots with mild white bulbs.', dietary: 'veg' },
                    { sku: 'FGO-VEG-010', name: 'Organic Curly Kale (150g)', price: 80, qty: 40, desc: 'Nutrient-rich, dark curly green kale leaves.', dietary: 'veg' },
                    // Veggies Staples
                    { sku: 'FGO-VEG-011', name: 'Country Red Tomatoes (1kg)', price: 60, qty: 200, desc: 'Juicy, vine-ripened local red tomatoes.', dietary: 'veg' },
                    { sku: 'FGO-VEG-012', name: 'English Cucumber (500g)', price: 45, qty: 90, desc: 'Crisp, seedless English greenhouse cucumbers.', dietary: 'veg' },
                    { sku: 'FGO-VEG-013', name: 'Organic Carrots (500g)', price: 55, qty: 110, desc: 'Sweet, earthy orange organic carrots.', dietary: 'veg' },
                    { sku: 'FGO-VEG-014', name: 'Red Beetroots (500g)', price: 35, qty: 85, desc: 'Deep red, earthy and nutrient-dense beetroots.', dietary: 'veg' },
                    { sku: 'FGO-VEG-015', name: 'Premium Jyoti Potatoes (1kg)', price: 40, qty: 300, desc: 'High-quality earthy Jyoti baking potatoes.', dietary: 'veg' },
                    { sku: 'FGO-VEG-016', name: 'Nasik Red Onions (1kg)', price: 50, qty: 400, desc: 'Pungent, sweet premium red onions from Nasik.', dietary: 'veg' },
                    { sku: 'FGO-VEG-017', name: 'Organic White Garlic (200g)', price: 70, qty: 150, desc: 'Pungent, strong local organic white garlic cloves.', dietary: 'veg' },
                    { sku: 'FGO-VEG-018', name: 'Earthy Ginger (250g)', price: 65, qty: 130, desc: 'Fresh, spicy ginger roots with thin skin.', dietary: 'veg' },
                    { sku: 'FGO-VEG-019', name: 'Spicy Green Chillies (100g)', price: 18, qty: 160, desc: 'Hot, slender green chillies, freshly picked.', dietary: 'veg' },
                    { sku: 'FGO-VEG-020', name: 'Fresh Lemon (Pack of 4)', price: 25, qty: 140, desc: 'Juicy, zesty yellow lemons rich in vitamin C.', dietary: 'veg' },
                    // Premium & Exotic Veggies
                    { sku: 'FGO-VEG-021', name: 'Exotic Zucchini Green (500g)', price: 85, qty: 55, desc: 'Tender, mild green summer squash.', dietary: 'veg' },
                    { sku: 'FGO-VEG-022', name: 'Exotic Zucchini Yellow (500g)', price: 95, qty: 45, desc: 'Vibrant yellow, sweet summer zucchini.', dietary: 'veg' },
                    { sku: 'FGO-VEG-023', name: 'Fresh Crown Broccoli (1 Pc)', price: 90, qty: 65, desc: 'Crisp green broccoli crowns, packed with fiber.', dietary: 'veg' },
                    { sku: 'FGO-VEG-024', name: 'Exotic Red Cabbage (500g)', price: 65, qty: 40, desc: 'Crisp, colorful red/purple cabbage head.', dietary: 'veg' },
                    { sku: 'FGO-VEG-025', name: 'Sweet Cherry Tomatoes (250g)', price: 80, qty: 50, desc: 'Bite-sized, incredibly sweet red cherry tomatoes.', dietary: 'veg' },
                    { sku: 'FGO-VEG-026', name: 'Button Mushrooms (200g Box)', price: 60, qty: 85, desc: 'Earthy, fresh white button mushrooms.', dietary: 'veg' },
                    { sku: 'FGO-VEG-027', name: 'Exotic Shiitake Mushrooms (100g)', price: 180, qty: 20, desc: 'Fragrant, savory shiitake mushrooms.', dietary: 'veg' },
                    { sku: 'FGO-VEG-028', name: 'Fresh Green Asparagus (250g)', price: 220, qty: 25, desc: 'Tender, young green asparagus spears.', dietary: 'veg' },
                    { sku: 'FGO-VEG-029', name: 'Tender Baby Corn (200g Pack)', price: 45, qty: 75, desc: 'Sweet, crisp baby corn cobs.', dietary: 'veg' },
                    { sku: 'FGO-VEG-030', name: 'American Sweet Corn (2 Pcs)', price: 50, qty: 100, desc: 'Plump, sweet golden corn on the cob.', dietary: 'veg' },
                    // Fruits
                    { sku: 'FGO-FRU-031', name: 'Hass Avocado (Pack of 2)', price: 299, qty: 40, desc: 'Creamy, rich imported Hass avocados, ready to eat.', dietary: 'veg' },
                    { sku: 'FGO-FRU-032', name: 'Royal Gala Red Apples (4 Pcs)', price: 180, qty: 95, desc: 'Crisp, sweet, and lightly striped red apples.', dietary: 'veg' },
                    { sku: 'FGO-FRU-033', name: 'Green Granny Smith Apples (4 Pcs)', price: 220, qty: 60, desc: 'Tart, crisp green apples perfect for baking/juicing.', dietary: 'veg' },
                    { sku: 'FGO-FRU-034', name: 'Premium Alphonso Mangoes (6 Pcs)', price: 799, qty: 30, desc: 'King of Mangoes, sweet, fiberless rich pulp.', dietary: 'veg' },
                    { sku: 'FGO-FRU-035', name: 'Robusta Bananas (1 Dozen)', price: 70, qty: 180, desc: 'Sweet, ripe and energizing yellow bananas.', dietary: 'veg' },
                    { sku: 'FGO-FRU-036', name: 'Sweet Papaya (1 Pc / ~1.2kg)', price: 80, qty: 70, desc: 'Ripe, orange-fleshed sweet local papaya.', dietary: 'veg' },
                    { sku: 'FGO-FRU-037', name: 'Kabul Ruby Pomegranate (2 Pcs)', price: 190, qty: 80, desc: 'Large, dark red pomegranate packed with juicy arils.', dietary: 'veg' },
                    { sku: 'FGO-FRU-038', name: 'Fresh Kiwi Fruit (Pack of 3)', price: 99, qty: 110, desc: 'Zesty, emerald green kiwi fruits with black seeds.', dietary: 'veg' },
                    { sku: 'FGO-FRU-039', name: 'Red Dragon Fruit (1 Pc)', price: 130, qty: 55, desc: 'Exotic, vibrant pink flesh dragon fruit, sweet taste.', dietary: 'veg' },
                    { sku: 'FGO-FRU-040', name: 'Valencia Oranges (1kg)', price: 160, qty: 90, desc: 'Juicy, sweet oranges perfect for squeezing.', dietary: 'veg' },
                    // Berries & Exotic
                    { sku: 'FGO-FRU-041', name: 'Fresh Strawberries (200g Box)', price: 149, qty: 45, desc: 'Sweet, crimson strawberries grown in Mahabaleshwar.', dietary: 'veg' },
                    { sku: 'FGO-FRU-042', name: 'Imported Blueberries (125g Cup)', price: 249, qty: 50, desc: 'Plump, antioxidant-rich dark blue berries.', dietary: 'veg' },
                    { sku: 'FGO-FRU-043', name: 'Fresh Raspberries (125g Cup)', price: 299, qty: 25, desc: 'Tangy, soft red raspberries.', dietary: 'veg' },
                    { sku: 'FGO-FRU-044', name: 'Fresh Blackberries (125g Cup)', price: 299, qty: 20, desc: 'Sweet, glossy deep black berries.', dietary: 'veg' },
                    { sku: 'FGO-FRU-045', name: 'Exotic Passion Fruit (Pack of 2)', price: 120, qty: 35, desc: 'Tart, aromatic, gelatinous yellow passion fruit.', dietary: 'veg' },
                    { sku: 'FGO-FRU-046', name: 'Imported Red Cherries (250g)', price: 450, qty: 15, desc: 'Sweet, dark red juicy premium table cherries.', dietary: 'veg' },
                    { sku: 'FGO-VEG-047', name: 'Hydroponic Romaine Lettuce (1 Pc)', price: 110, qty: 30, desc: 'Crisp, elongated leaves perfect for Caesar Salad.', dietary: 'veg' },
                    { sku: 'FGO-VEG-048', name: 'Organic Bell Peppers Yellow (250g)', price: 90, qty: 60, desc: 'Sweet, bright yellow sweet bell pepper.', dietary: 'veg' },
                    { sku: 'FGO-VEG-049', name: 'Organic Bell Peppers Red (250g)', price: 90, qty: 60, desc: 'Thick, sweet, bright red bell pepper.', dietary: 'veg' },
                    { sku: 'FGO-VEG-050', name: 'Organic Cauliflower (1 Pc)', price: 50, qty: 100, desc: 'Tight, white cauliflower curd surrounded by green leaves.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000002',
                name: 'The Gourmet Pantry',
                description: 'Curated selection of fine European cheeses, bronze-cut pastas, organic honey, olive oils, and spreads.',
                logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=600&auto=format&fit=crop',
                latitude: 12.9755,
                longitude: 77.5995,
                category: 'GROCERY',
                verticalType: 'GROCERY',
                products: [
                    // Cheeses
                    { sku: 'TGP-CHS-001', name: 'Aged Parmigiano Reggiano (200g)', price: 490, qty: 40, desc: 'Aged for 24 months, rich, granular, and nutty Italian cheese.', dietary: 'veg' },
                    { sku: 'TGP-CHS-002', name: 'Mature English Cheddar (150g)', price: 320, qty: 50, desc: 'Sharp, crumbly aged English farmhouse cheddar cheese.', dietary: 'veg' },
                    { sku: 'TGP-CHS-003', name: 'Dutch Gouda Cheese Wheel (200g)', price: 290, qty: 45, desc: 'Creamy, mild semi-hard yellow cheese from Holland.', dietary: 'veg' },
                    { sku: 'TGP-CHS-004', name: 'French Brie Double Cream (125g)', price: 380, qty: 30, desc: 'Soft-ripened, buttery, and incredibly creamy cheese.', dietary: 'veg' },
                    { sku: 'TGP-CHS-005', name: 'French Camembert (250g)', price: 420, qty: 25, desc: 'Rich, earthy, soft-ripened cow\'s milk cheese.', dietary: 'veg' },
                    { sku: 'TGP-CHS-006', name: 'Mozzarella Di Bufala Campana (125g)', price: 280, qty: 35, desc: 'Fresh buffalo mozzarella balls in brine, soft and milky.', dietary: 'veg' },
                    { sku: 'TGP-CHS-007', name: 'Traditional Greek Feta (200g)', price: 250, qty: 60, desc: 'Crumbly, tangy sheep and goat milk feta cheese in brine.', dietary: 'veg' },
                    { sku: 'TGP-CHS-008', name: 'Italian Gorgonzola Blue Cheese (150g)', price: 390, qty: 20, desc: 'Veined blue cheese, buttery, crumbly, and sharp flavor.', dietary: 'veg' },
                    { sku: 'TGP-CHS-009', name: 'Fresh Italian Ricotta (200g)', price: 180, qty: 40, desc: 'Creamy, light, and mildly sweet whey cheese.', dietary: 'veg' },
                    { sku: 'TGP-CHS-010', name: 'Premium Mascarpone (250g)', price: 290, qty: 35, desc: 'Rich Italian double-cream cheese, essential for Tiramisu.', dietary: 'veg' },
                    // Pastas & Grains
                    { sku: 'TGP-PST-011', name: 'Bronze-Cut Penne Rigate (500g)', price: 175, qty: 100, desc: 'Rough textured artisanal penne, absorbs sauce perfectly.', dietary: 'veg' },
                    { sku: 'TGP-PST-012', name: 'Artisanal Bronze-Cut Spaghetti (500g)', price: 175, qty: 120, desc: 'Long, slow-dried Italian durum wheat spaghetti.', dietary: 'veg' },
                    { sku: 'TGP-PST-013', name: 'Durum Wheat Fusilli (500g)', price: 160, qty: 90, desc: 'Spiraled pasta shapes, ideal for heavy cream/meat sauces.', dietary: 'veg' },
                    { sku: 'TGP-PST-014', name: 'Bronze-Cut Farfalle (500g)', price: 180, qty: 80, desc: 'Butterfly/Bowtie-shaped classic Italian dry pasta.', dietary: 'veg' },
                    { sku: 'TGP-PST-015', name: 'Tuscan Durum Wheat Fettuccine (500g)', price: 195, qty: 70, desc: 'Ribbon-shaped pasta, superb for Alfredo/carbonara.', dietary: 'veg' },
                    { sku: 'TGP-PST-016', name: 'Classic Lasagna Sheets (500g Box)', price: 210, qty: 50, desc: 'Flat pasta sheets ready to oven bake with cheese.', dietary: 'veg' },
                    { sku: 'TGP-PST-017', name: 'Arborio Rice for Risotto (1kg)', price: 350, qty: 65, desc: 'High starch round grain rice, makes risottos super creamy.', dietary: 'veg' },
                    { sku: 'TGP-PST-018', name: 'Organic Royal White Quinoa (500g)', price: 240, qty: 85, desc: 'Nutrient-rich, gluten-free complete plant protein.', dietary: 'veg' },
                    { sku: 'TGP-PST-019', name: 'French Couscous (500g Pack)', price: 190, qty: 75, desc: 'Steamed semolina granules, light and fluffy.', dietary: 'veg' },
                    { sku: 'TGP-PST-020', name: 'Stone-Ground Italian Polenta (500g)', price: 180, qty: 45, desc: 'Coarse yellow cornmeal, rich and comforting.', dietary: 'veg' },
                    // Oils & Vinegars
                    { sku: 'TGP-OIL-021', name: 'Extra Virgin Olive Oil (500ml)', price: 899, qty: 80, desc: 'Cold pressed, single source Italian olives, peppery finish.', dietary: 'veg' },
                    { sku: 'TGP-OIL-022', name: 'White Truffle Infused Olive Oil (250ml)', price: 1499, qty: 15, desc: 'Vibrant EVOO infused with premium white truffle aroma.', dietary: 'veg' },
                    { sku: 'TGP-OIL-023', name: 'Balsamic Vinegar of Modena IGP (250ml)', price: 450, qty: 50, desc: 'Aged in wooden casks, sweet, dark, syrup-like glaze.', dietary: 'veg' },
                    { sku: 'TGP-OIL-024', name: 'Organic Apple Cider Vinegar ACV (500ml)', price: 280, qty: 95, desc: 'With "Mother", raw, unfiltered, healthy tonic.', dietary: 'veg' },
                    { sku: 'TGP-OIL-025', name: 'Italian Red Wine Vinegar (500ml)', price: 220, qty: 60, desc: 'Aged red wine vinegar, great for salad vinaigrettes.', dietary: 'veg' },
                    { sku: 'TGP-OIL-026', name: 'Pure Cold Pressed Avocado Oil (250ml)', price: 650, qty: 30, desc: 'High smoke point oil, rich in monounsaturated fats.', dietary: 'veg' },
                    { sku: 'TGP-OIL-027', name: 'Toasted Sesame Oil (250ml)', price: 190, qty: 70, desc: 'Nutty, highly aromatic oil for Asian stir-fry recipes.', dietary: 'veg' },
                    // Sauces & Condiments
                    { sku: 'TGP-SAU-028', name: 'Gourmet Basil Pesto (190g Jar)', price: 240, qty: 55, desc: 'Made with fresh basil, pine nuts, garlic, and Grana Padano.', dietary: 'veg' },
                    { sku: 'TGP-SAU-029', name: 'Slow Cooked Marinara Sauce (350g)', price: 199, qty: 75, desc: 'San Marzano tomatoes simmered with garlic, basil, and EVOO.', dietary: 'veg' },
                    { sku: 'TGP-SAU-030', name: 'Creamy Classic Alfredo Sauce (350g)', price: 220, qty: 65, desc: 'Rich cream sauce made with butter and aged parmesan.', dietary: 'veg' },
                    { sku: 'TGP-SAU-031', name: 'French Dijon Mustard (200g)', price: 180, qty: 85, desc: 'Smooth, sharp, traditional French mustard from Dijon.', dietary: 'veg' },
                    { sku: 'TGP-SAU-032', name: 'Whole Grain Mustard (200g)', price: 190, qty: 75, desc: 'Coarse, textured mustard seeds in white wine.', dietary: 'veg' },
                    { sku: 'TGP-SAU-033', name: 'Real Eggless Truffle Mayo (200g)', price: 160, qty: 90, desc: 'Creamy vegan mayo infused with black summer truffles.', dietary: 'veg' },
                    { sku: 'TGP-SAU-034', name: 'Sriracha Chilli Hot Sauce (480g)', price: 299, qty: 110, desc: 'Traditional spicy sun-ripened chili garlic paste.', dietary: 'veg' },
                    { sku: 'TGP-SAU-035', name: 'Hickory Smoked BBQ Sauce (350g)', price: 180, qty: 120, desc: 'Tangy, sweet sauce with deep woodsmoke flavor.', dietary: 'veg' },
                    // Sweets & Snacks
                    { sku: 'TGP-SNC-036', name: 'Dark Chocolate Bark w/ Sea Salt (100g)', price: 220, qty: 50, desc: '70% cacao dark chocolate shards sprinkled with Maldon sea salt.', dietary: 'veg' },
                    { sku: 'TGP-SNC-037', name: 'Salted Butter Caramel Spread (250g)', price: 299, qty: 40, desc: 'French-style sweet caramel with Guerande fleur de sel.', dietary: 'veg' },
                    { sku: 'TGP-SNC-038', name: 'Macarons Assortment (Pack of 6)', price: 450, qty: 20, desc: 'Assorted flavors: Pistachio, Raspberry, Chocolate, Lemon.', dietary: 'veg' },
                    { sku: 'TGP-SNC-039', name: 'Italian Roasted Hazelnut Spread (350g)', price: 349, qty: 60, desc: 'High hazelnut content cocoa spread, dairy-free.', dietary: 'veg' },
                    { sku: 'TGP-SNC-040', name: 'Organic Pure Maple Syrup (250ml)', price: 699, qty: 35, desc: 'Grade A golden maple syrup imported from Canada.', dietary: 'veg' },
                    { sku: 'TGP-SNC-041', name: 'Lotus Biscoff Spread (400g)', price: 450, qty: 90, desc: 'Original caramelized speculoos cookie butter spread.', dietary: 'veg' },
                    { sku: 'TGP-SNC-042', name: 'Sourdough Artisanal Crackers (150g)', price: 120, qty: 100, desc: 'Thin, crispy crackers, perfect for cheese platters.', dietary: 'veg' },
                    { sku: 'TGP-SNC-043', name: 'Stuffed Green Olives w/ Pimento (300g)', price: 220, qty: 80, desc: 'Spanish Queen green olives stuffed with sweet pimento.', dietary: 'veg' },
                    { sku: 'TGP-SNC-044', name: 'Kalamata Whole Dark Olives (300g)', price: 240, qty: 70, desc: 'Sun-ripened Greek dark purple olives in red wine vinegar.', dietary: 'veg' },
                    { sku: 'TGP-SNC-045', name: 'Gourmet Wild Capers in Brine (100g)', price: 150, qty: 50, desc: 'Tiny, tangy, pickled flower buds from the Mediterranean.', dietary: 'veg' },
                    { sku: 'TGP-SNC-046', name: 'Artisanal Herb Cheese Straws (100g)', price: 99, qty: 100, desc: 'Crispy puff pastry straws baked with cheddar and rosemary.', dietary: 'veg' },
                    { sku: 'TGP-SAU-047', name: 'White Wine Vinegar (500ml)', price: 210, qty: 50, desc: 'Tangy, clear white wine vinegar for fine dressings.', dietary: 'veg' },
                    { sku: 'TGP-CHS-048', name: 'Halloumi Cyprus Grilling Cheese (200g)', price: 390, qty: 30, desc: 'High melting point cheese, perfect to pan-sear.', dietary: 'veg' },
                    { sku: 'TGP-CHS-049', name: 'Aged Spanish Manchego (150g)', price: 490, qty: 25, desc: 'Firm sheep\'s milk cheese aged for 6 months.', dietary: 'veg' },
                    { sku: 'TGP-CHS-050', name: 'Mascarpone Double Cream (250g)', price: 290, qty: 40, desc: 'Velvety, rich Italian double cream cheese.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000003',
                name: 'Spice & Harvest Co.',
                description: 'Traditional store for unpolished pulses, handpicked whole spices, fresh flours, and dry fruits.',
                logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
                latitude: 12.9695,
                longitude: 77.5925,
                category: 'GROCERY',
                verticalType: 'GROCERY',
                products: [
                    // Spices Powder
                    { sku: 'SHC-SPC-001', name: 'Turmeric Powder (200g)', price: 45, qty: 300, desc: 'Pure, high-curcumin ground turmeric from Salem.', dietary: 'veg' },
                    { sku: 'SHC-SPC-002', name: 'Kashmiri Red Chilli Powder (200g)', price: 80, qty: 250, desc: 'Mildly spicy chilli powder, gives vibrant red color.', dietary: 'veg' },
                    { sku: 'SHC-SPC-003', name: 'Coriander Powder (200g)', price: 40, qty: 280, desc: 'Ground coriander seeds, aromatic and fresh.', dietary: 'veg' },
                    { sku: 'SHC-SPC-004', name: 'Roasted Cumin Powder (100g)', price: 50, qty: 150, desc: 'Dry-roasted and finely ground cumin seeds.', dietary: 'veg' },
                    { sku: 'SHC-SPC-005', name: 'Authentic Garam Masala (100g)', price: 65, qty: 200, desc: 'Blend of 12 roasted whole aromatic spices.', dietary: 'veg' },
                    { sku: 'SHC-SPC-006', name: 'Whole Cumin Seeds / Jeera (100g)', price: 55, qty: 220, desc: 'Highly aromatic cumin seeds for tempering.', dietary: 'veg' },
                    { sku: 'SHC-SPC-007', name: 'Black Mustard Seeds / Rai (100g)', price: 20, qty: 350, desc: 'Pungent black mustard seeds, high quality.', dietary: 'veg' },
                    { sku: 'SHC-SPC-008', name: 'Fennel Seeds / Saunf (100g)', price: 30, qty: 180, desc: 'Sweet, anise-like seeds, digestive aid.', dietary: 'veg' },
                    { sku: 'SHC-SPC-009', name: 'Fenugreek Seeds / Methi (100g)', price: 25, qty: 190, desc: 'Bitter-sweet seeds, essential for pickles/curries.', dietary: 'veg' },
                    { sku: 'SHC-SPC-010', name: 'Strong Asafoetida / Hing (50g)', price: 90, qty: 120, desc: 'Compounded, highly aromatic asafoetida powder.', dietary: 'veg' },
                    // Whole Spices
                    { sku: 'SHC-WSP-011', name: 'Whole Black Cardamom (50g)', price: 95, qty: 100, desc: 'Smoky, intensely warm whole black cardamom pods.', dietary: 'veg' },
                    { sku: 'SHC-WSP-012', name: 'Whole Green Cardamom (50g)', price: 160, qty: 120, desc: 'Highly fragrant, premium bold green cardamom.', dietary: 'veg' },
                    { sku: 'SHC-WSP-013', name: 'Whole Cloves / Laung (50g)', price: 75, qty: 140, desc: 'Warm, highly aromatic whole cloves buds.', dietary: 'veg' },
                    { sku: 'SHC-WSP-014', name: 'Cinnamon Sticks / Dalchini (100g)', price: 110, qty: 90, desc: 'Sweet, woody whole cassia cinnamon bark.', dietary: 'veg' },
                    { sku: 'SHC-WSP-015', name: 'Whole Star Anise (50g)', price: 80, qty: 80, desc: 'Licorice-flavored star shaped pods.', dietary: 'veg' },
                    { sku: 'SHC-WSP-016', name: 'Premium Bay Leaves / Tejpatta (25g)', price: 25, qty: 200, desc: 'Sun dried, highly aromatic bay leaves.', dietary: 'veg' },
                    { sku: 'SHC-WSP-017', name: 'Whole Black Peppercorns (100g)', price: 99, qty: 150, desc: 'Pungent, hot black peppercorns from Malabar.', dietary: 'veg' },
                    { sku: 'SHC-WSP-018', name: 'Whole Nutmeg / Jaiphal (Pack of 3)', price: 40, qty: 100, desc: 'Sweet, highly fragrant whole nutmeg seeds.', dietary: 'veg' },
                    { sku: 'SHC-WSP-019', name: 'Mace / Javitri Whole (20g)', price: 120, qty: 50, desc: 'Delicate, lace-like warm spice overlaying nutmeg.', dietary: 'veg' },
                    { sku: 'SHC-WSP-020', name: 'Kashmiri Saffron / Kesar (1g)', price: 350, qty: 150, desc: 'Grade A premium dark red saffron threads.', dietary: 'veg' },
                    // Dals & Pulses
                    { sku: 'SHC-DAL-021', name: 'Unpolished Toor Dal / Arhar (1kg)', price: 165, qty: 300, desc: 'High-protein unpolished split pigeon peas.', dietary: 'veg' },
                    { sku: 'SHC-DAL-022', name: 'Organic Whole Moong Sabut (1kg)', price: 140, qty: 250, desc: 'Nutrient-rich, premium whole green mung beans.', dietary: 'veg' },
                    { sku: 'SHC-DAL-023', name: 'Moong Dal Dhuli (1kg)', price: 155, qty: 220, desc: 'Husked and split green gram, easy to digest.', dietary: 'veg' },
                    { sku: 'SHC-DAL-024', name: 'Premium Chana Dal (1kg)', price: 110, qty: 280, desc: 'Sweet, nutty unpolished split Bengal gram.', dietary: 'veg' },
                    { sku: 'SHC-DAL-025', name: 'Urad Dal Whole Black (1kg)', price: 145, qty: 200, desc: 'Whole black gram, essential for Dal Makhani.', dietary: 'veg' },
                    { sku: 'SHC-DAL-026', name: 'Rajma Chitra / Kidney Beans (1kg)', price: 170, qty: 180, desc: 'Spotted kidney beans, cook up super soft.', dietary: 'veg' },
                    { sku: 'SHC-DAL-027', name: 'Kabuli Chana / White Chickpeas (1kg)', price: 150, qty: 250, desc: 'Bold, creamy white chickpeas, perfect for Chole.', dietary: 'veg' },
                    { sku: 'SHC-DAL-028', name: 'Kala Chana / Black Chickpeas (1kg)', price: 90, qty: 300, desc: 'High-fiber, nutritious whole black chickpeas.', dietary: 'veg' },
                    { sku: 'SHC-DAL-029', name: 'Split Masoor Dal / Red Lentils (1kg)', price: 115, qty: 240, desc: 'Fast cooking red split lentils.', dietary: 'veg' },
                    { sku: 'SHC-DAL-030', name: 'Whole Green Peas Dried (500g)', price: 60, qty: 150, desc: 'Nutrient-rich dried green peas.', dietary: 'veg' },
                    // Grains & Flours
                    { sku: 'SHC-FLR-031', name: 'Sharbati Whole Wheat Atta (5kg)', price: 299, qty: 400, desc: 'Stone-ground wheat flour from Sharbati grains.', dietary: 'veg' },
                    { sku: 'SHC-FLR-032', name: 'Maida Fine Wheat Flour (1kg)', price: 50, qty: 200, desc: 'Superfine wheat flour for baking and flatbreads.', dietary: 'veg' },
                    { sku: 'SHC-FLR-033', name: 'Fine Sooji / Semolina (1kg)', price: 55, qty: 180, desc: 'Coarse semolina, excellent for Upma/Halwa.', dietary: 'veg' },
                    { sku: 'SHC-FLR-034', name: 'Pure Besan / Gram Flour (1kg)', price: 95, qty: 250, desc: 'Fine ground Bengal gram flour, gluten-free.', dietary: 'veg' },
                    { sku: 'SHC-FLR-035', name: 'Organic Ragi Flour (1kg)', price: 75, qty: 150, desc: 'Finger millet flour, incredibly rich in calcium.', dietary: 'veg' },
                    { sku: 'SHC-FLR-036', name: 'Bajra Flour / Pearl Millet (1kg)', price: 70, qty: 120, desc: 'Traditional nutrient-rich pearl millet flour.', dietary: 'veg' },
                    { sku: 'SHC-FLR-037', name: 'Thick Poha / Flattened Rice (500g)', price: 40, qty: 220, desc: 'Flattened rice flakes, ideal for breakfast Poha.', dietary: 'veg' },
                    { sku: 'SHC-FLR-038', name: 'Sabudana Large / Tapioca Pearls (500g)', price: 75, qty: 140, desc: 'Tapioca starch pearls, essential for fasts/Khichdi.', dietary: 'veg' },
                    { sku: 'SHC-FLR-039', name: 'Wheat Dalia / Broken Wheat (500g)', price: 45, qty: 160, desc: 'Fiber-rich broken wheat for healthy porridge.', dietary: 'veg' },
                    { sku: 'SHC-FLR-040', name: 'Traditional Basmati Rice (5kg)', price: 720, qty: 100, desc: 'Extra long grain, highly fragrant aged basmati rice.', dietary: 'veg' },
                    // Dry Fruits & Nuts
                    { sku: 'SHC-NUT-041', name: 'California Almonds Premium (500g)', price: 480, qty: 150, desc: 'Crunchy, sweet, and rich California almonds.', dietary: 'veg' },
                    { sku: 'SHC-NUT-042', name: 'Whole Cashew Nuts W240 (500g)', price: 520, qty: 130, desc: 'Large, premium grade whole cashew nuts.', dietary: 'veg' },
                    { sku: 'SHC-NUT-043', name: 'Salted & Roasted Pistachios (250g)', price: 299, qty: 95, desc: 'Premium roasted pistachios in shell, lightly salted.', dietary: 'veg' },
                    { sku: 'SHC-NUT-044', name: 'Chilean Walnut Halves (250g)', price: 340, qty: 80, desc: 'Rich, buttery Chilean light walnut kernels.', dietary: 'veg' },
                    { sku: 'SHC-NUT-045', name: 'Soft Dried Figs / Anjeer (250g)', price: 320, qty: 70, desc: 'Sweet, fibrous round dried figs.', dietary: 'veg' },
                    { sku: 'SHC-NUT-046', name: 'Golden Seedless Raisins (250g)', price: 99, qty: 140, desc: 'Sweet, plump green raisins dried naturally.', dietary: 'veg' },
                    { sku: 'SHC-NUT-047', name: 'Premium Kimia Dates (500g)', price: 280, qty: 110, desc: 'Soft, melt-in-mouth dark black Iranian dates.', dietary: 'veg' },
                    { sku: 'SHC-NUT-048', name: 'Dried Turkish Apricots (250g)', price: 220, qty: 65, desc: 'Delectable, tangy orange dried whole apricots.', dietary: 'veg' },
                    { sku: 'SHC-NUT-049', name: 'Organic Chia Seeds (150g)', price: 90, qty: 120, desc: 'Antioxidant and omega-3 rich healthy seeds.', dietary: 'veg' },
                    { sku: 'SHC-NUT-050', name: 'Organic Flax Seeds (150g)', price: 60, qty: 130, desc: 'Nutty seeds packed with dietary fiber.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000004',
                name: 'Daily Needs Supermarket',
                description: 'Your neighborhood hypermarket for daily dairy, bread, eggs, packaged snacks, drinks, and home hygiene products.',
                logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
                latitude: 12.9785,
                longitude: 77.5915,
                category: 'GROCERY',
                verticalType: 'GROCERY',
                products: [
                    // Dairy & Eggs
                    { sku: 'DNS-DY-001', name: 'Fresh Paneer / Cottage Cheese (200g)', price: 90, qty: 120, desc: 'Soft, fresh, and creamy cottage cheese block.', dietary: 'veg' },
                    { sku: 'DNS-DY-002', name: 'Amul Salted Butter (500g)', price: 275, qty: 150, desc: 'Classic, delicious salted cream butter.', dietary: 'veg' },
                    { sku: 'DNS-DY-003', name: 'Processed Cheese Slices (200g)', price: 150, qty: 95, desc: '10 individually wrapped creamy cheese slices.', dietary: 'veg' },
                    { sku: 'DNS-DY-004', name: 'Sweet Plain Yogurt / Dahi (400g Cup)', price: 45, qty: 180, desc: 'Thick, creamy, set pasteurized plain yogurt.', dietary: 'veg' },
                    { sku: 'DNS-DY-005', name: 'Amul Unsalted Cooking Butter (100g)', price: 60, qty: 80, desc: 'Pure, unsalted butter ideal for baking.', dietary: 'veg' },
                    { sku: 'DNS-DY-006', name: 'Farm-Fresh Brown Eggs (12 Pcs)', price: 160, qty: 100, desc: 'Premium, protein-rich large brown chicken eggs.', dietary: 'egg' },
                    { sku: 'DNS-DY-007', name: 'Sweet Mango Lassi (250ml Tetrapak)', price: 30, qty: 250, desc: 'Refreshing yogurt drink blended with mango pulp.', dietary: 'veg' },
                    { sku: 'DNS-DY-008', name: 'Amul Chocolate Milk (180ml)', price: 35, qty: 200, desc: 'Thick, delicious chocolate flavored milk shake.', dietary: 'veg' },
                    { sku: 'DNS-DY-009', name: 'Fresh Cream (250ml Pack)', price: 70, qty: 110, desc: 'Low fat, smooth dairy fresh cream.', dietary: 'veg' },
                    { sku: 'DNS-DY-010', name: 'Fresh Mozzarella Shredded (150g)', price: 180, qty: 65, desc: 'Perfect melting shredded cheese for pizzas.', dietary: 'veg' },
                    // Beverages
                    { sku: 'DNS-BEV-011', name: 'Coca Cola Original (750ml)', price: 40, qty: 300, desc: 'Refreshing, sparkling carbonated soft drink.', dietary: 'veg' },
                    { sku: 'DNS-BEV-012', name: 'Sprite Lemon Lime (750ml)', price: 40, qty: 280, desc: 'Crisp, refreshing lemon-lime flavored soda.', dietary: 'veg' },
                    { sku: 'DNS-BEV-013', name: 'Thums Up Strong Soda (750ml)', price: 40, qty: 350, desc: 'Strong, spicy, high-fizz cola drink.', dietary: 'veg' },
                    { sku: 'DNS-BEV-014', name: 'Diet Coke Zero Sugar (300ml Can)', price: 40, qty: 150, desc: 'Sugar-free, calorie-free refreshing diet cola.', dietary: 'veg' },
                    { sku: 'DNS-BEV-015', name: 'Schweppes Tonic Water (300ml)', price: 60, qty: 120, desc: 'Classic carbonated mixer with quinine.', dietary: 'veg' },
                    { sku: 'DNS-BEV-016', name: 'Schweppes Ginger Ale (300ml)', price: 60, qty: 120, desc: 'Bubbling, crisp ginger flavored soda.', dietary: 'veg' },
                    { sku: 'DNS-BEV-017', name: 'Nescafe Gold Instant Coffee (100g)', price: 350, qty: 85, desc: 'Rich, smooth roasted premium instant coffee.', dietary: 'veg' },
                    { sku: 'DNS-BEV-018', name: 'Taj Mahal Assam Tea (500g)', price: 290, qty: 140, desc: 'Premium loose leaf black tea from Assam.', dietary: 'veg' },
                    { sku: 'DNS-BEV-019', name: 'Lipton Green Tea Lemon (100 Bags)', price: 350, qty: 95, desc: 'Pure green tea bags infused with natural lemon flavor.', dietary: 'veg' },
                    { sku: 'DNS-BEV-020', name: 'Real Tender Coconut Water (200ml)', price: 45, qty: 220, desc: 'Pure, refreshing coconut water in a brick pack.', dietary: 'veg' },
                    // Breakfast & Bakery
                    { sku: 'DNS-BAK-021', name: 'Premium Sandwich White Bread (400g)', price: 45, qty: 150, desc: 'Soft, sliced fresh white sandwich bread.', dietary: 'veg' },
                    { sku: 'DNS-BAK-022', name: '100% Whole Wheat Brown Bread (400g)', price: 55, qty: 120, desc: 'Fiber-rich, healthy sliced wheat brown bread.', dietary: 'veg' },
                    { sku: 'DNS-BAK-023', name: 'Multigrain Artisan Bread (400g)', price: 65, qty: 80, desc: 'Soft bread topped with oats, flax, and sesame seeds.', dietary: 'veg' },
                    { sku: 'DNS-BAK-024', name: 'Soft Burger Buns (Pack of 4)', price: 35, qty: 90, desc: 'Fresh, fluffy round sesame burger buns.', dietary: 'veg' },
                    { sku: 'DNS-BAK-025', name: 'Chocolate Chip Cookies (150g Pack)', price: 70, qty: 180, desc: 'Crunchy cookies loaded with rich chocolate chips.', dietary: 'veg' },
                    { sku: 'DNS-BAK-026', name: 'Britannia Digestive Biscuits (250g)', price: 60, qty: 250, desc: 'High-fiber, crispy whole wheat biscuits.', dietary: 'veg' },
                    { sku: 'DNS-BAK-027', name: 'Kelloggs Corn Flakes Original (875g)', price: 299, qty: 90, desc: 'Crunchy, toasted flakes of golden corn breakfast cereal.', dietary: 'veg' },
                    { sku: 'DNS-BAK-028', name: 'Kelloggs Chocos Cereal (375g)', price: 180, qty: 110, desc: 'Chocolatey, scoop-shaped crunchy wheat cereal.', dietary: 'veg' },
                    { sku: 'DNS-BAK-029', name: 'Quaker Rolled Oats (1kg)', price: 199, qty: 130, desc: '100% natural whole grain rolled oats.', dietary: 'veg' },
                    { sku: 'DNS-BAK-030', name: 'Kissan Mixed Fruit Jam (500g Jar)', price: 170, qty: 140, desc: 'Sweet spread made with 8 real fruits pulp.', dietary: 'veg' },
                    // Snacks
                    { sku: 'DNS-SNC-031', name: 'Lays Potato Chips Classic (50g)', price: 20, qty: 400, desc: 'Crisp, salted potato chips.', dietary: 'veg' },
                    { sku: 'DNS-SNC-032', name: 'Maggi 2-Min Masala Noodles (Pack of 6)', price: 96, qty: 350, desc: 'Instant noodles with authentic Indian masala spices.', dietary: 'veg' },
                    { sku: 'DNS-SNC-033', name: 'Maggi Hot & Sweet Tomato Sauce (1kg)', price: 160, qty: 110, desc: 'Tangy, sweet and spicy tomato ketchup.', dietary: 'veg' },
                    { sku: 'DNS-SNC-034', name: 'Ching\'s Schezwan Chutney (250g)', price: 85, qty: 180, desc: 'Fiery, garlic-rich schezwan dipping sauce.', dietary: 'veg' },
                    { sku: 'DNS-SNC-035', name: 'Haldirams Roasted Peanut Salted (200g)', price: 50, qty: 240, desc: 'Crunchy, roasted split peanuts, lightly salted.', dietary: 'veg' },
                    { sku: 'DNS-SNC-036', name: 'Act II Popcorn Butter Pepper (3 Pcs)', price: 60, qty: 300, desc: 'Instant microwave popcorn, butter pepper flavor.', dietary: 'veg' },
                    { sku: 'DNS-SNC-037', name: 'Real Mixed Fruit Juice (1L)', price: 110, qty: 160, desc: 'Pure, refreshing liquid fruit blend.', dietary: 'veg' },
                    { sku: 'DNS-SNC-038', name: 'Haldiram Bhujia Sev (350g)', price: 110, qty: 220, desc: 'Crispy, spicy moth bean flour noodles.', dietary: 'veg' },
                    // Household & Hygiene
                    { sku: 'DNS-HOM-039', name: 'Dettol Liquid Hand Wash (200ml)', price: 99, qty: 200, desc: 'Antibacterial liquid soap, original pine scent.', dietary: 'veg' },
                    { sku: 'DNS-HOM-040', name: 'Vim Dishwashing Gel Lemon (500ml)', price: 120, qty: 180, desc: 'Concentrated gel, cuts grease with power of lemons.', dietary: 'veg' },
                    { sku: 'DNS-HOM-041', name: 'Harpic Toilet Cleaner Liquid (1L)', price: 195, qty: 150, desc: 'Disinfectant toilet bowl cleaner, fresh scent.', dietary: 'veg' },
                    { sku: 'DNS-HOM-042', name: 'Lizol Floor Cleaner Citrus (1L)', price: 185, qty: 160, desc: 'Disinfectant surface cleaner, citrus fragrance.', dietary: 'veg' },
                    { sku: 'DNS-HOM-043', name: 'Colin Glass & Multi-Surface Spray (500ml)', price: 105, qty: 130, desc: 'Shine booster glass and household spray.', dietary: 'veg' },
                    { sku: 'DNS-HOM-044', name: 'OXO Oxodegradable Garbage Bags (30 Pcs)', price: 90, qty: 220, desc: 'Medium size black, biodegradable garbage bags.', dietary: 'veg' },
                    { sku: 'DNS-HOM-045', name: 'Origami Soft Face Tissues (200 Pulls)', price: 80, qty: 240, desc: '2-ply super soft facial tissue box.', dietary: 'veg' },
                    { sku: 'DNS-HOM-046', name: 'Surf Excel Matic Liquid Detergent (1L)', price: 230, qty: 180, desc: 'Tough stain removing liquid for washing machines.', dietary: 'veg' },
                    { sku: 'DNS-HOM-047', name: 'Comfort Fabric Conditioner (1L)', price: 210, qty: 140, desc: 'Softens clothes, gives long lasting freshness.', dietary: 'veg' },
                    { sku: 'DNS-HOM-048', name: 'Savlon Antiseptic Liquid (500ml)', price: 160, qty: 100, desc: 'Trusted antiseptic germicide for wound care.', dietary: 'veg' },
                    { sku: 'DNS-HOM-049', name: 'Origami Kitchen Paper Towel (2 Rolls)', price: 95, qty: 120, desc: 'Absorbent, strong 2-ply kitchen paper rolls.', dietary: 'veg' },
                    { sku: 'DNS-HOM-050', name: 'Ariel Complete Detergent Powder (1kg)', price: 190, qty: 250, desc: 'Deep cleaning laundry washing powder.', dietary: 'veg' }
                ]
            },
            {
                phoneNumber: '+919900000005',
                name: 'Nature\'s Basket Premium',
                description: 'Exotic wellness destination for vegan milk, organic chia seeds, gluten-free superfoods, and cold-pressed juices.',
                logo: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop',
                latitude: 12.9655,
                longitude: 77.6015,
                category: 'GROCERY',
                verticalType: 'GROCERY',
                products: [
                    // Plant Milks
                    { sku: 'NBP-MLK-001', name: 'Barista Almond Milk (1L)', price: 320, qty: 80, desc: 'Unsweetened, ultra-creamy almond milk for coffees.', dietary: 'veg' },
                    { sku: 'NBP-MLK-002', name: 'Organic Oat Milk Unsweetened (1L)', price: 350, qty: 75, desc: 'Dairy-free, gluten-free milk with a natural oat sweetness.', dietary: 'veg' },
                    { sku: 'NBP-MLK-003', name: 'Vanilla Soy Milk Organic (1L)', price: 180, qty: 90, desc: 'Organic soy milk infused with natural vanilla bean.', dietary: 'veg' },
                    { sku: 'NBP-MLK-004', name: 'Culinary Thick Coconut Milk (400ml)', price: 90, qty: 140, desc: 'Rich, double-extracted coconut milk for cooking.', dietary: 'veg' },
                    { sku: 'NBP-MLK-005', name: 'Creamy Cashew Milk (1L)', price: 380, qty: 45, desc: 'Silky, dairy-free milk made from raw organic cashews.', dietary: 'veg' },
                    // Vegan Cheeses & Spreads
                    { sku: 'NBP-VEG-006', name: 'Vegan Mozzarella Blocks (200g)', price: 320, qty: 40, desc: 'Coconut-oil based vegan mozzarella, melts beautifully.', dietary: 'veg' },
                    { sku: 'NBP-VEG-007', name: 'Vegan Cheddar Shreds (200g)', price: 340, qty: 35, desc: 'Tangy, sharp plant-based cheddar cheese shreds.', dietary: 'veg' },
                    { sku: 'NBP-VEG-008', name: 'Stone-Ground Smooth Almond Butter (200g)', price: 390, qty: 60, desc: '100% roasted almonds, stone-ground with no added oils.', dietary: 'veg' },
                    { sku: 'NBP-VEG-009', name: 'Crunchy Dark Roast Peanut Butter (350g)', price: 160, qty: 120, desc: 'Slow roasted high-protein peanut butter with chunks.', dietary: 'veg' },
                    { sku: 'NBP-VEG-010', name: 'Organic Classic Hummus (200g)', price: 180, qty: 70, desc: 'Creamy chickpea puree with organic tahini and olive oil.', dietary: 'veg' },
                    // Healthy Grains & Seeds
                    { sku: 'NBP-GRN-011', name: 'Organic White Quinoa (1kg)', price: 450, qty: 100, desc: 'Gluten-free complete protein white quinoa grains.', dietary: 'veg' },
                    { sku: 'NBP-GRN-012', name: 'Organic Tri-Color Quinoa (500g)', price: 290, qty: 85, desc: 'Beautiful blend of white, red, and black quinoa.', dietary: 'veg' },
                    { sku: 'NBP-GRN-013', name: 'Organic Whole Chia Seeds (250g)', price: 160, qty: 150, desc: 'Fiber and Omega-3 rich whole chia seeds.', dietary: 'veg' },
                    { sku: 'NBP-GRN-014', name: 'Cold-Milled Golden Flax Seeds (250g)', price: 120, qty: 110, desc: 'Milled golden flax seeds, ready to mix in smoothies.', dietary: 'veg' },
                    { sku: 'NBP-GRN-015', name: 'Raw Pumpkin Seeds (200g)', price: 180, qty: 140, desc: 'Shelled pepitas, rich in zinc and magnesium.', dietary: 'veg' },
                    { sku: 'NBP-GRN-016', name: 'Roasted Sunflower Seeds (200g)', price: 140, qty: 120, desc: 'Lightly roasted, nutty sunflower seed kernels.', dietary: 'veg' },
                    { sku: 'NBP-GRN-017', name: 'Organic Shelled Hemp Seeds (150g)', price: 390, qty: 55, desc: 'Superfood seeds rich in gamma-linolenic acid GLA.', dietary: 'veg' },
                    { sku: 'NBP-GRN-018', name: 'Organic Jumbo Rolled Oats (1kg)', price: 240, qty: 130, desc: 'Thick cut, minimally processed rolled oats.', dietary: 'veg' },
                    { sku: 'NBP-GRN-019', name: 'Organic Steel Cut Oats (1kg)', price: 260, qty: 95, desc: 'Coarsely chopped oat groats, high fiber breakfast.', dietary: 'veg' },
                    { sku: 'NBP-GRN-020', name: 'Gluten-Free Buckwheat Groats (500g)', price: 190, qty: 80, desc: 'Raw, organic gluten-free buckwheat grains.', dietary: 'veg' },
                    // Superfoods
                    { sku: 'NBP-SUP-021', name: 'Ceremonial Matcha Green Tea (50g)', price: 890, qty: 25, desc: 'Stone ground shade grown green tea powder from Uji, Japan.', dietary: 'veg' },
                    { sku: 'NBP-SUP-022', name: 'Organic Spirulina Powder (100g)', price: 350, qty: 60, desc: 'Blue-green algae powder, ultimate protein superfood.', dietary: 'veg' },
                    { sku: 'NBP-SUP-023', name: 'Organic Freeze-Dried Acai Berry (100g)', price: 990, qty: 20, desc: 'Pure Brazilian acai berry powder, antioxidant powerhouse.', dietary: 'veg' },
                    { sku: 'NBP-SUP-024', name: 'Golden Turmeric Latte Mix (150g)', price: 250, qty: 90, desc: 'Blend of turmeric, black pepper, cinnamon, and ginger.', dietary: 'veg' },
                    { sku: 'NBP-SUP-025', name: 'Chamomile Herbal Tea Bags (25 Bags)', price: 220, qty: 110, desc: 'Calming, caffeine-free whole chamomile flower tea.', dietary: 'veg' },
                    { sku: 'NBP-SUP-026', name: 'Organic Peppermint Herbal Tea (25 Bags)', price: 220, qty: 100, desc: 'Cooling, refreshing pure peppermint leaves tea.', dietary: 'veg' },
                    { sku: 'NBP-SUP-027', name: 'Organic Dried Hibiscus Flowers (100g)', price: 190, qty: 75, desc: 'Tart, ruby-red dried calyces for herbal infusions.', dietary: 'veg' },
                    // Healthy Snacks
                    { sku: 'NBP-SNC-028', name: 'Gluten-Free Flour Blend (1kg)', price: 290, qty: 120, desc: 'Superb 1-to-1 substitute for baking gluten-free.', dietary: 'veg' },
                    { sku: 'NBP-SNC-029', name: 'Baked Quinoa Chips Sea Salt (100g)', price: 110, qty: 180, desc: 'Crispy, protein rich quinoa chips, light and crunchy.', dietary: 'veg' },
                    { sku: 'NBP-SNC-030', name: 'Crispy Baked Beetroot Chips (80g)', price: 95, qty: 140, desc: 'Oil-free baked sweet beetroot crisps.', dietary: 'veg' },
                    { sku: 'NBP-SNC-031', name: 'Roasted Makhana Salt & Pepper (100g)', price: 120, qty: 160, desc: 'Crunchy foxnuts popped and roasted, seasoned with pepper.', dietary: 'veg' },
                    { sku: 'NBP-SNC-032', name: 'Premium Dried Mixed Berries (200g)', price: 350, qty: 110, desc: 'Blend of cranberries, blueberries, cherries, and raisins.', dietary: 'veg' },
                    { sku: 'NBP-SNC-033', name: 'Dried Goji Berries Organic (150g)', price: 390, qty: 50, desc: 'Sweet, chewy berries packed with vitamin A.', dietary: 'veg' },
                    { sku: 'NBP-SNC-034', name: 'Toasted Coconut Chips (100g)', price: 120, qty: 150, desc: 'Thin coconut ribbons toasted with a pinch of sea salt.', dietary: 'veg' },
                    { sku: 'NBP-SNC-035', name: 'Organic Raw Cacao Nibs (150g)', price: 290, qty: 70, desc: 'Crunchy, unsweetened crushed organic cacao beans.', dietary: 'veg' },
                    { sku: 'NBP-SNC-036', name: 'Apple Cider Vinegar ACV Gummies (60 Pcs)', price: 690, qty: 45, desc: 'Delicious vegan ACV gummies with B-vitamins.', dietary: 'veg' },
                    // Juices & Tonics
                    { sku: 'NBP-JUC-037', name: 'Cold Pressed Green Juice (250ml)', price: 149, qty: 50, desc: 'Spinach, cucumber, celery, green apple, and mint.', dietary: 'veg' },
                    { sku: 'NBP-JUC-038', name: 'Cold Pressed Pomegranate (250ml)', price: 180, qty: 40, desc: '100% pure cold pressed pomegranate, no sugar added.', dietary: 'veg' },
                    { sku: 'NBP-JUC-039', name: 'Beetroot Ginger Wellness Shot (100ml)', price: 90, qty: 70, desc: 'Concentrated shot of beetroot, ginger, and lemon.', dietary: 'veg' },
                    { sku: 'NBP-JUC-040', name: 'Pure Organic Aloe Vera Juice (1L)', price: 299, qty: 65, desc: 'Cold processed inner leaf aloe juice, digestive aid.', dietary: 'veg' },
                    { sku: 'NBP-JUC-041', name: 'Organic Raw Kombucha Original (330ml)', price: 160, qty: 60, desc: 'Effervescent fermented black tea rich in probiotics.', dietary: 'veg' },
                    { sku: 'NBP-JUC-042', name: 'Ginger Lemon Probiotic Kombucha (330ml)', price: 170, qty: 55, desc: 'Fermented sparkling tea with zesty ginger and lemon.', dietary: 'veg' },
                    { sku: 'NBP-JUC-043', name: 'Apple Cinnamon Kombucha (330ml)', price: 170, qty: 50, desc: 'Warm cider notes in a fizzy probiotic tea.', dietary: 'veg' },
                    { sku: 'NBP-JUC-044', name: 'Raw Organic Coconut Water (250ml)', price: 60, qty: 150, desc: 'Hydrating, single-source sweet organic coconut water.', dietary: 'veg' },
                    { sku: 'NBP-SUP-045', name: 'Organic Maca Root Powder (100g)', price: 390, qty: 40, desc: 'Adaptogenic Peruvian maca root powder for energy.', dietary: 'veg' },
                    { sku: 'NBP-SUP-046', name: 'Raw Organic Cacao Powder (200g)', price: 320, qty: 85, desc: 'Unsweetened, cold-processed rich cacao powder.', dietary: 'veg' },
                    { sku: 'NBP-GRN-047', name: 'Gluten-Free Rolled Oats (1kg)', price: 280, qty: 120, desc: 'Pure whole grain oats, certified gluten free.', dietary: 'veg' },
                    { sku: 'NBP-SNC-048', name: 'Baked Beetroot Crisps (80g)', price: 95, qty: 130, desc: 'Light, crunchy and naturally sweet beetroot chips.', dietary: 'veg' },
                    { sku: 'NBP-JUC-049', name: 'Detox Charcoal Lemonade (250ml)', price: 149, qty: 35, desc: 'Activated charcoal, lemon, agave, and alkaline water.', dietary: 'veg' },
                    { sku: 'NBP-VEG-050', name: 'Vegan Cream Cheese Plain (200g)', price: 290, qty: 40, desc: 'Cultured cashew nut based plain cream cheese.', dietary: 'veg' }
                ]
            }
        ];

        for (const store of stores) {
            console.log(`\nProcessing store: ${store.name}`);

            // 1. Find or create store integration
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
                // If it already exists, update logo and coordinates to make sure they are accurate
                await integration.update({
                    logo: store.logo,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    verticalType: store.verticalType,
                    category: store.category
                });
                console.log(`- Merchant integration already exists. Updated details.`);
            }

            // 2. Find or create the main catalogue
            const [catalogue, catCreated] = await Catalogue.findOrCreate({
                where: { integrationId: integration.id, name: 'Main Catalogue' },
                defaults: {
                    id: uuidv4(),
                    isActive: true,
                    description: `Primary grocery and fresh items catalogue for ${store.name}`
                }
            });

            if (catCreated) {
                console.log(`- Created new Main Catalogue with ID: ${catalogue.id}`);
            } else {
                console.log(`- Main Catalogue already exists.`);
            }

            // 3. Populate products
            // First clean existing products under this catalogue to prevent duplicates
            const deletedCount = await Product.destroy({
                where: { catalogueId: catalogue.id }
            });
            if (deletedCount > 0) {
                console.log(`- Cleaned up ${deletedCount} existing products.`);
            }

            // Prepare products with IDs and relations
            const productsToInsert = store.products.map(p => {
                // Fetch dynamic Unsplash placeholder images matching the SKU categories
                let mainImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';
                if (p.sku.includes('VEG')) {
                    mainImage = 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300';
                } else if (p.sku.includes('FRU')) {
                    mainImage = 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300';
                } else if (p.sku.includes('CHS')) {
                    mainImage = 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300';
                } else if (p.sku.includes('PST')) {
                    mainImage = 'https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300';
                } else if (p.sku.includes('OIL')) {
                    mainImage = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300';
                } else if (p.sku.includes('SAU')) {
                    mainImage = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300';
                } else if (p.sku.includes('SPC') || p.sku.includes('WSP')) {
                    mainImage = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300';
                } else if (p.sku.includes('NUT')) {
                    mainImage = 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300';
                } else if (p.sku.includes('DAL') || p.sku.includes('FLR')) {
                    mainImage = 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300';
                } else if (p.sku.includes('DY')) {
                    mainImage = 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300';
                } else if (p.sku.includes('BEV')) {
                    mainImage = 'https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300';
                } else if (p.sku.includes('BAK')) {
                    mainImage = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300';
                } else if (p.sku.includes('HOM')) {
                    mainImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300';
                } else if (p.sku.includes('SUP')) {
                    mainImage = 'https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300';
                } else if (p.sku.includes('GRN')) {
                    mainImage = 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300';
                } else if (p.sku.includes('JUC')) {
                    mainImage = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300';
                }

                return {
                    id: uuidv4(),
                    sku: p.sku,
                    name: p.name,
                    description: p.desc,
                    price: p.price,
                    discountPrice: Math.round(p.price * 0.9), // 10% discount on all seeds for checkout testing
                    quantity: p.qty,
                    isActive: true,
                    dietaryType: p.dietary || 'veg',
                    imageUrls: [mainImage],
                    catalogueId: catalogue.id,
                    integrationId: integration.id,
                    currency: 'INR',
                    specifications: {
                        unit: p.name.includes('g)') ? 'g' : p.name.includes('kg)') ? 'kg' : p.name.includes('L)') ? 'L' : p.name.includes('ml)') ? 'ml' : 'Pc'
                    }
                };
            });

            await Product.bulkCreate(productsToInsert);
            console.log(`- Successfully seeded ${productsToInsert.length} products.`);
        }

        console.log('\n======================================================');
        console.log('🎉 Groceries Vertical test dataset successfully seeded!');
        console.log('Seeded 5 stores with exactly 50 products each (Total: 250 products).');
        console.log('======================================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding groceries vertical:', error);
        process.exit(1);
    }
}

seedGroceries();

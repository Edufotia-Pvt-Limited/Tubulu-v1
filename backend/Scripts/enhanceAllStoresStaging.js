require('dotenv').config();
const { connectPostgres, Integration, Product, sequelize } = require('../Utils/Postgres');

async function enhanceAllStores() {
    await connectPostgres();

    // Find all integrations (stores)
    const shops = await Integration.findAll({
        where: {
            isActive: true
        }
    });

    console.log(`Found ${shops.length} total active shops across all cities.`);

    for (const shop of shops) {
        console.log(`Processing shop: ${shop.integrationName} (Category: ${shop.category})`);
        const products = await Product.findAll({ where: { integrationId: shop.id } });
        if (products.length === 0) continue;

        // Make at least 1 product special per shop
        let specialMade = false;

        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            
            const ingredientsMap = {
                'Coffee': ['Coffee Beans', 'Chicory', 'Milk', 'Sugar'],
                'Dosa': ['Rice Batter', 'Urad Dal', 'Potatoes', 'Butter', 'Red Chutney'],
                'Kesari': ['Semolina', 'Ghee', 'Sugar', 'Saffron', 'Cashews'],
                'Meals': ['Rice', 'Lentils', 'Vegetables', 'Spices', 'Curd'],
                'Paneer': ['Paneer', 'Tomatoes', 'Butter', 'Cream', 'Spices'],
                'Biryani': ['Basmati Rice', 'Chicken/Mutton/Veg', 'Spices', 'Ghee', 'Yogurt'],
                'Idli': ['Rice Batter', 'Urad Dal'],
                'Vada': ['Urad Dal', 'Green Chillies', 'Ginger', 'Pepper'],
                'Tea': ['Tea Leaves', 'Milk', 'Sugar', 'Cardamom'],
                'Kebab': ['Chicken', 'Spices', 'Lemon', 'Curd'],
                'Mylari': ['Special Batter', 'Butter', 'Secret Spices'],
                'Mutton': ['Mutton', 'Spices', 'Onion', 'Tomato']
            };

            let matchedIngredients = null;
            if (shop.category === 'FB') {
                matchedIngredients = ['Chef\'s Special Ingredients', 'Local Spices'];
                for (const [key, val] of Object.entries(ingredientsMap)) {
                    if (p.name.toLowerCase().includes(key.toLowerCase())) {
                        matchedIngredients = val;
                        break;
                    }
                }
            }

            const isSpecial = !specialMade;
            if (isSpecial) specialMade = true;

            const newSpecs = {
                ...p.specifications,
                isSpecial: isSpecial
            };
            if (matchedIngredients) {
                newSpecs.ingredients = matchedIngredients;
            }

            let enhancedDesc = p.description || '';
            if (!enhancedDesc || enhancedDesc.trim().length === 0) {
                if (shop.category === 'FB') {
                    enhancedDesc = `Delicious ${p.name} prepared fresh daily.`;
                } else {
                    enhancedDesc = `Premium quality ${p.name} sourced carefully for you.`;
                }
            }
            if (shop.category === 'FB' && !enhancedDesc.includes('Prepared fresh')) {
                enhancedDesc += ` Prepared fresh with top quality ingredients.`;
            }

            await p.update({
                description: enhancedDesc,
                specifications: newSpecs,
                isBestseller: isSpecial ? true : p.isBestseller
            });
            // console.log(`  - Updated ${p.name} (Special: ${isSpecial})`);
        }
        console.log(`  -> Successfully updated ${products.length} products for ${shop.integrationName}.`);
    }
    console.log("Done updating all stores!");
    process.exit(0);
}

enhanceAllStores().catch(console.error);

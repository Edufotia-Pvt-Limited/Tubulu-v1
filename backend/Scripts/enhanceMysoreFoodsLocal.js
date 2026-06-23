const { connectPostgres, Integration, Product, sequelize } = require('../Utils/Postgres');

async function enhanceFoods() {
    await connectPostgres();
    const { Op } = require('sequelize');

    // Find all Mysore FB shops
    const shops = await Integration.findAll({
        where: {
            [Op.or]: [
                { city: { [Op.iLike]: '%Mysore%' } },
                { city: { [Op.iLike]: '%Mysuru%' } }
            ],
            category: 'FB'
        }
    });

    console.log(`Found ${shops.length} FB shops in Mysore/Mysuru.`);

    for (const shop of shops) {
        console.log(`Processing shop: ${shop.integrationName}`);
        const products = await Product.findAll({ where: { integrationId: shop.id } });
        if (products.length === 0) continue;

        // Make at least 1 product special
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

            let matchedIngredients = ['Chef\'s Special Ingredients', 'Local Spices'];
            for (const [key, val] of Object.entries(ingredientsMap)) {
                if (p.name.toLowerCase().includes(key.toLowerCase())) {
                    matchedIngredients = val;
                    break;
                }
            }

            const isSpecial = !specialMade;
            if (isSpecial) specialMade = true;

            const newSpecs = {
                ...p.specifications,
                ingredients: matchedIngredients,
                isSpecial: isSpecial
            };

            const enhancedDesc = p.description ? p.description + ` Prepared fresh with top quality ingredients.` : `Delicious ${p.name} prepared fresh daily.`;

            await p.update({
                description: enhancedDesc,
                specifications: newSpecs,
                isBestseller: isSpecial ? true : p.isBestseller
            });
            console.log(`  - Updated ${p.name} (Special: ${isSpecial})`);
        }
    }
    console.log("Done!");
    process.exit(0);
}

enhanceFoods().catch(console.error);

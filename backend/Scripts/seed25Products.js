const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');
const Catalogue = require('../Models/Catalogue.pg');
const Product = require('../Models/Product.pg');
const { v4: uuidv4 } = require('uuid');

const foodProductsTemplate = [
    { name: 'Mysore Masala Dosa', price: 90, desc: 'Crispy rice crepe smeared with hot garlic chutney, stuffed with mashed potato and served with sambar and coconut chutney.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop' },
    { name: 'Steaming Idli Sambar (2 Pcs)', price: 45, desc: 'Soft and fluffy steamed rice cakes served with hot lentil sambar and fresh coconut chutney.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop' },
    { name: 'Crispy Medu Vada (2 Pcs)', price: 50, desc: 'Golden brown, donut-shaped crispy lentil fritters spiced with ginger and black pepper.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop' },
    { name: 'Rava Khara Bath', price: 55, desc: 'Traditional savory semolina pudding cooked with ghee, mixed vegetables, curry leaves, and mustard seeds.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop' },
    { name: 'Sweet Kesari Bath', price: 50, desc: 'Delectable sweet semolina pudding flavored with saffron, ghee, and loaded with cashew nuts and raisins.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' },
    { name: 'Poori Sagu (3 Pcs)', price: 75, desc: 'Puffed, deep-fried wheat breads served with a delicious potato and mixed vegetable gravy.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop' },
    { name: 'Premium Degree Filter Coffee', price: 35, desc: 'Authentic South Indian chicory blend coffee brewed in brass filters and served frothy with hot milk.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop' },
    { name: 'Paneer Butter Masala', price: 180, desc: 'Soft cottage cheese cubes simmered in a rich, buttery, and creamy tomato gravy.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop' },
    { name: 'Butter Naan (1 Pc)', price: 40, desc: 'Soft, leavened clay-oven flatbread brushed with abundant melted butter.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop' },
    { name: 'Veg Donne Biryani', price: 160, desc: 'Aromatic Jeera Samba rice cooked with fresh mint, coriander, whole spices, and vegetable chunks, served in a leaf cup.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop' },
    { name: 'Gobi Manchurian Dry', price: 120, desc: 'Crispy fried cauliflower florets tossed in a sweet, spicy, and tangy Indo-Chinese sauce.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop' },
    { name: 'Veg Fried Rice', price: 130, desc: 'Fragrant basmati rice stir-fried in a wok with fresh spring onions, carrots, beans, and light soy sauce.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1603133872878-685f586b7d1e?q=80&w=600&auto=format&fit=crop' },
    { name: 'Mango Lassi', price: 70, desc: 'Creamy, sweet yogurt drink blended with ripe Alphonso mango pulp.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop' },
    { name: 'Fresh Lime Mint Juice', price: 45, desc: 'Refreshing cold beverage made from freshly squeezed limes, crushed mint, and ice.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop' },
    { name: 'Hot Badam Milk', price: 50, desc: 'Warm milk flavored with saffron, cardamom, and almond paste, topped with almond flakes.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop' },
    { name: 'Gulab Jamun (2 Pcs)', price: 60, desc: 'Deep-fried milk dumplings soaked in a warm, sweet cardamom-infused sugar syrup.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Traditional Mysore Pak', price: 80, desc: 'Rich and crumbly premium sweet made from pure ghee, gram flour, and sugar.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' },
    { name: 'Chola Bhatura Platter', price: 140, desc: 'Large fluffy fried leavened bread served with spicy, tangy chickpea curry and pickle.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop' },
    { name: 'Onion Uttapam', price: 85, desc: 'Thick, savory rice crepe topped with finely chopped red onions, green chillies, and fresh coriander.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop' },
    { name: 'Vegetable Pulav', price: 120, desc: 'Fragrant one-pot rice dish loaded with seasonal vegetables and mild Indian spices.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1603133872878-685f586b7d1e?q=80&w=600&auto=format&fit=crop' },
    { name: 'Dal Tadka Special', price: 110, desc: 'Smooth yellow lentils tempered with ghee, cumin seeds, garlic, and dry red chillies.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop' },
    { name: 'Jeera Rice', price: 90, desc: 'Basmati rice cooked with clarified butter ghee and roasted cumin seeds.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1603133872878-685f586b7d1e?q=80&w=600&auto=format&fit=crop' },
    { name: 'Mini South Indian Thali', price: 150, desc: 'Rice, Sambar, Rasam, one dry vegetable curry, curd, papad, and a sweet.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600&auto=format&fit=crop' },
    { name: 'Sizzling Brownie with Ice Cream', price: 160, desc: 'Fudgy warm chocolate brownie served on a hot sizzler plate with vanilla ice cream and chocolate syrup.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop' },
    { name: 'Cold Badam Kulfi', price: 65, desc: 'Creamy, slow-churned Indian frozen dessert flavored with saffron and almonds.', dietary: 'veg', img: 'https://images.unsplash.com/photo-1579631542720-3a87824ffd8e?q=80&w=600&auto=format&fit=crop' }
];

const groceryProductsTemplate = [
    { name: 'Organic Red Tomato (1kg)', price: 60, desc: 'Fresh, juicy, and pesticide-free tomatoes sourced directly from local farms.', unit: 'kg', img: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=600&auto=format&fit=crop' },
    { name: 'Fresh Potato (1kg)', price: 40, desc: 'Premium quality farm potatoes, ideal for roasting, baking, or boiling.', unit: 'kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop' },
    { name: 'Local Red Onion (1kg)', price: 45, desc: 'Crisp, pungent red onions, an essential base for all Indian cooking.', unit: 'kg', img: 'https://images.unsplash.com/photo-1508747703725-719ae2c73ee1?q=80&w=600&auto=format&fit=crop' },
    { name: 'Nanjangud Bananas (1 Dozen)', price: 80, desc: 'Geographical Indication (GI) tagged sweet local bananas from Mysore region.', unit: 'Pc', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop' },
    { name: 'Fresh Royal Gala Apple (1kg)', price: 180, desc: 'Sweet, crisp, and nutrient-rich imported red apples.', unit: 'kg', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop' },
    { name: 'Coorg Honey Orange (1kg)', price: 120, desc: 'Juicy, sweet and slightly tangy premium local oranges from Coorg hills.', unit: 'kg', img: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop' },
    { name: 'Green Seedless Grapes (500g)', price: 70, desc: 'Sweet and refreshing seedless green grapes, cleaned and packed.', unit: 'g', img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=600&auto=format&fit=crop' },
    { name: 'Premium Unpolished Toor Dal (1kg)', price: 160, desc: 'High protein yellow split pigeon peas, free from polishing or additives.', unit: 'kg', img: 'https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop' },
    { name: 'Organic Moong Dal (1kg)', price: 140, desc: 'Light and nutritious split yellow moong lentils, organic certified.', unit: 'kg', img: 'https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop' },
    { name: 'Aged Sona Masuri Rice (5kg)', price: 340, desc: 'Premium aged local rice, cooks fluffy and lightweight.', unit: 'kg', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop' },
    { name: 'Wood-Pressed Coconut Oil (1L)', price: 280, desc: 'Cold pressed from sun-dried copra, retain natural aroma and nutrients.', unit: 'L', img: 'https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop' },
    { name: 'Pure Cow Ghee (500ml)', price: 360, desc: 'Aromatic, grainy-textured pure cow ghee prepared in traditional style.', unit: 'L', img: 'https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Nandini Toned Milk (1L)', price: 54, desc: 'Pasteurized toned milk, rich in calcium and vitamins, from KMF.', unit: 'L', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop' },
    { name: 'Fresh Table Butter (200g)', price: 105, desc: 'Creamy, salted pure dairy butter, perfect for toast and baking.', unit: 'g', img: 'https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Organic Thick Curd (500g)', price: 40, desc: 'Thick, creamy set yogurt made from pure whole milk.', unit: 'g', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop' },
    { name: 'Fresh Malai Paneer (200g)', price: 95, desc: 'Extra soft, cottage cheese made from fresh buffalo milk.', unit: 'g', img: 'https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Whole Wheat Bread (400g)', price: 45, desc: 'Soft and healthy sliced brown sandwich bread baked fresh daily.', unit: 'g', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' },
    { name: 'Iodized Crystal Salt (1kg)', price: 20, desc: 'Clean, double-refined edible crystal salt with optimal iodine content.', unit: 'kg', img: 'https://images.unsplash.com/photo-1610348725531-843dff14446c?q=80&w=600&auto=format&fit=crop' },
    { name: 'Refined White Sugar (1kg)', price: 48, desc: 'Premium sulphur-free crystal white sugar, clean and dry.', unit: 'kg', img: 'https://images.unsplash.com/photo-1610348725531-843dff14446c?q=80&w=600&auto=format&fit=crop' },
    { name: 'Organic Turmeric Powder (200g)', price: 55, desc: 'High-curcumin grounded turmeric, perfect for culinary and health use.', unit: 'g', img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop' },
    { name: 'Kashmiri Red Chilli Powder (200g)', price: 75, desc: 'Authentic Kashmiri chillies ground to a fine red powder, mild heat, rich color.', unit: 'g', img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop' },
    { name: 'Raw California Almonds (250g)', price: 220, desc: 'Premium, whole, crunchy raw almonds, packed with vitamin E.', unit: 'g', img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600&auto=format&fit=crop' },
    { name: 'Premium Cashew Nuts (250g)', price: 240, desc: 'Large, clean and crisp whole cashew nuts, premium selection.', unit: 'g', img: 'https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?q=80&w=600&auto=format&fit=crop' },
    { name: 'Pure Assam Tea Dust (500g)', price: 190, desc: 'Strong, premium quality tea blend sourcing leaves from finest Assam gardens.', unit: 'g', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop' },
    { name: 'Dishwash Liquid Gel (500ml)', price: 110, desc: 'Concentrated lemon gel formulation, cuts grease effortlessly and leaves fresh scent.', unit: 'L', img: 'https://images.unsplash.com/photo-1607006342411-9a336f52431d?q=80&w=600&auto=format&fit=crop' }
];

async function seedProducts() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to local PostgreSQL database.');

        // Find all active Food or Grocery integrations
        const integrations = await Integration.findAll({
            where: {
                isActive: true,
                category: ['Food', 'Grocery']
            }
        });

        console.log(`Found ${integrations.length} merchants to populate.`);

        for (const integration of integrations) {
            console.log(`\nPopulating products for Merchant: ${integration.integrationName} (Category: ${integration.category})`);

            // Find or create Main Catalogue for the merchant
            const [catalogue] = await Catalogue.findOrCreate({
                where: { integrationId: integration.id, name: 'Main Catalogue' },
                defaults: {
                    id: uuidv4(),
                    isActive: true,
                    description: `Primary offering catalogue for ${integration.integrationName}`
                }
            });

            // Clean up existing products for this catalogue
            const deletedCount = await Product.destroy({
                where: { catalogueId: catalogue.id }
            });
            console.log(`- Cleared ${deletedCount} old products.`);

            // Determine which template to use
            const templates = integration.category === 'Food' ? foodProductsTemplate : groceryProductsTemplate;
            const prefix = integration.category === 'Food' ? 'FOOD' : 'GROC';

            // Build products array
            const productsToInsert = templates.map((p, idx) => {
                const sku = `${prefix}-${integration.integrationName.substring(0, 3).toUpperCase()}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}`;
                return {
                    id: uuidv4(),
                    sku: sku,
                    name: p.name,
                    description: p.desc,
                    price: p.price,
                    discountPrice: Math.round(p.price * 0.95),
                    quantity: 100,
                    isActive: true,
                    dietaryType: p.dietary || 'veg',
                    imageUrls: [p.img],
                    catalogueId: catalogue.id,
                    integrationId: integration.id,
                    currency: 'INR',
                    specifications: { unit: p.unit || 'Pc' }
                };
            });

            await Product.bulkCreate(productsToInsert);
            console.log(`- Successfully inserted ${productsToInsert.length} products with custom images!`);
        }

        console.log('\n🎉 Finished seeding at least 25 products per shop with custom images!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
}

seedProducts();

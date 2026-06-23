/**
 * seedNagpurFull.js
 * Seeds 20 Food & Beverages + 20 Grocery shops near Nagpur (21.147325, 79.058298)
 * Each shop gets 25 products, all with real Unsplash image URLs.
 * Run: node -r dotenv/config Scripts/seedNagpurFull.js
 */

const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');
const Catalogue = require('../Models/Catalogue.pg');
const Product = require('../Models/Product.pg');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Centre point: 21.147325, 79.058298  (Nagpur)
// Shops are scattered within ~3km radius
// ---------------------------------------------------------------------------

const foodShops = [
  {
    phone: '+919910100101',
    name: 'Saoji Bhojanalaya',
    desc: 'Authentic Vidarbha-style Saoji mutton and chicken curry with fiery red spices, a Nagpur specialty.',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1498, lng: 79.0612,
  },
  {
    phone: '+919910100102',
    name: 'Orange City Café',
    desc: 'Trendy café serving artisan coffee, waffles, pasta, and Nagpur-special orange drinks.',
    logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1461, lng: 79.0571,
  },
  {
    phone: '+919910100103',
    name: 'Tilak Nagar Tiffin Centre',
    desc: 'Classic South Indian breakfast — idli, dosa, vada, pongal — with authentic chutneys and sambar.',
    logo: 'https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1512, lng: 79.0594,
  },
  {
    phone: '+919910100104',
    name: 'Dharampeth Biryani House',
    desc: 'Slow-cooked dum biryani — Hyderabadi, Lucknowi, and Nagpuri styles — served with raita and salan.',
    logo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1489, lng: 79.0553,
  },
  {
    phone: '+919910100105',
    name: 'Sitabuldi Chaat Corner',
    desc: 'Iconic Nagpur street chaat — pani puri, bhel puri, ragda patties, and spicy tari samosa.',
    logo: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1445, lng: 79.0615,
  },
  {
    phone: '+919910100106',
    name: 'Vidarbha Veg Restaurant',
    desc: 'Pure vegetarian Vidarbha thali with kadhi, pitla, bhakri, zunka, and seasonal vegetables.',
    logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1520, lng: 79.0560,
  },
  {
    phone: '+919910100107',
    name: 'Gokulpeth Sweets Palace',
    desc: 'Nagpur-famous sweets — Orange Burfi, Kaju Katli, Besan Laddoo — fresh daily since 1975.',
    logo: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1474, lng: 79.0633,
  },
  {
    phone: '+919910100108',
    name: 'Law Garden Rolls & Wraps',
    desc: 'Kolkata-style egg rolls, paneer wraps, and frankie rolls — quick lunch spot near Law College Square.',
    logo: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1505, lng: 79.0586,
  },
  {
    phone: '+919910100109',
    name: 'Nagpur Pizza & Pasta Co.',
    desc: 'Wood-fired thin crust pizzas, creamy pasta, garlic bread, and Italian desserts in a cozy setting.',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1455, lng: 79.0578,
  },
  {
    phone: '+919910100110',
    name: 'Itwari Punjabi Dhaba',
    desc: 'Roadside dhaba-style North Indian food — dal makhani, butter chicken, naan, and lassi.',
    logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1432, lng: 79.0601,
  },
  {
    phone: '+919910100111',
    name: 'Ramdaspeth Juice Bar',
    desc: 'Fresh cold-pressed juices, smoothies, milkshakes, and fruit bowls — all-natural, no preservatives.',
    logo: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1478, lng: 79.0548,
  },
  {
    phone: '+919910100112',
    name: 'Central Avenue Chinese Kitchen',
    desc: 'Indo-Chinese favourites — Manchurian, Chowmein, Hakka noodles, spring rolls, and fried rice.',
    logo: 'https://images.unsplash.com/photo-1603133872878-685f586b7d1e?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1492, lng: 79.0623,
  },
  {
    phone: '+919910100113',
    name: 'Ambazari Idli House',
    desc: 'Mini idlis, set dosa, ghee pongal, and rava uttapam — healthy South Indian breakfast all day.',
    logo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1598515213692-b3b54fe7b9c0?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1516, lng: 79.0542,
  },
  {
    phone: '+919910100114',
    name: 'Nagpur Bakery & Confections',
    desc: 'Artisan breads, croissants, birthday cakes, cupcakes, and freshly baked cookies every morning.',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1467, lng: 79.0567,
  },
  {
    phone: '+919910100115',
    name: 'Variety Square Thali House',
    desc: 'Unlimited Maharashtrian thali — puri bhaji, khichdi, dal, sabzi, papad, and buttermilk.',
    logo: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1483, lng: 79.0597,
  },
  {
    phone: '+919910100116',
    name: 'Shankarnagar Kebab Corner',
    desc: 'Seekh kebabs, shami, tandoori chicken, roomali roti, and special Nawabi biryani.',
    logo: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1440, lng: 79.0559,
  },
  {
    phone: '+919910100117',
    name: 'GNG Ice Cream Parlour',
    desc: 'Nagpur-famous ice cream in 40+ flavours — kulfi, sundaes, orange sorbet, and custom scoops.',
    logo: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1579631542720-3a87824ffd8e?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1509, lng: 79.0609,
  },
  {
    phone: '+919910100118',
    name: 'Cotton Market Sandwich Hub',
    desc: 'Loaded club sandwiches, grilled toast, cold coffee, and quick breakfast bites.',
    logo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1458, lng: 79.0588,
  },
  {
    phone: '+919910100119',
    name: 'Mahal Mughlai Restaurant',
    desc: 'Rich Mughlai cuisine — nihari, shahi paneer, mutton korma, phirni, and shahi tukda.',
    logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1471, lng: 79.0575,
  },
  {
    phone: '+919910100120',
    name: 'Nagpur Filter Coffee House',
    desc: 'Traditional South Indian filter coffee, masala chai, bun maska, and evening tiffin snacks.',
    logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1496, lng: 79.0560,
  },
];

const groceryShops = [
  {
    phone: '+919910200101',
    name: 'Sitabuldi Fresh Mart',
    desc: 'Neighbourhood supermarket with fresh vegetables, fruits, dairy, pulses, and pantry essentials.',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1451, lng: 79.0618,
  },
  {
    phone: '+919910200102',
    name: 'Dharampeth Daily Provisions',
    desc: 'Daily grocery essentials, organic staples, household supplies, and seasonal farm produce.',
    logo: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1488, lng: 79.0555,
  },
  {
    phone: '+919910200103',
    name: 'Gokulpeth Organic Store',
    desc: 'Certified organic vegetables, cold-pressed oils, natural spices, and chemical-free groceries.',
    logo: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1514, lng: 79.0573,
  },
  {
    phone: '+919910200104',
    name: 'Itwari Super Bazaar',
    desc: 'Large format grocery store with wholesale prices on rice, pulses, atta, sugar, and spices.',
    logo: 'https://images.unsplash.com/photo-1601600576337-c1d8a0d1373c?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1432, lng: 79.0607,
  },
  {
    phone: '+919910200105',
    name: 'Ramdaspeth Veggie World',
    desc: 'Farm-direct fresh vegetable delivery — daily arrivals of leafy greens, root vegetables, and herbs.',
    logo: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1476, lng: 79.0544,
  },
  {
    phone: '+919910200106',
    name: 'Mahal Fruit Market',
    desc: 'Premium seasonal and imported fruits — Alphonso mangoes, Nagpur oranges, dragon fruit, and berries.',
    logo: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1495, lng: 79.0629,
  },
  {
    phone: '+919910200107',
    name: 'Variety Square Kirana',
    desc: 'Traditional kirana store with competitive prices on branded FMCG, cooking oils, and household goods.',
    logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1462, lng: 79.0582,
  },
  {
    phone: '+919910200108',
    name: 'Ambazari Dairy Corner',
    desc: 'Fresh dairy products — full-cream milk, toned milk, paneer, curd, butter, and ghee daily.',
    logo: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1519, lng: 79.0547,
  },
  {
    phone: '+919910200109',
    name: 'Tilak Nagar Spice Hub',
    desc: 'Authentic whole and ground spices — Vidarbha special masalas, garam masala blends, and chilli powders.',
    logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1502, lng: 79.0591,
  },
  {
    phone: '+919910200110',
    name: 'Nagpur Dry Fruits Palace',
    desc: 'Premium dry fruits — California almonds, Persian pistachios, Afghan raisins, and mixed trail mixes.',
    logo: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1443, lng: 79.0562,
  },
  {
    phone: '+919910200111',
    name: 'Orange City Hypermart',
    desc: 'One-stop hypermarket with groceries, household, personal care, and packaged foods at best prices.',
    logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1601600576337-c1d8a0d1373c?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1480, lng: 79.0610,
  },
  {
    phone: '+919910200112',
    name: 'Shankarnagar Health Store',
    desc: 'Health foods, millet-based products, protein supplements, diabetic-friendly foods, and herbal teas.',
    logo: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1438, lng: 79.0574,
  },
  {
    phone: '+919910200113',
    name: 'Central Avenue Rice & Pulses',
    desc: 'Bulk wholesale of premium rice varieties — Basmati, Sona Masuri, Kolam — and all dals.',
    logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1508, lng: 79.0556,
  },
  {
    phone: '+919910200114',
    name: 'GNG Bakery Ingredients',
    desc: 'Baking essentials — maida, whole wheat flour, baking soda, cocoa, yeast, and cake mixes.',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1466, lng: 79.0596,
  },
  {
    phone: '+919910200115',
    name: 'Nagpur Agro Fresh',
    desc: 'Direct farm supply — seasonal vegetables, curry leaves, drumsticks, bitter gourd, and fresh herbs.',
    logo: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1487, lng: 79.0570,
  },
  {
    phone: '+919910200116',
    name: 'Mahal Cold Press Oils',
    desc: 'Artisan cold-pressed oils — groundnut, sesame, coconut, mustard, and flaxseed, all chemical-free.',
    logo: 'https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1522, lng: 79.0603,
  },
  {
    phone: '+919910200117',
    name: 'Law Garden Snacks & Biscuits',
    desc: 'Packaged snacks, branded biscuits, chips, namkeen, instant noodles, and breakfast cereals.',
    logo: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1453, lng: 79.0586,
  },
  {
    phone: '+919910200118',
    name: 'Nagpur Masala Depot',
    desc: 'Wholesale and retail of authentic Vidarbha-style masalas, Saoji mix, and homemade pickle varieties.',
    logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1470, lng: 79.0619,
  },
  {
    phone: '+919910200119',
    name: 'Trimurti Nagar Super Store',
    desc: 'Modern convenience store with packaged goods, personal care, cleaning supplies, and baby products.',
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1497, lng: 79.0577,
  },
  {
    phone: '+919910200120',
    name: 'Nagpur Millet & Grains Store',
    desc: 'Specialty store for millets — jowar, bajra, ragi, foxtail — and traditional unpolished grains.',
    logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop',
    lat: 21.1435, lng: 79.0594,
  },
];

// ---------------------------------------------------------------------------
// 25 Food Products (with unique Unsplash images per product)
// ---------------------------------------------------------------------------
const foodProducts = [
  { name: 'Mysore Masala Dosa', price: 90, desc: 'Crispy rice crepe with spicy garlic chutney, potato filling, sambar and coconut chutney.', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Steaming Idli Sambar (2 Pcs)', price: 45, desc: 'Fluffy steamed rice cakes with hot lentil sambar and fresh coconut chutney.', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Crispy Medu Vada (2 Pcs)', price: 50, desc: 'Golden lentil fritters spiced with ginger and black pepper, served with chutneys.', img: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Paneer Butter Masala', price: 180, desc: 'Soft cottage cheese cubes in rich, buttery, creamy tomato gravy.', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Butter Naan (1 Pc)', price: 40, desc: 'Soft leavened flatbread baked in clay oven, brushed with melted butter.', img: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Veg Dum Biryani', price: 160, desc: 'Aromatic basmati rice layered with spiced vegetables, saffron, and fried onions.', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Gobi Manchurian Dry', price: 120, desc: 'Crispy cauliflower florets tossed in a sweet, spicy Indo-Chinese sauce.', img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Veg Hakka Noodles', price: 130, desc: 'Stir-fried noodles with fresh vegetables, spring onions, and light soy sauce.', img: 'https://images.unsplash.com/photo-1603133872878-685f586b7d1e?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Mango Lassi', price: 70, desc: 'Creamy yogurt drink blended with ripe Alphonso mango pulp.', img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Fresh Lime Soda', price: 45, desc: 'Refreshing beverage with freshly squeezed lime, mint, and chilled soda.', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Special Filter Coffee', price: 35, desc: 'Authentic chicory-blend South Indian coffee brewed in brass filters, served frothy.', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Gulab Jamun (2 Pcs)', price: 60, desc: 'Deep-fried milk dumplings soaked in warm cardamom-infused sugar syrup.', img: 'https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Nagpur Orange Burfi (250g)', price: 180, desc: 'Mawa-based sweet made with fresh Nagpur orange pulp, a regional specialty.', img: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Chola Bhatura Platter', price: 140, desc: 'Fluffy fried bread with spicy chickpea curry, pickle and onion salad.', img: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Onion Uttapam', price: 85, desc: 'Thick rice crepe topped with chopped red onions, green chillies, and coriander.', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Dal Tadka Special', price: 110, desc: 'Yellow lentils tempered with ghee, cumin, garlic, and dry red chillies.', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Vegetable Pulav', price: 120, desc: 'Fragrant one-pot rice with seasonal vegetables and mild Indian spices.', img: 'https://images.unsplash.com/photo-1603133872878-685f586b7d1e?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Mini South Indian Thali', price: 150, desc: 'Rice, sambar, rasam, vegetable curry, curd, papad, and a sweet.', img: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Poori Sagu (3 Pcs)', price: 75, desc: 'Puffed deep-fried wheat breads with potato and mixed vegetable gravy.', img: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Rava Khara Bath', price: 55, desc: 'Savory semolina pudding with ghee, vegetables, curry leaves, and mustard seeds.', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Pani Puri (6 Pcs)', price: 40, desc: 'Crispy hollow puris filled with spiced mashed potato and tangy tamarind water.', img: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Sizzling Brownie with Ice Cream', price: 160, desc: 'Warm chocolate brownie on a sizzler plate with vanilla ice cream and chocolate sauce.', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Cold Kulfi Stick', price: 50, desc: 'Creamy slow-churned Indian frozen dessert with saffron and cardamom flavour.', img: 'https://images.unsplash.com/photo-1579631542720-3a87824ffd8e?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Masala Chai (Large)', price: 30, desc: 'Spiced Indian milk tea brewed with ginger, cardamom, cloves, and cinnamon.', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
  { name: 'Paneer Tikka (6 Pcs)', price: 160, desc: 'Marinated cottage cheese cubes grilled in tandoor, served with mint chutney.', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format&fit=crop', dietary: 'veg' },
];

// ---------------------------------------------------------------------------
// 25 Grocery Products (with unique Unsplash images per product)
// ---------------------------------------------------------------------------
const groceryProducts = [
  { name: 'Organic Red Tomato (1kg)', price: 60, desc: 'Fresh, juicy, pesticide-free tomatoes from local farms.', unit: 'kg', img: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Potato (1kg)', price: 40, desc: 'Premium farm potatoes, ideal for roasting, baking, or boiling.', unit: 'kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop' },
  { name: 'Local Red Onion (1kg)', price: 45, desc: 'Crisp, pungent red onions — essential base for all Indian cooking.', unit: 'kg', img: 'https://images.unsplash.com/photo-1508747703725-719ae2c73ee1?q=80&w=600&auto=format&fit=crop' },
  { name: 'Nagpur Orange (1kg)', price: 90, desc: 'Juicy GI-tagged Nagpur oranges, sweet with a slight tang.', unit: 'kg', img: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop' },
  { name: 'Alphonso Mango (1kg)', price: 220, desc: 'Premium Ratnagiri Alphonso mangoes, the king of mangoes.', unit: 'kg', img: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Royal Gala Apple (1kg)', price: 180, desc: 'Sweet, crisp, nutrient-rich imported red apples.', unit: 'kg', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop' },
  { name: 'Green Seedless Grapes (500g)', price: 70, desc: 'Sweet refreshing seedless green grapes, cleaned and packed.', unit: 'g', img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=600&auto=format&fit=crop' },
  { name: 'Premium Toor Dal (1kg)', price: 160, desc: 'Unpolished high-protein split pigeon peas, free from additives.', unit: 'kg', img: 'https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop' },
  { name: 'Organic Moong Dal (1kg)', price: 140, desc: 'Light, nutritious yellow moong lentils, organic certified.', unit: 'kg', img: 'https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop' },
  { name: 'Aged Sona Masuri Rice (5kg)', price: 340, desc: 'Premium aged local rice that cooks fluffy and lightweight.', unit: 'kg', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop' },
  { name: 'Wood-Pressed Groundnut Oil (1L)', price: 220, desc: 'Cold pressed groundnut oil with natural aroma and nutrients intact.', unit: 'L', img: 'https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop' },
  { name: 'Pure Cow Ghee (500ml)', price: 360, desc: 'Aromatic pure cow ghee prepared in traditional slow-cook style.', unit: 'ml', img: 'https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Full Cream Milk (1L)', price: 68, desc: 'Pasteurized full-cream milk, rich in calcium and vitamins.', unit: 'L', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Malai Paneer (200g)', price: 95, desc: 'Extra soft cottage cheese made from fresh buffalo milk daily.', unit: 'g', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop' },
  { name: 'Organic Thick Curd (500g)', price: 40, desc: 'Thick, creamy set yogurt made from pure whole milk.', unit: 'g', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop' },
  { name: 'Whole Wheat Bread (400g)', price: 45, desc: 'Soft healthy sliced brown sandwich bread, baked fresh daily.', unit: 'g', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' },
  { name: 'Iodized Crystal Salt (1kg)', price: 20, desc: 'Clean double-refined edible crystal salt with optimal iodine content.', unit: 'kg', img: 'https://images.unsplash.com/photo-1610348725531-843dff14446c?q=80&w=600&auto=format&fit=crop' },
  { name: 'Refined White Sugar (1kg)', price: 48, desc: 'Premium sulphur-free crystal white sugar, clean and dry.', unit: 'kg', img: 'https://images.unsplash.com/photo-1610348725531-843dff14446c?q=80&w=600&auto=format&fit=crop' },
  { name: 'Organic Turmeric Powder (200g)', price: 55, desc: 'High-curcumin grounded turmeric, perfect for cooking and health.', unit: 'g', img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop' },
  { name: 'Kashmiri Red Chilli Powder (200g)', price: 75, desc: 'Authentic Kashmiri chillies ground fine — mild heat, rich colour.', unit: 'g', img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop' },
  { name: 'Raw California Almonds (250g)', price: 220, desc: 'Premium whole crunchy raw almonds packed with Vitamin E.', unit: 'g', img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600&auto=format&fit=crop' },
  { name: 'Premium Cashew Nuts (250g)', price: 240, desc: 'Large clean and crisp whole cashew nuts, premium selection.', unit: 'g', img: 'https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Pure Assam Tea Dust (500g)', price: 190, desc: 'Strong premium tea blend from finest Assam gardens.', unit: 'g', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop' },
  { name: 'Jowar (Sorghum) Flour (1kg)', price: 55, desc: 'Stone-ground sorghum flour for bhakri, dosa, and rotis — high fibre.', unit: 'kg', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop' },
  { name: 'Dishwash Liquid Gel (500ml)', price: 110, desc: 'Concentrated lemon gel — cuts grease effortlessly, fresh scent.', unit: 'ml', img: 'https://images.unsplash.com/photo-1607006342411-9a336f52431d?q=80&w=600&auto=format&fit=crop' },
];

// ---------------------------------------------------------------------------
// Seeder
// ---------------------------------------------------------------------------
async function seed() {
  await sequelize.authenticate();
  console.log('✅ Connected to database.\n');

  const allShops = [
    ...foodShops.map(s => ({ ...s, category: 'Food', verticalType: 'FB', products: foodProducts })),
    ...groceryShops.map(s => ({ ...s, category: 'Grocery', verticalType: 'GROCERY', products: groceryProducts })),
  ];

  let totalShops = 0;
  let totalProducts = 0;

  for (const shop of allShops) {
    process.stdout.write(`⏳ Seeding: ${shop.name} ... `);

    const [integration] = await Integration.findOrCreate({
      where: { phoneNumber: shop.phone },
      defaults: {
        integrationName: shop.name,
        description: shop.desc,
        logo: shop.logo,
        bannerImage: shop.banner,
        latitude: shop.lat,
        longitude: shop.lng,
        category: shop.category,
        verticalType: shop.verticalType,
        city: 'Nagpur',
        state: 'Maharashtra',
        country: 'India',
        isActive: true,
        isApproved: true,
        isOnboarded: true,
        isTubuluAppSetupDone: true,
        role: 'merchant_admin',
        deliveryFee: 20,
        minimumOrderValue: 99,
        estimatedDeliveryTime: 30,
      },
    });

    // Always update coordinates + images in case shop already existed
    await integration.update({
      integrationName: shop.name,
      description: shop.desc,
      logo: shop.logo,
      bannerImage: shop.banner,
      latitude: shop.lat,
      longitude: shop.lng,
      category: shop.category,
      verticalType: shop.verticalType,
      isActive: true,
      isApproved: true,
      isOnboarded: true,
      isTubuluAppSetupDone: true,
    });

    const [catalogue] = await Catalogue.findOrCreate({
      where: { integrationId: integration.id, name: 'Main Catalogue' },
      defaults: {
        id: uuidv4(),
        isActive: true,
        description: `Primary catalogue for ${shop.name}`,
      },
    });

    // Wipe and re-seed products cleanly
    await Product.destroy({ where: { catalogueId: catalogue.id } });

    const prefix = shop.category === 'Food' ? 'FOOD' : 'GROC';
    const productsToInsert = shop.products.map((p, idx) => ({
      id: uuidv4(),
      sku: `${prefix}-NGP-${String(idx + 1).padStart(2, '0')}-${integration.id.substring(0, 6).toUpperCase()}`,
      name: p.name,
      description: p.desc,
      price: p.price,
      discountPrice: Math.round(p.price * 0.9),
      quantity: 100,
      isActive: true,
      dietaryType: p.dietary || 'veg',
      imageUrls: [p.img],
      catalogueId: catalogue.id,
      integrationId: integration.id,
      currency: 'INR',
      specifications: { unit: p.unit || 'Pc' },
      isBestseller: idx < 3,
    }));

    await Product.bulkCreate(productsToInsert);
    totalShops++;
    totalProducts += productsToInsert.length;
    console.log(`✅ ${productsToInsert.length} products seeded.`);
  }

  console.log(`\n🎉 Done! Seeded ${totalShops} shops and ${totalProducts} products near Nagpur.`);
  console.log(`   📍 Food shops: ${foodShops.length} | Grocery shops: ${groceryShops.length}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

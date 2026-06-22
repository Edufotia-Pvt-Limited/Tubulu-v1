const { sequelize } = require('../Utils/Postgres');
const Integration = require('../Models/Integration.pg');

const foodBanners = [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop'
].join(',');

const groceryBanners = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop'
].join(',');

const coffeeBanners = [
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop'
].join(',');

const bakeryBanners = [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?q=80&w=600&auto=format&fit=crop'
].join(',');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const integrations = await Integration.findAll();
        let updatedCount = 0;

        for (const item of integrations) {
            const nameLower = (item.integrationName || '').toLowerCase();
            const categoryLower = (item.category || '').toLowerCase();
            let selectedBanners = null;

            if (nameLower.includes('coffee') || nameLower.includes('cafe')) {
                selectedBanners = coffeeBanners;
            } else if (nameLower.includes('bakery')) {
                selectedBanners = bakeryBanners;
            } else if (
                categoryLower.includes('food') ||
                categoryLower.includes('fb') ||
                categoryLower.includes('restaurant') ||
                categoryLower.includes('chat') ||
                nameLower.includes('biryani') ||
                nameLower.includes('idli') ||
                nameLower.includes('kitchen') ||
                nameLower.includes('bhavan')
            ) {
                selectedBanners = foodBanners;
            } else if (
                categoryLower.includes('grocery') ||
                categoryLower.includes('supermarket') ||
                categoryLower.includes('provision') ||
                categoryLower.includes('mart')
            ) {
                selectedBanners = groceryBanners;
            } else {
                // Default fallback
                selectedBanners = groceryBanners;
            }

            if (selectedBanners) {
                await item.update({ bannerImage: selectedBanners });
                console.log(`Updated banner images for: ${item.integrationName}`);
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} integrations.`);
        process.exit(0);
    } catch (e) {
        console.error('Failed:', e);
        process.exit(1);
    }
}

run();

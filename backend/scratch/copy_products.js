const { Sequelize } = require('sequelize');
const { config } = require('../config');
const { Integration, Catalogue, Product } = require('../Utils/Postgres');

async function run() {
    try {
        const sourceId = '908fa830-7d67-4555-8d3b-a72b20636d44'; // Anand Bakery
        const targetId = 'f1665785-dab5-4a4b-a543-109b62e9af4a'; // Anand Bakery Indiranagar

        // 1. Approve target store
        const targetStore = await Integration.findByPk(targetId);
        if (!targetStore) {
            console.error('Target store not found!');
            return;
        }
        targetStore.isApproved = true;
        targetStore.isOnboarded = true;
        await targetStore.save();
        console.log('✅ Approved target store.');

        // 2. Fetch source catalogues
        const sourceCatalogues = await Catalogue.findAll({ where: { integrationId: sourceId } });
        console.log(`Found ${sourceCatalogues.length} catalogues to copy.`);

        for (const cat of sourceCatalogues) {
            // Check if already copied to avoid duplicates
            let targetCat = await Catalogue.findOne({ 
                where: { 
                    integrationId: targetId,
                    name: cat.name 
                } 
            });

            if (!targetCat) {
                targetCat = await Catalogue.create({
                    name: cat.name,
                    description: cat.description,
                    isActive: cat.isActive,
                    displayType: cat.displayType,
                    integrationId: targetId
                });
                console.log(`Created catalogue: ${targetCat.name} (id: ${targetCat.id})`);
            } else {
                console.log(`Catalogue already exists: ${targetCat.name}`);
            }

            // 3. Copy products under this catalogue
            const sourceProducts = await Product.findAll({ 
                where: { 
                    integrationId: sourceId,
                    catalogueId: cat.id
                } 
            });
            console.log(`Found ${sourceProducts.length} products in catalogue "${cat.name}".`);

            for (const prod of sourceProducts) {
                // Check if product already exists
                const existingProd = await Product.findOne({
                    where: {
                        integrationId: targetId,
                        catalogueId: targetCat.id,
                        name: prod.name
                    }
                });

                if (!existingProd) {
                    await Product.create({
                        sku: prod.sku,
                        name: prod.name,
                        description: prod.description,
                        price: prod.price,
                        discountPrice: prod.discountPrice,
                        currency: prod.currency,
                        category: prod.category,
                        subcategory: prod.subcategory,
                        imageUrls: prod.imageUrls,
                        quantity: prod.quantity,
                        isActive: prod.isActive,
                        dietaryType: prod.dietaryType,
                        isBestseller: prod.isBestseller,
                        preparationTime: prod.preparationTime,
                        specifications: prod.specifications,
                        integrationId: targetId,
                        catalogueId: targetCat.id
                    });
                    console.log(`  - Copied product: ${prod.name}`);
                } else {
                    console.log(`  - Product already exists: ${prod.name}`);
                }
            }
        }
        console.log('🎉 Done copying catalogues and products!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

run();

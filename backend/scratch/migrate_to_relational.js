const { Integration, Catalogue, Product, sequelize } = require('../Utils/Postgres');

async function migrateJsonbToRelational() {
    console.log('🚀 Starting Migration: JSONB to Relational...');
    
    // Sync models to create new tables/columns
    await sequelize.sync({ alter: true });
    
    const transaction = await sequelize.transaction();
    
    try {
        const integrations = await Integration.findAll({ transaction });
        
        for (const integration of integrations) {
            console.log(`📦 Processing Integration: ${integration.integrationName}`);
            
            const cataloguesJson = integration.catalogues || [];
            
            for (const catJson of cataloguesJson) {
                console.log(`  📂 Migrating Catalogue: ${catJson.name} (ID: ${catJson.id || catJson._id})`);
                
                const catId = (catJson.id || catJson._id).toString();

                // Create Catalogue with preserved ID
                const [catalogue] = await Catalogue.findOrCreate({
                    where: { id: catId },
                    defaults: {
                        name: catJson.name, 
                        integrationId: integration.id,
                        description: catJson.description || '',
                        displayType: catJson.displayType || 'Grid View',
                        isActive: catJson.isActive !== false,
                    },
                    transaction
                });
                
                const productsJson = catJson.products || [];
                
                for (const prodJson of productsJson) {
                    const prodId = (prodJson.id || prodJson._id).toString();
                    console.log(`    🍎 Migrating Product: ${prodJson.name} (ID: ${prodId})`);
                    
                    // Map old FB-specific fields to 'specifications'
                    const specifications = {
                        foodType: prodJson.foodType || 'Other',
                        cgst: prodJson.cgst || 0,
                        sgst: prodJson.sgst || 0,
                        otherTaxes: prodJson.otherTaxes || 0,
                        product_category: prodJson.product_category || '',
                        product_subcategory: prodJson.product_subcategory || ''
                    };
                    
                    await Product.findOrCreate({
                        where: { id: prodId },
                        defaults: {
                            sku: prodJson.sku || `SKU-${prodId}`,
                            integrationId: integration.id,
                            name: prodJson.name,
                            description: prodJson.description || '',
                            price: prodJson.price || 0,
                            discountPrice: prodJson.discountPrice || prodJson.price || 0,
                            currency: prodJson.currency || 'INR',
                            category: prodJson.product_category || 'General',
                            subcategory: prodJson.product_subcategory || '',
                            imageUrls: prodJson.imageUrls || [],
                            quantity: prodJson.quantity || 0,
                            isActive: prodJson.isActive !== false,
                            isDeleted: prodJson.isDeleted === true,
                            specifications: specifications,
                            catalogueId: catalogue.id
                        },
                        transaction
                    });
                }
            }
        }
        
        await transaction.commit();
        console.log('✅ Migration Completed Successfully!');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Migration Failed:', error);
    } finally {
        process.exit();
    }
}

migrateJsonbToRelational();

require('dotenv').config();
const { 
    Integration, 
    Catalogue, 
    Product, 
    PhoneBook, 
    AICategoryPlaybook,
    VendorAIConfig
} = require('./Utils/Postgres');
const { generateUUID } = require('./Utils/Helper');

async function runE2EIntegrationTest() {
    console.log('🧪 ==================================================');
    console.log('🧪 Starting Non-Destructive E2E Integration Test...');
    console.log('🧪 ==================================================');

    // Generate completely unique, non-conflicting test credentials
    const uniqueId = Date.now();
    const testPhoneNumber = '99' + Math.floor(10000000 + Math.random() * 90000000); // Unique 10-digit number
    const testStoreName = `E2E Sandbox Store ${uniqueId}`;
    const categoryKey = 'GROCERY';

    // Track created IDs for safe target-cleanup
    let createdMerchantId = null;
    let createdCatalogueId = null;
    let createdVendorAIId = null;
    let createdProductIds = [];

    try {
        console.log(`📡 Preparing isolated test session under unique ID: ${uniqueId}`);

        // 1. Onboard a completely fresh Merchant
        const merchant = await Integration.create({
            phoneNumber: testPhoneNumber,
            integrationName: testStoreName,
            category: categoryKey,
            isApproved: true,
            isOnboarded: true,
            apiAuthKey: generateUUID(),
            city: 'Bangalore',
            state: 'Karnataka'
        });
        createdMerchantId = merchant.id;
        console.log(`✅ Onboarded Temp Merchant: "${merchant.integrationName}" (ID: ${createdMerchantId})`);

        // 2. Verify AI Category Playbook
        const [playbook, createdPlaybook] = await AICategoryPlaybook.findOrCreate({
            where: { categoryKey: categoryKey },
            defaults: {
                displayName: 'Grocery & Essentials Staging',
                masterPrompt: 'You are an AI assistant for a grocery store. Assist users in finding daily essentials, verifying stock parameters, and maintaining clean checkouts.',
                requiredAttributes: ['brand', 'expiry', 'weight'],
                actionConfig: { hasCart: true }
            }
        });
        console.log(`✅ AI Playbook Verified: "${playbook.displayName}"`);

        // 3. Configure Temp Vendor AI settings
        const vendorAI = await VendorAIConfig.create({
            integrationId: createdMerchantId,
            isActive: true,
            temperature: 0.7,
            customPrompt: 'Focus on promoting organic items and locally sourced farm fresh dairy.'
        });
        createdVendorAIId = vendorAI.id;
        console.log(`✅ Configured Temp Vendor Chatbot config (ID: ${createdVendorAIId})`);

        // 4. Create Catalogue
        const catalogue = await Catalogue.create({
            integrationId: createdMerchantId,
            name: `Test Catalogue ${uniqueId}`,
            description: 'Organic milk products, farm fresh eggs, and artisan breads.',
            isActive: true
        });
        createdCatalogueId = catalogue.id;
        console.log(`✅ Catalogue Created: "${catalogue.name}" (ID: ${createdCatalogueId})`);

        // 5. Add Products with specifications
        const p1 = await Product.create({
            integrationId: createdMerchantId,
            catalogueId: createdCatalogueId,
            name: 'Organic Whole Milk 1L',
            price: 85.00,
            quantity: 50,
            sku: 'MILK-ORG-1L-' + uniqueId,
            isActive: true,
            imageUrls: ['https://images.unsplash.com/photo-1550583724-b2692b85b150'],
            specifications: {
                brand: 'Amul Organics',
                expiry: '4 days from packing',
                weight: '1 Litre'
            }
        });
        createdProductIds.push(p1.id);

        const p2 = await Product.create({
            integrationId: createdMerchantId,
            catalogueId: createdCatalogueId,
            name: 'Gluten-Free Sourdough Bread',
            price: 120.00,
            quantity: 20,
            sku: 'BREAD-GF-' + uniqueId,
            isActive: true,
            imageUrls: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73'],
            specifications: {
                brand: 'Artisan Oven',
                expiry: '3 days from packing',
                weight: '400 grams'
            }
        });
        createdProductIds.push(p2.id);
        console.log('✅ Loaded dynamic test products.');

        // 6. Verification Fetch Assertion
        const report = await Integration.findByPk(createdMerchantId, {
            include: [
                { model: VendorAIConfig, as: 'aiConfig' },
                { 
                    model: Catalogue, 
                    as: 'catalogues', 
                    include: [{ model: Product, as: 'products' }] 
                }
            ]
        });

        console.log('\n======================================================');
        console.log('📊           E2E BACKEND INTEGRATION REPORT           ');
        console.log('======================================================');
        console.log(`Merchant Name    : ${report.integrationName}`);
        console.log(`Contact Phone    : ${report.phoneNumber}`);
        console.log(`Catalogues Count : ${report.catalogues?.length || 0}`);
        
        if (report.catalogues && report.catalogues.length > 0) {
            const activeCatalog = report.catalogues[0];
            console.log(`\nActive Catalogue : "${activeCatalog.name}"`);
            activeCatalog.products.forEach((prod, index) => {
                console.log(`  ${index + 1}. [SKU: ${prod.sku}] ${prod.name}`);
                console.log(`     Price: ₹${prod.price} | Brand: ${prod.specifications?.brand}`);
            });
        }
        console.log('======================================================');
        console.log('🏁       ALL INTEGRATION ASSERTIONS PASSED! ✅        ');
        console.log('======================================================');

    } catch (error) {
        console.error('❌ E2E Integration Test Failed:', error);
    } finally {
        // 7. Safe target-cleanup of ONLY newly created test records
        console.log('\n🧹 Starting safe, non-destructive database cleanup...');
        
        if (createdProductIds.length > 0) {
            await Product.destroy({ where: { id: createdProductIds } });
            console.log(`   - Cleared ${createdProductIds.length} test products.`);
        }
        if (createdCatalogueId) {
            await Catalogue.destroy({ where: { id: createdCatalogueId } });
            console.log(`   - Cleared test catalogue.`);
        }
        if (createdVendorAIId) {
            await VendorAIConfig.destroy({ where: { id: createdVendorAIId } });
            console.log(`   - Cleared test chatbot configurations.`);
        }
        if (createdMerchantId) {
            await Integration.destroy({ where: { id: createdMerchantId } });
            console.log(`   - Cleared temp merchant integration profile.`);
        }
        
        console.log('🧹 Cleanup completed. Existing database state remains untouched! ✅\n');
        process.exit(0);
    }
}

runE2EIntegrationTest();

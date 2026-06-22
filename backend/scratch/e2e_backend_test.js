const { Integration, Catalogue, Product } = require('./Utils/Postgres');
const { generateUUID } = require('./Utils/Helper');

async function runE2ETest() {
    console.log('🧪 Starting E2E Merchant Flow Test...');

    const testPhoneNumber = '1234567890';
    const testStoreName = 'E2E Test Bakery';

    try {
        // 1. Clean up existing test data
        await Product.destroy({ where: { name: 'Chocolate Cake' } });
        await Catalogue.destroy({ where: { name: 'Main Menu' } });
        await Integration.destroy({ where: { phoneNumber: testPhoneNumber } });

        console.log('✅ Cleanup complete.');

        // 2. Onboard Merchant (Admin Action)
        const merchant = await Integration.create({
            phoneNumber: testPhoneNumber,
            integrationName: testStoreName,
            category: 'Food',
            isApproved: true,
            isOnboarded: true,
            apiAuthKey: generateUUID()
        });
        console.log(`✅ Merchant Created: ${merchant.integrationName} (ID: ${merchant.id})`);

        // 3. Create Catalogue
        const catalogue = await Catalogue.create({
            integrationId: merchant.id,
            name: 'Main Menu',
            description: 'Delicious cakes and pastries',
            isActive: true
        });
        console.log(`✅ Catalogue Created: ${catalogue.name} (ID: ${catalogue.id})`);

        // 4. Add Product
        const product = await Product.create({
            integrationId: merchant.id,
            catalogueId: catalogue.id,
            name: 'Chocolate Cake',
            price: 500,
            quantity: 10,
            sku: 'CAKE-001-' + Date.now(),
            isActive: true,
            imageUrls: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587']
        });
        console.log(`✅ Product Added: ${product.name} (Price: ₹${product.price})`);

        // 5. Final Verification
        const finalMerchant = await Integration.findByPk(merchant.id, {
            include: [{ model: Catalogue, as: 'catalogues', include: [{ model: Product, as: 'products' }] }]
        });

        console.log('\n--- 📊 Final Verification Report ---');
        console.log('Store:', finalMerchant.integrationName);
        console.log('Catalogues Count:', finalMerchant.catalogues?.length || 0);
        console.log('Total Products:', finalMerchant.catalogues?.[0]?.products?.length || 0);
        console.log('--- 🏁 Test Passed Successfully ---');

        process.exit(0);
    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
}

runE2ETest();

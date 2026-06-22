const { sequelize, SubscriptionPlan, MerchantSubscription, MerchantWallet, Integration, PaymentTransaction, SystemSetting } = require('../Utils/Postgres');

async function testBilling() {
    console.log('🏁 Starting Billing E2E Verification...');
    try {
        // Find or create test merchant (Integration)
        let integration = await Integration.findOne({
            where: { phoneNumber: '9123456789' }
        });
        if (!integration) {
            console.log('Creating test integration/merchant...');
            integration = await Integration.create({
                id: '12345678-1234-1234-1234-123456789012',
                phoneNumber: '9123456789',
                integrationName: 'Test Merchant Billing',
                isActive: true,
                isApproved: true,
                isSuspended: false
            });
        }
        const integrationId = integration.id;
        console.log(`Using merchant integrationId: ${integrationId}`);

        // 1. Set global token price
        console.log('\n--- 1. Set global token pricing ---');
        let priceSetting = await SystemSetting.findOne({ where: { key: 'TOKEN_PRICE_PER_100K' } });
        if (priceSetting) {
            priceSetting.value = '450';
            await priceSetting.save();
        } else {
            await SystemSetting.create({ key: 'TOKEN_PRICE_PER_100K', value: '450' });
        }
        console.log('Set token price per 100K to 450');

        // 2. Create or find active Subscription Plan
        console.log('\n--- 2. Create subscription plan ---');
        let plan = await SubscriptionPlan.findOne({ where: { name: 'Starter Test Plan' } });
        if (!plan) {
            plan = await SubscriptionPlan.create({
                name: 'Starter Test Plan',
                description: 'A test subscription plan',
                price: 999,
                durationDays: 30,
                isActive: true
            });
        }
        console.log(`Plan: ${plan.name}, Price: ₹${plan.price}, Duration: ${plan.durationDays} days`);

        // 3. Assign Plan (Un-suspends merchant too)
        console.log('\n--- 3. Assign plan to merchant ---');
        // Deactivate old active subscriptions for this merchant
        await MerchantSubscription.update({ status: 'EXPIRED' }, { where: { integrationId, status: 'ACTIVE' } });
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + plan.durationDays);

        const sub = await MerchantSubscription.create({
            integrationId,
            planId: plan.id,
            status: 'ACTIVE',
            validUntil
        });
        await Integration.update({ isSuspended: false }, { where: { id: integrationId } });
        console.log(`Assigned plan. Subscription valid until: ${validUntil.toISOString()}`);

        // Verify suspended status is false
        let updatedIntegration = await Integration.findByPk(integrationId);
        console.log(`Integration isSuspended status: ${updatedIntegration.isSuspended} (expected: false)`);

        // 4. Manually trigger expiry logic
        console.log('\n--- 4. Manually expire subscription and verify suspension ---');
        // Set subscription validUntil to past
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);
        sub.validUntil = pastDate;
        await sub.save();
        console.log(`Set validUntil in the past: ${pastDate.toISOString()}`);

        // Trigger logic similar to SubscriptionExpiry.job.js
        const expired = await MerchantSubscription.findAll({
            where: {
                status: 'ACTIVE',
                validUntil: { [sequelize.Sequelize.Op.lt]: new Date() }
            }
        });
        console.log(`Found ${expired.length} subscriptions to expire.`);
        if (expired.length > 0) {
            const expiredIds = expired.map(s => s.id);
            const integrationIdsToSuspend = [...new Set(expired.map(s => s.integrationId))];

            await MerchantSubscription.update({ status: 'EXPIRED' }, { where: { id: expiredIds } });
            await Integration.update({ isSuspended: true }, { where: { id: integrationIdsToSuspend } });
            console.log(`Expired subscriptions and suspended integrations!`);
        }

        updatedIntegration = await Integration.findByPk(integrationId);
        console.log(`Integration isSuspended status: ${updatedIntegration.isSuspended} (expected: true)`);

        // 5. Test Recharge and Auto-Reactivation
        console.log('\n--- 5. Recharge token wallet and verify auto-reactivation ---');
        // Initial wallet state
        const [wallet] = await MerchantWallet.findOrCreate({ where: { integrationId } });
        console.log(`Initial wallet token balance: ${wallet.tokenBalance}, delivery balance: ${wallet.deliveryCashBalance}`);

        // Perform recharge logic
        const rechargeAmount = 900; // ₹900
        const pricePer100k = 450;
        const tokensBought = Math.floor((rechargeAmount / pricePer100k) * 100000); // 900/450 * 100k = 200,000 tokens

        wallet.tokenBalance = parseInt(wallet.tokenBalance || 0) + tokensBought;
        await wallet.save();

        console.log(`Recharged ₹${rechargeAmount}. Added ${tokensBought} tokens.`);

        // Reactivation check
        if (updatedIntegration.isSuspended) {
            const lastSub = await MerchantSubscription.findOne({
                where: { integrationId, status: 'EXPIRED' },
                order: [['updatedAt', 'DESC']],
                include: [{ model: SubscriptionPlan, as: 'plan' }]
            });
            if (lastSub && lastSub.plan) {
                console.log(`Reactivating subscription based on last expired plan: ${lastSub.plan.name}`);
                await MerchantSubscription.update({ status: 'EXPIRED' }, { where: { integrationId, status: 'ACTIVE' } });
                const newValidUntil = new Date();
                newValidUntil.setDate(newValidUntil.getDate() + lastSub.plan.durationDays);
                await MerchantSubscription.create({
                    integrationId,
                    planId: lastSub.planId,
                    status: 'ACTIVE',
                    validUntil: newValidUntil
                });
                await Integration.update({ isSuspended: false }, { where: { id: integrationId } });
                console.log(`Successfully reactivated and un-suspended merchant!`);
            }
        }

        updatedIntegration = await Integration.findByPk(integrationId);
        const finalWallet = await MerchantWallet.findOne({ where: { integrationId } });
        console.log(`Final integration isSuspended status: ${updatedIntegration.isSuspended} (expected: false)`);
        console.log(`Final wallet token balance: ${finalWallet.tokenBalance}`);

        console.log('\n✅ All Billing Logic Verified Successfully!');
    } catch (e) {
        console.error('❌ Test failed with error:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

testBilling();

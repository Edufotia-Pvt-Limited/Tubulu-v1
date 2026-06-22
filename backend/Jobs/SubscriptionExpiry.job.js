const cron = require('node-cron');
const MerchantSubscription = require('../Models/MerchantSubscription.pg.js');
const Integration = require('../Models/Integration.pg.js');
const { Op } = require('sequelize');

// Runs every day at 00:01 AM
cron.schedule('1 0 * * *', async () => {
    console.log('[BILLING CRON] Running subscription expiry check...', new Date().toISOString());
    try {
        // Find all active subscriptions that have passed validUntil
        const expired = await MerchantSubscription.findAll({
            where: {
                status: 'ACTIVE',
                validUntil: { [Op.lt]: new Date() },
            },
            attributes: ['id', 'integrationId'],
        });

        if (expired.length === 0) {
            console.log('[BILLING CRON] No expired subscriptions found.');
            return;
        }

        const expiredIds = expired.map((s) => s.id);
        const integrationIds = [...new Set(expired.map((s) => s.integrationId))];

        // Batch expire subscriptions
        await MerchantSubscription.update(
            { status: 'EXPIRED' },
            { where: { id: { [Op.in]: expiredIds } } }
        );

        // Batch suspend integrations
        await Integration.update(
            { isSuspended: true },
            { where: { id: { [Op.in]: integrationIds } } }
        );

        console.log(`[BILLING CRON] ✅ Expired ${expiredIds.length} subscriptions, suspended ${integrationIds.length} merchants.`);
    } catch (err) {
        console.error('[BILLING CRON] ❌ Error during subscription expiry:', err.message);
    }
});

console.log('[BILLING CRON] Subscription expiry job scheduled (daily at 00:01 AM).');

module.exports = {};

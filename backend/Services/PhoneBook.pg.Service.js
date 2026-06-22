const { PhoneBook, User } = require('../Utils/Postgres');
const { generateUUID } = require('../Utils/Helper');

/**
 * Record a customer's interaction with a merchant.
 * If the link doesn't exist, create one.
 */
async function recordMerchantCustomer(userId, integrationId) {
    try {
        if (!userId || !integrationId) return;

        // Check if relationship already exists
        const existing = await PhoneBook.findOne({
            where: { userId, integrationId }
        });

        if (!existing) {
            console.log(`[CUSTOMER CAPTURE] Linking User ${userId} to Merchant ${integrationId}`);
            await PhoneBook.create({
                userId,
                integrationId,
                uuid: generateUUID()
            });
        }
    } catch (error) {
        console.error('[CUSTOMER CAPTURE] Error recording interaction:', error);
    }
}

/**
 * Get all customers for a specific merchant
 */
async function getMerchantCustomers(integrationId) {
    return PhoneBook.findAll({
        where: { integrationId },
        include: [{
            model: User,
            as: 'user'
        }]
    });
}

module.exports = {
    recordMerchantCustomer,
    getMerchantCustomers
};

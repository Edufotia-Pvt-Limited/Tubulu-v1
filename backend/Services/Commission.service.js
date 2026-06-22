const { Settlement, Integration } = require('../Utils/Postgres');

/**
 * Calculates and records commission for a regional partner when their sub-vendor makes a sale.
 */
async function processOrderCommission(order) {
  try {
    const { integrationId, total, id: orderId } = order;

    // 1. Find the vendor and their parent partner
    const vendor = await Integration.findByPk(integrationId);
    if (!vendor || !vendor.parentId) return null;

    const partner = await Integration.findByPk(vendor.parentId);
    if (!partner || partner.role !== 'regional_partner') return null;

    // 2. Calculate commission amount
    const rate = partner.commissionRate || 0;
    if (rate <= 0) return null;

    const commissionAmount = (total * rate) / 100;

    // 3. Create a settlement record for the partner
    const settlement = await Settlement.create({
      integrationId: partner.id,
      amount: commissionAmount,
      status: 'pending',
      type: 'commission',
      description: `Commission for Order #${orderId} from ${vendor.integrationName}`,
      metadata: {
        orderId,
        vendorId: vendor.id,
        vendorName: vendor.integrationName,
        orderTotal: total,
        rate: rate
      }
    });

    console.log(`[COMMISSION] Recorded ${commissionAmount} for Partner ${partner.integrationName} (Order #${orderId})`);
    return settlement;
  } catch (error) {
    console.error('[COMMISSION] Error processing commission:', error);
    return null;
  }
}

module.exports = {
  processOrderCommission
};

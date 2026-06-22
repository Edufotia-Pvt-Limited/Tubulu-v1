const { Order } = require('../Utils/Postgres');
const { updateOrderStatusService } = require('../Services/Order.Service');

const handlePidgeWebhook = async (req, res, next) => {
  try {
    console.log('[Pidge Webhook] Received payload:', JSON.stringify(req.body));
    const { status } = req.body;
    const pidgeOrderId = req.body.order_id || req.body.pidgeOrderId || req.body.pidge_order_id;

    if (!pidgeOrderId) {
      console.warn('[Pidge Webhook] Missing order_id in payload');
      return res.status(400).json({ success: false, message: 'Missing order_id' });
    }

    if (!status) {
      console.warn('[Pidge Webhook] Missing status in payload');
      return res.status(400).json({ success: false, message: 'Missing status' });
    }

    // Map Pidge status to Tubulu status
    let tubuluStatus = null;
    if (status === 'fulfilled|ofd') {
      tubuluStatus = 'dispatched';
    } else if (status === 'fulfilled|delivered') {
      tubuluStatus = 'delivered';
    } else if (status === 'fulfilled|returned') {
      tubuluStatus = 'canceled';
    }

    if (!tubuluStatus) {
      console.log(`[Pidge Webhook] Unhandled Pidge status: ${status}. No-op.`);
      return res.status(200).json({ success: true, message: `Unhandled status: ${status}. No action taken.` });
    }

    // Find order by pidgeOrderId
    const order = await Order.findOne({ where: { pidgeOrderId } });
    if (!order) {
      console.warn(`[Pidge Webhook] Order not found for pidgeOrderId: ${pidgeOrderId}`);
      return res.status(404).json({ success: false, message: `Order not found for pidgeOrderId: ${pidgeOrderId}` });
    }

    console.log(`[Pidge Webhook] Found Order #${order.id} for pidgeOrderId ${pidgeOrderId}. Transitioning status to ${tubuluStatus}`);

    // Update the status using updateOrderStatusService
    await updateOrderStatusService(
      order.id,
      tubuluStatus,
      order.integrationId,
      status === 'fulfilled|returned' ? 'Returned by Pidge delivery partner' : null
    );

    console.log(`[Pidge Webhook] Successfully updated Order #${order.id} to status ${tubuluStatus}`);
    return res.status(200).json({ success: true, message: `Order status updated to ${tubuluStatus}` });
  } catch (error) {
    console.error('[Pidge Webhook] Error processing webhook:', error);
    next(error);
  }
};

const getPidgeQuote = async (req, res, next) => {
  try {
    const { integrationId, lat, lng } = req.query;

    if (!integrationId) {
      return res.status(400).json({ success: false, message: 'Missing integrationId' });
    }
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Missing latitude (lat) or longitude (lng)' });
    }

    const { Integration } = require('../Utils/Postgres');
    const integration = await Integration.findByPk(integrationId);
    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    if (!integration.pidge || !integration.pidge.enabled) {
      return res.status(400).json({ success: false, message: 'Pidge delivery is not enabled for this integration' });
    }

    const PidgeService = require('../Services/Pidge.Service');
    const username = integration.pidge.username;
    const password = integration.pidge.password;
    const env = integration.pidge.environment || 'sandbox';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Pidge credentials are not configured' });
    }

    // Authenticate
    const token = await PidgeService.authenticate(username, password, env);

    // Resolve pickup coordinates
    let pickupLat = parseFloat(integration.latitude);
    let pickupLng = parseFloat(integration.longitude);
    if (isNaN(pickupLat) || isNaN(pickupLng)) {
      console.warn('Pidge Quote: Integration/pickup coordinates missing. Using Mysore fallback coords.');
      pickupLat = 12.3237008;
      pickupLng = 76.6022778;
    }

    const quoteResult = await PidgeService.getDeliveryQuote(token, env, pickupLat, pickupLng, parseFloat(lat), parseFloat(lng));
    if (!quoteResult) {
      return res.status(200).json({
        success: true,
        serviceable: false,
        message: 'Location is not serviceable by Pidge'
      });
    }

    return res.status(200).json({
      success: true,
      serviceable: true,
      estimatedFare: quoteResult.estimatedFare,
      distanceKm: quoteResult.distanceKm,
      currency: quoteResult.currency
    });
  } catch (error) {
    console.error('[Pidge Quote API] Error fetching quote:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const testPidgeConnection = async (req, res, next) => {
  try {
    const { username, password, environment, integrationId } = req.body;
    const targetIntegrationId = integrationId || req.id || (req.user && req.user.id);

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    let pidgePassword = password;
    if (!pidgePassword || pidgePassword.startsWith('*')) {
      if (targetIntegrationId) {
        const { Integration } = require('../Utils/Postgres');
        const integration = await Integration.findByPk(targetIntegrationId);
        if (integration && integration.pidge && integration.pidge.password) {
          pidgePassword = integration.pidge.password;
        }
      }
    }

    if (!pidgePassword) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const env = environment || 'sandbox';
    const PidgeService = require('../Services/Pidge.Service');

    // Force fresh authentication
    PidgeService.invalidateToken(username, env);
    const token = await PidgeService.authenticate(username, pidgePassword, env);

    if (token) {
      return res.status(200).json({
        success: true,
        message: `Successfully connected to Pidge ${env === 'production' ? 'Production' : 'Sandbox'}`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Authentication failed: No token returned'
      });
    }
  } catch (error) {
    console.error('[Pidge Test Connection Error]:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Connection failed'
    });
  }
};

module.exports = {
  handlePidgeWebhook,
  getPidgeQuote,
  testPidgeConnection,
};


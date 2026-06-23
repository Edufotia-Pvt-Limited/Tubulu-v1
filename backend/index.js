require('dotenv').config();
const express = require("express");
const path = require("path");
const { logger } = require("./Utils/Logger");
const app = express();
const { config } = require("./config");
const { connectPostgres } = require("./Utils/Postgres");

// Connect to PostgreSQL
connectPostgres();
const cors = require('cors');
require('./Utils/cron.helper');
require('./Utils/razorpayToken.cron'); 
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { Queue } = require('bullmq');

const sendingQueue = new Queue('CAMPAIGN_SEND_QUEUE', {
  connection: {
    host: 'localhost',
    port: 6379,
  }
})

const campaignQueue = new Queue('CAMPAIGN_QUEUE', {
  connection: {
    host: 'localhost',
    port: '6379'
  }
});


const serverAdapter = new ExpressAdapter();
const bullBoard = createBullBoard({
  queues: [new BullMQAdapter(campaignQueue), new BullMQAdapter(sendingQueue)],
  serverAdapter: serverAdapter,
});
serverAdapter.setBasePath("/admin");

//Routes
const UserRoutes = require("./Routes/User.Routes")
const IntegrationRoutes = require("./Routes/Integration.Route");
const UserDeviceRoutes = require("./Routes/UserDevice.Routes");
const ChatRoomRoutes = require('./Routes/ChatRoom.Route');
const ChatMessageRoutes = require('./Routes/ChatMessage.Route');
const ChatDocumentRoutes = require('./Routes/ChatDocument.Routes');
const MessageNoteRoutes = require('./Routes/MessageNotes.routes');
const MessageBookmarkRoutes = require('./Routes/MessageBookmark.routes');
const CategoryRoutes = require('./Routes/Category.Routes');
const BlockedIntegrationRoutes = require('./Routes/BlockedIntegration.Routes');
const insertBulkMessages = require("./Utils/bulkInsertPOC");
const QRCodesRoutes = require('./Routes/QRCode.Routes');
const CampaignRoutes = require('./Routes/Campaign.Routes');
const CatalogueRoutes = require('./Routes/Catalogue.Routes');
const ProductRoutes = require('./Routes/Product.Routes');
const UserAddressRoutes =  require('./Routes/UserAddress.Routes');
const CartRoutes = require('./Routes/Cart.Routes')
const OrderRoutes = require('./Routes/Order.Routes')
const CustomerRoutes = require('./Routes/Customer.Routes')
const CustmizationRoutes = require('./Routes/Custmization.Routes')
const DealRoutes = require('./Routes/Deal.Routes')
const AdvertisementRoutes = require('./Routes/Advertisment.Routes')
const PaymentConnectionRoutes = require('./Routes/PaymentConection.Routes')
const ChatbotRoutes = require('./Routes/Chatbot.Route');
const SettlementRoutes = require('./Routes/Settlement.Route');
const AdminRoutes = require("./Routes/Admin.routes");
const AIRoutes = require("./Routes/AI.Route");
const AIPlaybookRoutes = require("./Routes/AIPlaybook.routes");
const WhatsAppRoutes = require("./Routes/WhatsApp.Routes");
const AdminStaffRoutes = require("./Routes/AdminStaff.Routes");
const SupportRoutes = require("./Routes/Support.Routes");

app.use(cors())

app.use((req, res, next) => { console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.url); next(); });
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/api/v1/orders/razorpay/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({
  limit: '50mb'
}));

// Global UUID sanitization middleware to prevent PostgreSQL 22P02 string_to_uuid database errors
const uuidFields = [
  'integrationId', 'id', 'cartId', 'catalogueId', 'addressId', 'userId', 
  'chatRoomId', 'branchId', 'parentId', 'stateId', 'cityId', 'countryId',
  'partnerId', 'orderId', 'customerId', 'messageId', 'productId'
];
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeUUIDs(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (uuidFields.includes(key)) {
      const val = obj[key];
      if (typeof val === 'string' && val.trim() === '') {
        obj[key] = null;
      } else if (typeof val === 'string' && val !== 'null' && val !== 'undefined') {
        if (!uuidRegex.test(val)) {
          obj[key] = null;
        }
      }
    } else if (typeof obj[key] === 'object') {
      sanitizeUUIDs(obj[key]);
    }
  }
}

app.use((req, res, next) => {
  sanitizeUUIDs(req.body);
  sanitizeUUIDs(req.query);
  sanitizeUUIDs(req.params);
  next();
});

app.use("/admin", serverAdapter.getRouter());
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/integrations', IntegrationRoutes);
app.use('/api/v1/userDevice', UserDeviceRoutes);
app.use('/api/v1/chatRoom', ChatRoomRoutes);
app.use('/api/v1/chatMessage', ChatMessageRoutes);
app.use('/api/v1/chatDocument', ChatDocumentRoutes);
app.use('/api/v1/notes', MessageNoteRoutes);
app.use('/api/v1/bookmarks', MessageBookmarkRoutes);
app.use('/api/v1/categories', CategoryRoutes);
app.use('/api/v1/blockedIntegrations', BlockedIntegrationRoutes);
app.use('/api/v1/qrcode', QRCodesRoutes);
app.use('/api/v1/campaign', CampaignRoutes);
app.use('/api/v1/catalogue',CatalogueRoutes)
app.use('/api/v1/products',ProductRoutes)
app.use('/api/v1/address',UserAddressRoutes)
app.use('/api/v1/cart',CartRoutes)
app.use('/api/v1/orders', OrderRoutes)
app.use('/api/v1/customer',CustomerRoutes)
app.use('/api/v1/customization',CustmizationRoutes)
app.use('/api/v1/deal', DealRoutes)
app.use('/api/v1/advertisement', AdvertisementRoutes)
app.use('/api/v1/payment-connection', PaymentConnectionRoutes);
app.use('/api/v1/whatsapp', WhatsAppRoutes);
app.use('/api/v1/public', require('./Routes/Public.Routes'));
app.use('/api/v1/chatbot', ChatbotRoutes);
app.use('/api/v1/settlements', SettlementRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/ai", AIRoutes);
app.use("/api/v1/ai-playbooks", AIPlaybookRoutes);
app.use('/api/v1/admin/staff', AdminStaffRoutes);
app.use('/api/v1/support', SupportRoutes);
app.use('/api/v1/locations', require('./Routes/Location.Routes'));
app.use('/api/v1/enabler', require('./Routes/Enabler.routes'));
app.use('/api/v1/deliveries', require('./Routes/Delivery.Routes'));
app.use('/api/v1/feeds', require('./Routes/StoreFeed.routes'));
app.use('/api/v1/billing', require('./Routes/Billing.routes'));
require('./Jobs/SubscriptionExpiry.job'); // Daily subscription expiry cron


app.use('/.well-known/assetlinks.json', (req, res, next) => {
  res.send([{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.tubulubot",
      "sha256_cert_fingerprints": ["FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"]
    }
  }])
})

// handling the common error codes coming in
app.use('/', (err, req, res, next) => {
  logger.error('Global Error Handler caught an error:');
  logger.error(err.message);
  if (err.stack) logger.error(err.stack);
  console.error(err);
  
  res.status(err.statusCode || 500);
  res.json({
    success: false,
    message: err.message,
    errors: err.errors || []
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(3008, '0.0.0.0', () => {
      logger.log("Successfully started the server at port 3008 with PostgreSQL");
  });
}

module.exports = app;

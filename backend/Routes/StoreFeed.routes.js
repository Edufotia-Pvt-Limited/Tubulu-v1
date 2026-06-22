const express = require('express');
const router = express.Router();
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const StoreFeedController = require('../Controllers/StoreFeed.controller');

// Merchant Endpoints
router.post('/merchants/feeds', verifyIntegrationToken, StoreFeedController.createFeed);
router.get('/merchants/feeds', verifyIntegrationToken, StoreFeedController.getMerchantFeeds);
router.delete('/merchants/feeds/:id', verifyIntegrationToken, StoreFeedController.deleteFeed);

// Public Endpoints (Customer App)
router.get('/public/stores/:storeId/feeds', StoreFeedController.getPublicStoreFeeds);

module.exports = router;

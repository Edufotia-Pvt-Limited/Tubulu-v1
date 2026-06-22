const express = require('express');
const router = express.Router();
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');
const SettlementController = require('../Controllers/Settlement.controller');

router.get('/merchant', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), SettlementController.getMerchantSettlements);

module.exports = router;

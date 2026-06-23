const express = require('express');
const router = express.Router();
const { handlePidgeWebhook, getPidgeQuote, testPidgeConnection } = require('../Controllers/Pidge.Controller');
const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');

// Pidge webhook status updates
router.post('/pidge/webhook', handlePidgeWebhook);

// Get live Pidge delivery quote
router.get('/pidge/quote', verifyToken, getPidgeQuote);

// Test Pidge connection credentials
router.post('/pidge/test-connection', verifyIntegrationToken, testPidgeConnection);

module.exports = router;

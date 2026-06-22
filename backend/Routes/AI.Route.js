const express = require('express');
const router = express.Router();
const AIController = require('../Controllers/AI.controller');
const VendorAIController = require('../Controllers/VendorAI.controller');
const { verifyIntegrationToken, verifyToken } = require('../MiddleWare/VerifyToken.Middleware');

router.post('/extract-kyc', verifyIntegrationToken, AIController.extractKycDataController);
router.post('/generate-description', verifyIntegrationToken, AIController.generateDescriptionController);

// Global Concierge AI Chat
router.post('/global-chat', verifyToken, AIController.globalChatController);

// Vendor AI Config
router.get('/config', verifyIntegrationToken, VendorAIController.getMyAIConfig);
router.post('/config', verifyIntegrationToken, VendorAIController.updateMyAIConfig);

module.exports = router;

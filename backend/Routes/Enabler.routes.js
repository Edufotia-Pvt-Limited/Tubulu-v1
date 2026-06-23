const express = require('express');
const router = express.Router();
const enablerController = require('../Controllers/Enabler.controller');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');
const { checkEnablerCityLock } = require('../MiddleWare/rbacGuard');

// Require authentication token for all routes
router.use(verifyIntegrationToken);

// Enabler specific routes
router.post('/submit', roleGuard('enabler'), checkEnablerCityLock, enablerController.submitMerchant);
router.get('/my-submissions', roleGuard('enabler', 'city_manager'), enablerController.getMySubmissions);
router.post('/upload-doc', roleGuard('enabler'), enablerController.uploadDocument);
router.get('/my-stats', roleGuard('enabler'), enablerController.getMyStats);

// City Manager specific routes to manage enablers and reviews
router.get('/city/enablers', roleGuard('city_manager'), enablerController.getCityEnablers);
router.post('/review', roleGuard('city_manager'), enablerController.reviewSubmission);

module.exports = router;

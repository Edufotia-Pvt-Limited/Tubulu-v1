const express = require('express');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');
const { createDealController, getAllDealsController, updateDealController, deleteDealController, updateDealStatusController, updateDealOfTheDayStatusController, applyDealsOnProducts, getApplyDealsDetailsController, getDealProductsForApplyController } = require('../Controllers/Deal.controller');

const router = express.Router();

router.post('/create', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), createDealController);
router.get('/get-deals', verifyIntegrationToken, getAllDealsController);

router.patch('/edit/:dealId', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), updateDealController);

router.delete('/delete/:dealId', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), deleteDealController);

router.put('/update-status', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), updateDealStatusController);

router.put('/update-dod-status', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), updateDealOfTheDayStatusController);
router.post('/apply', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), applyDealsOnProducts);
router.get('/get/apply/:dealId', verifyIntegrationToken, getApplyDealsDetailsController);

router.get('/get/products/:dealId/:catalogueId', verifyIntegrationToken, getDealProductsForApplyController);
module.exports = router;
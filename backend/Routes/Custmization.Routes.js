const express = require('express');
const router = express.Router();

const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');
const {
  createCustomization, getAllCustomizations, deleteCustomization,
  updateCustomizationStatus, getCustomizationById, editCustomization,
  getAllOptionsByCustomizationId, deleteOptionByOptionId, updateOptionStatus,
  addOption, getSingleOptionById, editOption,
  getCustomizationDetailsForApply, applyProductCustomization, searchProductsForCustomization
} = require('../Controllers/Custmization.controller');

// Base: /api/customizations
router.post('/create', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), createCustomization);
router.get('/all', verifyIntegrationToken, getAllCustomizations);
router.delete('/delete/:id', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), deleteCustomization);
router.put('/update-status', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), updateCustomizationStatus);
router.get('/get/:id', verifyIntegrationToken, getCustomizationById);
router.put('/edit/:id', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), editCustomization);

// Option routes
router.get('/options/all/:customizationId', verifyIntegrationToken, getAllOptionsByCustomizationId);
router.delete('/options/delete/:customizationId/:optionId', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), deleteOptionByOptionId);
router.put('/options/update-status', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), updateOptionStatus);
router.post('/options/add/:customizationId', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), addOption);
router.get('/options/get/:customizationId/:optionId', verifyIntegrationToken, getSingleOptionById);
router.put('/options/edit/:customizationId/:optionId', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), editOption);

// Apply customization
router.get('/get/apply/:customizationId', verifyIntegrationToken, getCustomizationDetailsForApply);
router.post('/apply', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), applyProductCustomization);
router.get('/search-products/:catalogueId/:customizationId', verifyIntegrationToken, searchProductsForCustomization);

module.exports = router;

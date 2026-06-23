const express = require('express');
const router = express.Router();
const { viewPublicReceipt, downloadReceiptPDF, viewPublicStore, scanQRCode, placePublicOrder, scanStoreQR } = require('../Controllers/Public.controller');

// Publicly accessible routes (No Auth required)
// These are used for links sent via WhatsApp/SMS
router.get('/receipt/:orderId', viewPublicReceipt);
router.get('/receipt/:orderId/pdf', downloadReceiptPDF);
router.get('/store/:integrationId', viewPublicStore);
router.get('/store/:integrationId/qr', scanStoreQR);
router.get('/qr/scan/:qrId', scanQRCode);
router.post('/store/:integrationId/order', express.json(), placePublicOrder);

module.exports = router;

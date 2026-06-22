const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const { newQRCodeCategory, getAllQRCodeCategories, createNewQRCodeController, getAllQRCodes, getQRCodeByIdController, deleteQRCodeByIdController, updateQRCodeController } = require('../Controllers/QRCodes.controller');

//PATH: /api/v1/qrcode
router.post('/newCategory', verifyIntegrationToken, [
    body('title').notEmpty(),
], newQRCodeCategory);

router.get('/allCategories', verifyIntegrationToken, getAllQRCodeCategories);

router.post('/newQRCode', verifyIntegrationToken, [
    body('title').notEmpty(),
    body('categoryId').notEmpty(),
    body('welcomeMessage').notEmpty(),
], createNewQRCodeController);

router.post('/updateQRCode/:id', verifyIntegrationToken, [
    body('title').notEmpty(),
    body('categoryId').notEmpty(),
    body('welcomeMessage').notEmpty(),
], updateQRCodeController);

router.get('/all', verifyIntegrationToken, getAllQRCodes);

router.get('/byId/:id', verifyIntegrationToken, getQRCodeByIdController);

router.delete('/remove/byId/:id', verifyIntegrationToken, deleteQRCodeByIdController)

module.exports = router;
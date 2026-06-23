const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getUserDevice, upsertUserDevice, addDeviceToken, clearDeviceToken } = require('../Controllers/UserDevice.controller');
const { verifyToken } = require('../MiddleWare/VerifyToken.Middleware');

router.get('/get', verifyToken, getUserDevice);
router.post('/upsert', verifyToken, [
  body('userId').isEmpty(),
], upsertUserDevice);
router.post('/addToken', verifyToken, [
  body('fcmToken').notEmpty(),
], addDeviceToken)


router.patch ('/clear/fcm-token',verifyToken, clearDeviceToken); 


module.exports = router;
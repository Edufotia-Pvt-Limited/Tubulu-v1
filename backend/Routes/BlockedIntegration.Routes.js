const express = require('express');
const {body} = require('express-validator');
const {
    createBlockedIntegration,
    getBlockedIntegration,
    removeBlockedIntegration,
    getBlockedIntegrationsForUser
} = require('../Controllers/BlockedIntegration.controller');
const {verifyToken} = require('../MiddleWare/VerifyToken.Middleware');
const router = express.Router();

//API URL: /api/v1/blockedIntegrations
router.post('/new', verifyToken, [body('integrationId').notEmpty()], createBlockedIntegration);

router.get('/all/:integrationId', verifyToken, getBlockedIntegration);

router.get('/byUser', verifyToken, getBlockedIntegrationsForUser);

router.delete('/remove/:integrationId', verifyToken, removeBlockedIntegration);

module.exports = router;
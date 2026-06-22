const express = require('express');
const router = express.Router();
const WhatsAppController = require('../Controllers/WhatsApp.controller');

// Twilio Webhook (POST)
router.post('/incoming', WhatsAppController.handleIncoming);

// Simulation endpoint for internal testing
router.post('/simulate', WhatsAppController.simulateChat);

module.exports = router;

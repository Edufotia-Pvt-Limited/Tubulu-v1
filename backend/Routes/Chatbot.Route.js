const express = require('express');
const router = express.Router();
const { processAiChat } = require('../Controllers/Chatbot.controller');
const { verifyToken } = require('../MiddleWare/VerifyToken.Middleware');
const { body } = require('express-validator');

/**
 * @api {post} /api/v1/chatbot/chat Send message to AI Assistant
 */
router.post('/chat', verifyToken, [
    body('message').notEmpty().withMessage('Message cannot be empty')
], processAiChat);

module.exports = router;

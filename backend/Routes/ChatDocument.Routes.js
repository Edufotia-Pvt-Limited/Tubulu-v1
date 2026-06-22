const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ChatDocumentController = require('../Controllers/ChatDocument.controller');
const { verifyToken } = require('../MiddleWare/VerifyToken.Middleware');

router.post('/create', verifyToken, [
  body('fileName').notEmpty(),
  body('file').notEmpty(),
  body('mimeType').notEmpty()
], ChatDocumentController.createDocument);

router.get('/:id', verifyToken, ChatDocumentController.getDocumentById);

module.exports = router;



const express = require('express');
const router = express.Router();
const ChatMessageController = require('../Controllers/ChatMessage.controller');
const { body } = require('express-validator');
const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const { audioUpload } = require('../MiddleWare/uploadMiddleware');


// router.post('/new', [
//     body("chatRoom").notEmpty()
// ], verifyToken, ChatMessageController.createChatMessage);


// router.post('/newByIntegration', [
//     body("chatRoom").notEmpty()
// ], ChatMessageController.createChatMessageByIntegration);

// router.post('/integrationSendByUserNumber', [
//     body('type').notEmpty(),
//     body('authKey').notEmpty(),
//     body('userPhoneNumber').notEmpty(),
// ], ChatMessageController.sendChatMessageForIntegration);

// router.post('/integrationSend', [
//     body('chatRoom').notEmpty(),
//     body('type').notEmpty(),
//     body('authKey').notEmpty(),
// ], ChatMessageController.sendChatMessageForIntegration);


router.post('/formSubmission', verifyToken, [
    body('formData').notEmpty(),
    body('messageId').notEmpty(),
    body('chatRoomId').notEmpty(),
    body('integrationId').notEmpty(),
], ChatMessageController.formConfirmation);


router.post('/integrationSendByQRScan', [
    body('qrCodeId').notEmpty(),
], verifyToken, ChatMessageController.sendChatMessageForQrScan);




// APP 


router.get('/sync-all', verifyToken, ChatMessageController.syncUserMessages);

router.post('/chatRoomMessages', verifyToken, [
    body("chatRoomId").notEmpty()
], ChatMessageController.getAllMessagesByChatRoom);



router.get(
    '/message/byId/:messageId',
    verifyToken,
    ChatMessageController.getChatMessageById);


router.post('/send', verifyToken, [
    body('chatRoom').notEmpty(),
    body('type').notEmpty(),
    body('message').notEmpty(),
], ChatMessageController.sendChatMessage);

router.post('/upload-audio', verifyToken, audioUpload, ChatMessageController.uploadAudioFile);



router.post('/markActionSelected', verifyToken, [
    body('messageId').notEmpty(),
    body('title').notEmpty(),
], ChatMessageController.markActionSelected);


// DASHBOARD 


router.put('/integrationSendDashboard', [
    body('id').notEmpty(),
    body('body').notEmpty(),
    body('contentType').notEmpty(),
], verifyIntegrationToken, ChatMessageController.sendChatMessageForIntegrationDashboard)





module.exports = router;










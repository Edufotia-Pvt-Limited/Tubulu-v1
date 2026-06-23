// const express = require('express');
// const router = express.Router();
// const ChatRoomController = require('../Controllers/ChatRoom.controller');
// const { body } = require("express-validator");
// const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
// const ErrorBody = require('../Utils/ErrorBody');

// router.get("/allChatRoomsByUserId", verifyToken, ChatRoomController.getChatRoomsByUserId);

// router.post("/upsert", [
//     body("integrationId").notEmpty()
// ], verifyToken, ChatRoomController.upsert);

// router.post("/allByIntegrationId", [
//     body("integrationId").notEmpty()
// ], ChatRoomController.getAllByIntegrationId);

// router.post("/checkChatRoomExists",
//     verifyToken,
//     [
//         body("integrationId").notEmpty(),
//     ],
//     ChatRoomController.checkChatRoomExists
// );

// router.get(
//     "/user/phone/:phoneNumber/integration/:integrationId",
//     (req, res, next) => {
//         const _authToken = req.headers.authorization;
//         if (_authToken === '4VW38XmpI31^S^A&') {
//             next();
//         } else {
//             next(new ErrorBody(401, 'Unauthorize to make this request'));
//         }
//     },
//     ChatRoomController.getChatRoomByUserPhoneNumberAndIntegration
// );

// router.get('/dashboard/all/chatRooms', verifyIntegrationToken, ChatRoomController.getAllChatRoomsForTheDashboard);

// router.get('/dashboard/all/contacts', verifyIntegrationToken, ChatRoomController.getAllDashboardContacts);

// router.get('/dashboard/all/chatMessages/:id', verifyIntegrationToken, ChatRoomController.getDashboardConversations);

// module.exports = router;





const express = require('express');
const router = express.Router();
const ChatRoomController = require('../Controllers/ChatRoom.controller');
const { body } = require("express-validator");
const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const ErrorBody = require('../Utils/ErrorBody');




router.get("/allChatRoomsByUserId", verifyToken, ChatRoomController.getChatRoomsByUserId);

router.post("/upsert", [
    body("integrationId").notEmpty()
], verifyToken, ChatRoomController.upsert);

router.post("/allByIntegrationId", [
    body("integrationId").notEmpty()
], ChatRoomController.getAllByIntegrationId);

router.post("/checkChatRoomExists",
    verifyToken,
    [
        body("integrationId").notEmpty(),
    ],
    ChatRoomController.checkChatRoomExists
);

router.post("/createFresh",
    verifyToken,
    [
        body("integrationId").notEmpty(),
    ],
    ChatRoomController.createFreshChatRoom
);

router.get(
    "/user/phone/:phoneNumber/integration/:integrationId",
    (req, res, next) => {
        const _authToken = req.headers.authorization;
        if (_authToken === '4VW38XmpI31^S^A&') {
            next();
        } else {
            next(new ErrorBody(401, 'Unauthorize to make this request'));
        }
    },
    ChatRoomController.getChatRoomByUserPhoneNumberAndIntegration
);



// Dashbaord 


router.get('/dashboard/all/chatRooms', verifyIntegrationToken, ChatRoomController.getAllChatRoomsForTheDashboard); 

router.get('/dashboard/all/chatMessages/:id', verifyIntegrationToken, ChatRoomController.getDashboardConversations);

router.get('/dashboard/all/contacts', verifyIntegrationToken, ChatRoomController.getAllDashboardContacts);

router.put('/dashboard/chatRoom/:id/toggle-ai', verifyIntegrationToken, ChatRoomController.toggleChatRoomAi);



module.exports = router;



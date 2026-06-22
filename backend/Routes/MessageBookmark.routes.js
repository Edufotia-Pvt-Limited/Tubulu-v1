const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const {verifyToken} = require('../MiddleWare/VerifyToken.Middleware');
const {
    getAllBookmarks,
    newBookmark,
    removeBookmarkById,
    getBookMarkWithDetailsForChatRoom,
    syncAllBookmarksForUser
} = require('../Controllers/MessageBookmark.controller');

//Path: /api/v1/bookmarks
router.post(
    '/new', verifyToken, [
        body('chatMessageId').notEmpty(),
        body('chatRoomId').notEmpty(),
    ],
    newBookmark
)
router.get('/all/chatRoomId/:chatRoomId', verifyToken, getAllBookmarks);
router.get('/all/details/chatRoomId/:chatRoomId', verifyToken, getBookMarkWithDetailsForChatRoom)
router.delete('/remove/:bookmarkId', verifyToken, removeBookmarkById);

router.get('/sync-all', verifyToken, syncAllBookmarksForUser);

module.exports = router;

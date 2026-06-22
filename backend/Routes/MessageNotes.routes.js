const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const {verifyToken} = require('../MiddleWare/VerifyToken.Middleware');
const {
    getNoteByChatRoom,
    newNote,
    deleteMessageNote,
    editMessageNote,
    getNotesChatRoomMessageDetails, syncAllNotesForUser
} = require('../Controllers/MessageNotes.controller');

//Path: /api/v1/notes
router.post('/new', verifyToken, [
    body('chatMessageId').notEmpty(),
    body('chatRoomId').notEmpty(),
    body('noteMessage').notEmpty(),
], newNote)
router.get('/all/chatRoomId/:chatRoomId', verifyToken, getNoteByChatRoom);
router.get('/all/details/chatRoomId/:chatRoomId', verifyToken, getNotesChatRoomMessageDetails);
router.put('/update/:noteId', verifyToken, editMessageNote);
router.delete('/remove/:noteId', verifyToken, deleteMessageNote);

router.get('/sync-all', verifyToken, syncAllNotesForUser)

module.exports = router;

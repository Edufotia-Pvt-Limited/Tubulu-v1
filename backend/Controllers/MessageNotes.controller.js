const {validationResult} = require("express-validator");
const ErrorBody = require("../Utils/ErrorBody");
const {
    createNote,
    getNotesByChatRoom,
    deleteNoteByNoteId,
    editNoteById,
    getNotesChatRoomWithDetails, getAllNotesForUser
} = require('../Services/MessageNotes.Service');
const {generateUUID} = require("../Utils/Helper");

async function newNote(req, res, next) {
    const {errors} = validationResult(req);
    if (errors.length) {
        next(new ErrorBody(400, 'Invalid request', errors));
        return;
    }
    try {
        const {id, body: {chatMessageId, chatRoomId, noteMessage}} = req;
        const createdNoteDetails = await createNote({
            userId: id, uuid: generateUUID(), chatMessageId, chatRoomId, noteMessage
        })
        res.send({
            success: true,
            data: createdNoteDetails,
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server Error occurred', []));
    }
}

async function editMessageNote(req, res, next) {
    const {errors} = validationResult(req);
    if (errors.length) {
        next(new ErrorBody(400, 'Invalid request', errors));
        return;
    }
    try {
        const {id, body: {chatMessageId, chatRoomId, noteMessage}, params: {noteId}} = req;
        await editNoteById({userId: id, chatMessageId, chatRoomId, noteMessage}, noteId);
        res.send({
            success: true,
            data: true
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server Error occurred', []));
    }
}

async function getNoteByChatRoom(req, res, next) {
    try {
        const {id, params: {chatRoomId}} = req;
        const noteDetails = await getNotesByChatRoom(id, chatRoomId);
        res.send({
            success: true,
            data: noteDetails
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server Error occurred', []));
    }
}

async function deleteMessageNote(req, res, next) {
    try {
        const {id, params: {noteId}} = req;
        await deleteNoteByNoteId(id, noteId);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server Error occurred', []));
    }
}

async function getNotesChatRoomMessageDetails(req, res, next) {
    try {
        const {id, params: {chatRoomId}} = req;
        const response = await getNotesChatRoomWithDetails(id, chatRoomId);
        res.send({
            success: true,
            data: response,
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function syncAllNotesForUser(req, res, next) {
    try{
        const {id} = req;
        const data = await getAllNotesForUser(id);
        res.send({
            success: true,
            data
        })
    }catch (error){
        console.log('Unable to get the notes for the user');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

module.exports = {
    newNote,
    getNoteByChatRoom,
    editMessageNote,
    deleteMessageNote,
    getNotesChatRoomMessageDetails,
    syncAllNotesForUser
}

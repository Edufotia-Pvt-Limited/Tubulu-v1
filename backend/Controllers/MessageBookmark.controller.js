const {validationResult} = require("express-validator");
const ErrorBody = require("../Utils/ErrorBody");
const {
    createBookmark,
    deleteBookmarkById,
    getBookmarksByChatRoom,
    getBookmarkByChatRoomWithDetails, getAllBookmarksForUser
} = require('../Services/MessageBookmark.service');
const {generateUUID} = require("../Utils/Helper");

async function newBookmark(req, res, next) {
    const {errors} = validationResult(req);
    if (errors.length) {
        next(new ErrorBody(400, 'Invalid request', errors));
        return;
    }
    try {
        const {id, body: {chatMessageId, chatRoomId}} = req;
        const createdBookMarkDetails = await createBookmark({
            chatMessageId, chatRoomId, userId: id, uuid: generateUUID()
        })
        res.send({
            success: true,
            data: createdBookMarkDetails
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}

async function getAllBookmarks(req, res, next) {
    try {
        const {id, params: {chatRoomId}} = req;
        const bookmarkDetails = await getBookmarksByChatRoom(id, chatRoomId);
        res.send({
            success: true,
            data: bookmarkDetails
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}

async function removeBookmarkById(req, res, next) {
    try {
        const {id, params: {bookmarkId}} = req;
        await deleteBookmarkById(bookmarkId, id);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}

async function syncAllBookmarksForUser(req, res, next) {
    try {
        const {id} = req;
        const data = await getAllBookmarksForUser(id);
        res.send({
            success: true,
            data,
        })
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

async function getBookMarkWithDetailsForChatRoom(req, res, next) {
    try {
        const {id, params: {chatRoomId}} = req;
        const response = await getBookmarkByChatRoomWithDetails(id, chatRoomId);
        res.send({
            success: true,
            data: response
        })
    } catch (error) {
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}

module.exports = {
    removeBookmarkById, newBookmark, getAllBookmarks, getBookMarkWithDetailsForChatRoom, syncAllBookmarksForUser
}

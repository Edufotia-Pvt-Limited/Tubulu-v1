const { MessageBookmark } = require('../Utils/Postgres');
const { Op } = require('sequelize');

function createBookmark(reqBody) {
    return MessageBookmark.create(reqBody);
}

function getBookmarksByChatRoom(userId, chatRoomId) {
    return MessageBookmark.findAll({ where: { userId, chatRoomId } });
}

function deleteBookmarkById(id, userId) {
    return MessageBookmark.destroy({ where: { id, userId } });
}

function getAllBookmarksForUser(userId) {
    return MessageBookmark.findAll({ where: { userId } });
}

async function getBookmarkByChatRoomWithDetails(userId, chatRoomId) {
    const { ChatMessage } = require('../Utils/Postgres');
    return MessageBookmark.findAll({
        where: { userId, chatRoomId },
        include: [
            {
                model: ChatMessage,
                as: 'chatMessage',
                required: false,
            }
        ],
    });
}

module.exports = {
    createBookmark,
    getBookmarksByChatRoom,
    deleteBookmarkById,
    getBookmarkByChatRoomWithDetails,
    getAllBookmarksForUser,
};

const { MessageNote } = require('../Utils/Postgres');
const { Op } = require('sequelize');

function createNote(reqBody) {
    return MessageNote.create(reqBody);
}

function editNoteById(reqBody, noteId) {
    return MessageNote.update(reqBody, { where: { id: noteId } });
}

function getNotesByChatRoom(userId, chatRoomId) {
    return MessageNote.findAll({ where: { userId, chatRoomId } });
}

function deleteNoteByNoteId(userId, id) {
    return MessageNote.destroy({ where: { id, userId } });
}

function getAllNotesForUser(userId) {
    return MessageNote.findAll({ where: { userId } });
}

async function getNotesChatRoomWithDetails(userId, chatRoomId) {
    const { ChatMessage } = require('../Utils/Postgres');
    return MessageNote.findAll({
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
    createNote,
    getNotesByChatRoom,
    deleteNoteByNoteId,
    getAllNotesForUser,
    editNoteById,
    getNotesChatRoomWithDetails,
};

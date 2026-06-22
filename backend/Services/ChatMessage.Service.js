const { ChatMessage, ChatRoom } = require('../Utils/Postgres');
const { Op } = require('sequelize');

function createChatMessage(data) {
    console.log("ChatMessageService.createChatMessage - Incoming Data:", data);
    
    // Ensure we have a valid chatRoomId. If it's an empty string, set it to null 
    // (though PG will still error, it's clearer in logs)
    const chatRoomId = (data.chatRoomId || data.chatRoom || '').toString().trim();
    
    // Map legacy MongoDB-style fields to the PG model fields
    const mapped = {
        // chatRoom (Mongo ref) -> chatRoomId (PG FK)
        chatRoomId: chatRoomId || null,
        // message -> content
        content: (data.content || data.message || '').toString().trim(),
        // sender: derive from messageByIntegration / messageByUser flags
        sender: data.sender
            ? data.sender
            : data.messageByIntegration
                ? 'assistant'
                : 'user',
        // pass through optional fields
        metadata: data.metadata || {
            uuid: data.uuid,
            type: data.type,
            payload: data.payload,
            messageActions: data.messageActions,
            integrationId: data.integrationId,
            orderId: data.orderId,
            mongoId: data.mongoId,
            messageByUser: data.messageByUser
        },
        isRead: data.isRead || false,
    };
    console.log("ChatMessageService.createChatMessage - Mapped Data:", mapped);
    
    if (!mapped.chatRoomId || !mapped.content || !mapped.sender) {
        const errorMsg = `Missing mandatory fields: chatRoomId=${mapped.chatRoomId}, sender=${mapped.sender}, content=${mapped.content}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    
    return ChatMessage.create(mapped);
}

async function getAllChatMessagesByChatRoom(chatRoomId, userId, params) {
    const page = parseInt(params.page || 0);
    const size = parseInt(params.size || 10);
    const search = params.search || "";

    const whereClause = {
        chatRoomId
    };

    if (search) {
        whereClause.content = {
            [Op.iLike]: `%${search}%`
        };
    }

    return ChatMessage.findAll({
        where: whereClause,
        limit: size,
        offset: page * size,
        order: [['createdAt', 'DESC']]
    });
}

function getLastMessageForRoomService(chatRoomId) {
    return ChatMessage.findOne({
        where: { chatRoomId },
        order: [['createdAt', 'DESC']]
    });
}

function getChatMessagesForDashboard(chatRoomId) {
    return ChatMessage.findAll({
        where: { chatRoomId },
        order: [['createdAt', 'ASC']]
    });
}

function bulkInsertMessages(messages) {
    return ChatMessage.bulkCreate(messages);
}

module.exports = {
    createChatMessage,
    getAllChatMessagesByChatRoom,
    getLastMessageForRoomService,
    getChatMessagesForDashboard,
    bulkInsertMessages
};

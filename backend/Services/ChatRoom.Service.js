const { ChatRoom, User, Integration, Catalogue, Product, Order, UserDevice } = require('../Utils/Postgres');
const { Op } = require('sequelize');
const { sendPushNotification } = require('../Utils/Helper');

function getChatRoomsByUserRecent(userId, params) {
    const size = parseInt(params.size || 10);
    const page = parseInt(params.page || 0);
    return ChatRoom.findAll({
        where: { userId },
        include: [
            { 
                model: Integration,
                as: 'integration',
                include: [
                    {
                        model: Catalogue,
                        as: 'catalogues',
                        where: { isDeleted: false },
                        required: false,
                        include: [
                            {
                                model: Product,
                                as: 'products',
                                where: { isDeleted: false },
                                required: false
                            }
                        ]
                    }
                ]
            }
        ],
        order: [['updatedAt', 'DESC']],
        limit: size,
        offset: page * size
    });
}

function getChatRoomsByUserSimple(userId, params) {
    const size = parseInt(params.size || 20);
    const page = parseInt(params.page || 0);
    return ChatRoom.findAll({
        where: { userId },
        include: [
            { 
                model: Integration,
                as: 'integration',
                attributes: ['id', 'integrationName', 'logo', 'category'] // LIGHTWEIGHT ONLY
            }
        ],
        order: [['updatedAt', 'DESC']],
        limit: size,
        offset: page * size
    });
}

function getChatRoomByParticipantIntegrationId(userId, integrationId) {
    return ChatRoom.findAll({
        where: { userId, integrationId }
    });
}

function getChatRoomByChatRoomId(id) {
    return ChatRoom.findByPk(id, {
        include: [
            { model: User, as: 'user' },
            { model: Integration, as: 'integration' }
        ]
    });
}

function getAllByIntegrationId(integrationId, params) {
    let page = parseInt(params.page || 0);
    let size = parseInt(params.size || 10);
    return ChatRoom.findAll({
        where: { integrationId },
        include: [{ model: User, as: 'user' }],
        limit: size,
        offset: page * size,
        order: [['updatedAt', 'DESC']]
    });
}

function createChatRoom(data) {
    return ChatRoom.create(data);
}

async function checkChatRoomExists(userId, integrationId) {
    let room = await ChatRoom.findOne({
        where: { userId, integrationId, isActive: true },
        include: [{ model: Integration, as: 'integration', attributes: ['category', 'verticalType'] }]
    });
    if (!room) {
        room = await ChatRoom.create({
            userId,
            integrationId,
            isActive: true
        });
        room = await ChatRoom.findByPk(room.id, {
            include: [{ model: Integration, as: 'integration', attributes: ['category', 'verticalType'] }]
        });
    }
    return room;
}

async function createFreshSession(userId, integrationId) {
    // 1. Check for active orders
    const activeOrder = await Order.findOne({
        where: {
            userId,
            integrationId,
            status: { [Op.in]: ['waiting', 'accepted', 'packing', 'dispatched'] }
        },
        order: [['createdAt', 'DESC']]
    });

    // 2. If there's an active order, we should probably stick to the existing chat session
    if (activeOrder) {
        const existingRoom = await ChatRoom.findOne({
            where: { userId, integrationId, isActive: true }
        });
        if (existingRoom) return existingRoom;
    }

    // 3. Otherwise (order completed or no order), deactivate all old sessions and start fresh
    await ChatRoom.update(
        { isActive: false },
        { where: { userId, integrationId, isActive: true } }
    );
    
    return ChatRoom.create({
        userId,
        integrationId,
        isActive: true
    });
}

function getAllDashboardContactsService(integrationId) {
    return ChatRoom.findAll({
        where: { integrationId },
        include: [
            { model: User, as: 'user' },
            { 
                association: 'messages',
                limit: 1,
                order: [['createdAt', 'DESC']]
            }
        ],
        order: [['updatedAt', 'DESC']]
    });
}

async function addLastMessage(chatRoomId, timestamp, messageId) {
    // Touch the chat room so it bubbles up to the top of recent conversations
    // The actual last message content is derived dynamically via relations in Postgres
    return ChatRoom.update(
        { updatedAt: new Date() },
        { where: { id: chatRoomId } }
    );
}

async function sendNotificationToParticipants(chatRoomId, chatMessage) {
    try {
        console.log(`[Notification] sendNotificationToParticipants called for room ${chatRoomId}`);
        const chatRoom = await getChatRoomByChatRoomId(chatRoomId);
        if (!chatRoom) {
            console.error(`[Notification] ChatRoom ${chatRoomId} not found`);
            return;
        }

        const isMessageByIntegration = chatMessage.messageByIntegration || chatMessage.sender === 'assistant';
        
        if (isMessageByIntegration) {
            // Message was sent by vendor/assistant, notify the customer (User)
            const userId = chatRoom.userId;
            const integrationName = chatRoom.integration?.integrationName || 'Tubulu';
            
            // Find active devices for this user
            const devices = await UserDevice.findAll({ where: { userId } });
            if (!devices || devices.length === 0) {
                console.log(`[Notification] No devices found for user ${userId}`);
                return;
            }
            
            const messageText = chatMessage.message || chatMessage.content || '';
            const notification = {
                title: integrationName,
                body: messageText
            };
            
            const dataPayload = {
                chatRoomId: chatRoomId.toString(),
                integrationId: chatRoom.integrationId ? chatRoom.integrationId.toString() : '',
                type: 'CHAT_MESSAGE'
            };
            
            for (const device of devices) {
                // fcmToken is JSONB array
                const tokens = Array.isArray(device.fcmToken) ? device.fcmToken : [device.fcmToken].filter(Boolean);
                for (const token of tokens) {
                    if (token) {
                        console.log(`[Notification] Sending FCM push notification to user ${userId} token: ${token}`);
                        await sendPushNotification(token, dataPayload, notification);
                    }
                }
            }
        } else {
            console.log(`[Notification] Message is by user/customer, no push notification path implemented for vendor dashboard`);
        }
    } catch (err) {
        console.error(`[Notification] Error in sendNotificationToParticipants:`, err);
    }
}

module.exports = {
    getChatRoomsByUserRecent,
    getChatRoomsByUserSimple,
    getChatRoomByParticipantIntegrationId,
    getChatRoomByChatRoomId,
    getAllByIntegrationId,
    createChatRoom,
    checkChatRoomExists,
    createFreshSession,
    getAllDashboardContactsService,
    getConversationsForDashboard: getAllDashboardContactsService,
    addLastMessage,
    sendNotificationToParticipants
};
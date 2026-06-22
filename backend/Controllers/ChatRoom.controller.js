const ChatRoomService = require('../Services/ChatRoom.Service');
const { validationResult } = require('express-validator');
const ErrorBody = require('../Utils/ErrorBody');
const { generateUUID, validateAuthToken, sendChatMessageAsIntegration } = require('../Utils/Helper');
const { logger } = require('../Utils/Logger');
const IntegrationService = require('../Services/Integration.Service')
const { getUserByPhoneNumber } = require('../Services/User.Service');
const moment = require('moment');
const { getChatMessagesForDashboard } = require('../Services/ChatMessage.Service');
const { Integration, ChatRoom } = require('../Utils/Postgres');



function getChatRoomsByUserId(req, res, next) {
    const userId = req.id; // set by verifyToken middleware
    
    // Optimized lightweight fetch to prevent massive payload
    ChatRoomService.getChatRoomsByUserSimple(userId, req.query || {}).then(response => {
        if (!response || response.length === 0) {
            res.json({
                success: true,
                data: [],
                message: 'No data chat room found for this user'
            });
        } else {
            res.json({
                success: true,
                data: response
            });
        }
    }).catch(error => {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Internal Server Error'));
    });
}

function createFreshChatRoom(req, res, next) {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
        next(new ErrorBody(400, 'Invalid data'));
    } else {
        const userId = req.id;
        const integrationId = req.body.integrationId;
        
        console.log(`[CREATE FRESH CHAT] userId: ${userId}, integrationId: ${integrationId}`);

        ChatRoomService.checkChatRoomExists(userId, integrationId).then(response => {
            console.log(`[CREATE FRESH CHAT] Success! ChatRoom ID: ${response.id}`);
            res.status(201).json({
                success: true,
                data: response
            });
        }).catch(error => {
            console.error(`[CREATE FRESH CHAT] ERROR:`, error.message, error.errors);
            next(new ErrorBody(error.statusCode || 500, error.message || 'Internal server error', error.errors));
        });
    }
}

function upsert(req, res, next) {
    let { errors } = validationResult(req);
    if (errors.length > 0) {
        next(new ErrorBody(400, 'Invalid data'))
    } else {
        let uuid = generateUUID()
        let reqBody = { uuid, ...(req.body) };
        ChatRoomService.upsert(reqBody).then(response => {
            res.json({
                success: true,
                data: response
            })
        }).catch(error => {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Internal server error'))
        })
    }

}

function getAllByIntegrationId(req, res, next) {
    let { errors } = validationResult(req);
    if (errors.length > 0) {
        next(new ErrorBody(400, 'Invalid data'));
    } else {
        let integrationId = req.body.integrationId;
        let params = req.query
        ChatRoomService.getAllByIntegrationId(integrationId, params).then(response => {
            if (response.length == 0) {
                res.json({
                    success: true,
                    message: 'No chat room found for given interationId'
                })
            } else {
                res.json({
                    success: true,
                    data: response
                })
            }
        }).catch(error => {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Internal server error'))
        })
    }
}

function checkChatRoomExists(req, res, next) {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
        next(new ErrorBody(400, 'Invalid data'));
    } else {
        let _userId = req.id;
        let _integrationId = req.body.integrationId;
        ChatRoomService.checkChatRoomExists(_userId, _integrationId).then(response => {
            console.log("ChatRoomController.checkChatRoomExists - Result:", response ? (response.toJSON ? response.toJSON() : response) : "NULL");
            res.status(200);
            res.json({
                success: true,
                data: response
            })
        }).catch(error => {
            logger.error('Unable to check if the chat room exists ' + error.message);
            next(new ErrorBody(error.statusCode || 500, error.message || 'Internal server error'))
        })
    }
}


async function getChatRoomByUserPhoneNumberAndIntegration(req, res, next) {
    const _integrationId = req.params.integrationId;
    const _userPhoneNumber = req.params.phoneNumber;
    try {
        const userDetails = await getUserByPhoneNumber(_userPhoneNumber);
        if (!userDetails) {
            logger.error('Invalid user to get the chatroom by phone number and integration id');
            next(new ErrorBody(400, 'Invalid phone number', []));
        } else {
            const { _id } = userDetails;
            const chatRoomDetails = await ChatRoomService.getChatRoomByParticipantIntegrationId(_id, _integrationId).exec();
            const integrationDetails = await IntegrationService.getIntegrationByIntegrationId(_integrationId);
            if (!chatRoomDetails || chatRoomDetails.length <= 0) {
                //we need to create the chat room
                logger.log("Creating the new chat room for the user and the integration");
                const createdChatRoomDetails = await ChatRoomService.upsert({
                    participants: [_id],
                    integrationId: _integrationId
                })
                _welcomeMessagePayload = JSON.parse(JSON.stringify(integrationDetails.welcomeMessagePayLoad));
                if (_welcomeMessagePayload && integrationDetails.apiAuthKey) {
                    const data = {
                        chatRoom: createdChatRoomDetails.id,
                        authKey: integrationDetails.apiAuthKey,
                        ..._welcomeMessagePayload
                    }
                    await sendChatMessageAsIntegration(data);
                }
                res.status(200);
                res.json({
                    success: true,
                    data: createdChatRoomDetails
                })
            } else {
                //the chat room already exists, we need to do nothing.
                res.status(200);
                res.json({
                    success: true,
                    data: chatRoomDetails?.[0]
                })
            }
        }
    } catch (error) {
        console.log(error);
        logger.error('Unable to get the chatroom by the phone number and integration ' + error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Internal server error', []));
    }
}




// async function getAllDashboardContacts(req, res, next) {
//     try {
//         const { phoneNumber } = req;
//         const integrationDetails = await IntegrationService.getIntegrationByPhoneNumberService(phoneNumber);
//         const data = await ChatRoomService.getConversationsForDashboard(integrationDetails._id);
//         const updatedData = data.map(dItem => {
//             return {
//                 role: "",
//                 "name": `${dItem.User[0].firstName} ${dItem.User[0].lastName}`,
//                 "avatarUrl": dItem.User[0].profilePictureUrl,
//                 "phoneNumber": `${dItem.User[0].phoneNumber}`,
//                 "lastActivity": "",
//                 "address": "",
//                 "email": dItem.User[0].email
//             }
//         });
//         res.send({
//             contacts: updatedData
//         })
//     } catch (error) {
//         logger.error('Unable to get the contacts for the integration at the moment');
//         logger.error(error.message);
//         next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
//     }
// }



//  ============================================ 

// DASHBOARD 

const getAllDashboardContacts = async (req, res, next) => {

    console.log('chatroom controller - getAllDashboardContacts called');

    try {
        const integrartionId = req.id

        const data =
            await ChatRoomService.getAllDashboardContactsService(integrartionId);

        // Group by userId (since they are sorted by updatedAt DESC, the first one encountered is the latest one)
        const seenUsers = new Set();
        const filteredData = [];
        for (const dItem of data) {
            const uId = dItem.userId;
            if (uId && !seenUsers.has(uId)) {
                seenUsers.add(uId);
                filteredData.push(dItem);
            }
        }

        const updatedData = filteredData.map(dItem => {
            const customerName = `${dItem.user?.firstName ?? ''} ${dItem.user?.lastName ?? ''}`.trim() || dItem.user?.phoneNumber || 'Unknown';
            return {
                role: "",
                name: customerName,
                avatarUrl: dItem.user?.profilePictureUrl,
                phoneNumber: `${dItem.user?.phoneNumber ?? ''}`,
                lastActivity: "",
                address: "",
                email: dItem.user?.email ?? ''
            };
        });



        res.status(200).send({
            contacts: updatedData
        });
    } catch (error) {
        logger.error('Unable to get the contacts for the integration at the moment');
        logger.error(error.message);

        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred'
            )
        );
    }
};


const getAllChatRoomsForTheDashboard = async (req, res, next) => {
    console.log('chatroom controller - getAllChatRoomsForTheDashboard called');

    try {
        const integrationId = req.id;

        const integrationDetails = await Integration.findOne({
            where: { id: integrationId },
        });

        if (!integrationDetails) {
            throw new Error('Integration not found');
        }

        const data =
            await ChatRoomService.getConversationsForDashboard(
                integrationDetails.id
            );

        // Group by userId (keep only the latest conversation room per customer)
        const seenUsers = new Set();
        const filteredData = [];
        for (const dItem of data) {
            const uId = dItem.userId;
            if (uId && !seenUsers.has(uId)) {
                seenUsers.add(uId);
                filteredData.push(dItem);
            }
        }

        // ✅ Safe date helper
        const safeISOString = (value) => {
            const d = new Date(value);
            return isNaN(d.getTime()) ? null : d.toISOString();
        };

        const updatedData = filteredData.map((dItem) => {
            const lastMessage = dItem.messages?.[0] || null;
            
            // Flatten last message to get plain props
            const lm = lastMessage ? (typeof lastMessage.toJSON === 'function' ? lastMessage.toJSON() : lastMessage) : null;

            const customerName = `${dItem.user?.firstName ?? ''} ${dItem.user?.lastName ?? ''}`.trim() || dItem.user?.phoneNumber || 'Unknown';

            return {
                id: dItem.id,
                type: 'ONE_TO_ONE',
                messages: [
                    {
                        id: dItem.id,
                        body: lm?.content ?? lm?.message ?? '',
                        contentType: 'text',
                        attachments: [],
                        createdAt:
                            safeISOString(dItem.lastMessageTime) ||
                            safeISOString(lm?.createdAt) ||
                            safeISOString(dItem.createdAt) ||
                            new Date().toISOString(),
                        senderId: lm?.sender === 'assistant'
                            ? integrationDetails.phoneNumber
                            : dItem.user?.phoneNumber ?? '',
                    },
                ],
                unreadCount: 0,
                participants: [
                    {
                        status: 'online',
                        id: integrationDetails.phoneNumber,
                        role: 'admin',
                        email: integrationDetails.email ?? '',
                        name: integrationDetails.integrationName || 'Admin',
                        lastActivity: '',
                        address: '',
                        avatarUrl: integrationDetails.logo ?? '',
                        phoneNumber: `${integrationDetails.phoneNumber}`,
                    },
                    {
                        status: dItem.user?.status ?? 'offline',
                        id: dItem.user?.phoneNumber ?? '',
                        role: 'user',
                        email: dItem.user?.email ?? '',
                        name: customerName,
                        lastActivity: '',
                        address: '',
                        avatarUrl: dItem.user?.profilePictureUrl ?? '',
                        phoneNumber: `${dItem.user?.phoneNumber ?? ''}`,
                    },
                ],
            };
        });

        return res.send({
            conversations: updatedData,
        });
    } catch (error) {
        logger.error(
            'Unable to get the conversations for the integration at the moment'
        );
        logger.error(error);

        return next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred'
            )
        );
    }
};




async function getDashboardConversations(req, res, next) {


    console.log('chatroom controller -  getDashboardConversations called')

    try {
        const { params: { id }, phoneNumber } = req;
        
        // 1. Get messages
        const data = await getChatMessagesForDashboard(id);

        // 2. Get Chat Room + User details explicitly (Postgres doesn't nest them automagically here)
        const chatRoomDetails = await ChatRoomService.getChatRoomByChatRoomId(id);
        if (!chatRoomDetails) {
             throw new Error('Chat Room not found');
        }
        const chatRoom = chatRoomDetails;
        const user = chatRoomDetails.user;

        const integrationDetails = await IntegrationService.getIntegrationByPhoneNumberService(phoneNumber);

        if (data.length || chatRoom) {
            
            const addresses = user?.addresses || []; // JSONB in Postgres
            const defaultAddress = Array.isArray(addresses) ? addresses.find(
                addr => addr.isDefault === true && addr.isDeleted === false
            ) : null;


            const singleLineAddress = defaultAddress
                ? [
                    defaultAddress.fullName,
                    defaultAddress.addressLine1,
                    defaultAddress.addressLine2,
                    defaultAddress.city,
                    defaultAddress.state,
                    defaultAddress.country,
                    defaultAddress.pincode
                ]
                    .filter(Boolean)
                    .join(', ')
                : '';

            const customerName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.phoneNumber || 'Unknown';

            const updatedData = {
                id: chatRoom.id,
                type: 'ONE_TO_ONE',
                unreadCount: 0,
                isAiActive: chatRoom.isAiActive,
                messages: data.map(dItem => {
                    const raw = typeof dItem.toJSON === 'function' ? dItem.toJSON() : dItem;
                    return {
                        "id": raw.id,
                        "body": raw.content ?? raw.message ?? '',
                        "contentType": "text",
                        "attachments": [],
                        "createdAt": raw?.createdAt ?? '',
                        "senderId": raw.sender === 'assistant' ? integrationDetails.phoneNumber : user?.phoneNumber ?? '',
                        "type": raw?.type ?? 'TEXT',
                        "payload": raw?.payload ?? undefined,
                        "messageActions": raw?.messageActions
                    }
                }),
                participants: [
                    {
                        "status": "online",
                        "id": integrationDetails.phoneNumber,
                        "role": "admin",
                        "email": integrationDetails.email ?? '',
                        "name": integrationDetails.integrationName ?? 'Admin',
                        "lastActivity": "",
                        "address": "",
                        "avatarUrl": integrationDetails.logo ?? '',
                        "phoneNumber": `${integrationDetails.phoneNumber}`
                    },
                    {
                        "status": user?.status ?? 'offline',
                        "id": user?.phoneNumber ?? '',
                        "role": "user",
                        "email": user?.email ?? '',
                        "name": customerName,
                        "lastActivity": "",
                        "address": singleLineAddress,
                        "avatarUrl": user?.profilePictureUrl ?? '',
                        "phoneNumber": `${user?.phoneNumber ?? ''}`
                    }
                ]
            }


            res.send({
                conversation: updatedData
            })
        } else {
            res.send({})
        }

    } catch (error) {
        console.log(error);
        logger.error('Unable to get the conversation for dashboard ' + error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Internal server error', []));
    }
}





async function toggleChatRoomAi(req, res, next) {
    try {
        const { id } = req.params;
        const { isAiActive } = req.body;
        
        console.log(`[CHATROOM AI TOGGLE] Room ID: ${id}, New State: ${isAiActive}`);
        
        const chatRoom = await ChatRoom.findByPk(id);
        if (!chatRoom) {
            return next(new ErrorBody(404, 'Chat room not found'));
        }
        
        await ChatRoom.update({ isAiActive }, { where: { id } });
        
        res.json({
            success: true,
            message: `AI Chatbot status updated to ${isAiActive ? 'active' : 'paused'}`,
            data: { id, isAiActive }
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || 'Internal Server Error'));
    }
}

module.exports = {
    getChatRoomsByUserId,
    upsert,
    getChatRoomByUserPhoneNumberAndIntegration,
    getAllByIntegrationId,
    checkChatRoomExists,
    createFreshChatRoom,
    getAllChatRoomsForTheDashboard,
    getAllDashboardContacts,
    getDashboardConversations,
    toggleChatRoomAi
}

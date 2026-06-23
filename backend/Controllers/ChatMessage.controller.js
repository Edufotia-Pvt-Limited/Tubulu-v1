const ChatMessageService = require('../Services/ChatMessage.Service');
const { validationResult } = require('express-validator');
const ErrorBody = require('../Utils/ErrorBody');
const { generateUUID, sendChatMessageAsIntegration, getMessageTypeFromMimeType } = require('../Utils/Helper');
const ChatRoomService = require('../Services/ChatRoom.Service');
const { logger } = require('../Utils/Logger');
const { getIntegrationByIntegrationId, getIntegrationByAuthKey, getIntegrationByPhoneNumberService } = require('../Services/Integration.Service');
const axios = require('axios');
const { sendNotificationToParticipants } = require('../Services/ChatRoom.Service');
const { getUserByPhoneNumber, createUser } = require('../Services/User.Service');
const { getBlockedIntegrationByUserAndIntegrationId } = require("../Services/BlockedIntegration.service");
const { getChatMessageByUserIdAndId, updateChatMessageByUserIdAndId } = require("../Services/ChatMessage.Service");
const { recordMerchantCustomer } = require('../Services/PhoneBook.pg.Service');
const { uploadBase64ToAws } = require('../Utils/FileHelper');
const moment = require('moment');
const { getQRCodeByIDOnlyService } = require('../Services/QRCode.Service');
const mime = require('mime-types');
const { getExistingPhoneGroupRelation, createNewPhoneBookGroupRelation } = require('../Services/PhoneBookGroup.service');
const { User, ChatMessage, Order, ChatRoom } = require('../Utils/Postgres');
const { getTemplateById } = require('../Services/Campaigns.Service');
const { Op } = require('sequelize');
const { generateVendorAIResponse } = require('../Utils/AIHelper');
const { uploadFileToAws } = require('../Utils/awsUpload');
const STTHelper = require('../Utils/STTHelper');




async function formConfirmation(req, res, next) {
    const { errors } = validationResult(req);
    if (errors.length) {
        next(new ErrorBody(400, 'Invalid request body', errors));
        return;
    }
    try {
        const { body: { formData, messageId, chatRoomId, integrationId } } = req;
        const integrationDetails = await getIntegrationByIntegrationId(integrationId);
        let formMessage = '';
        if (Object.keys(formData).length) {
            Object.keys(formData).forEach(keyItem => {
                formMessage += `${keyItem}: ${formData[keyItem]}\n`;
            })
        }
        console.log(`Form confirmed, sending the message`);
        await sendChatMessageAsIntegration({
            chatRoom: chatRoomId,
            authKey: integrationDetails.apiAuthKey,
            type: 'TEXT',
            message: formMessage,
            messageActions: [{
                title: 'Cancel',
                actionApi: '',
                type: 'QUICK_REPLY',
                metaData: formData,
                repliedMessageUUID: messageId,
            }, {
                title: 'Confirm',
                actionApi: '',
                type: 'QUICK_REPLY',
                metaData: formData,
                repliedMessageUUID: messageId,
            }]
        })
    } catch (error) {
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Internal Server error'))
    }
}


async function sendChatMessageForQrScan(req, res, next) {
    try {
        const { errors } = validationResult(req);
        console.log("🚀 ~ file: ChatMessage.controller.js:415 ~ sendChatMessageForQrScan ~ errors:", errors)
        if (errors.length) {
            next(new ErrorBody(400, 'Invalid request body', errors));
            return;
        };
        const { id: userId, body: { qrCodeId } } = req;
        const qrCodeDetails = await getQRCodeByIDOnlyService(qrCodeId);
        console.log("🚀 ~ file: ChatMessage.controller.js:422 ~ sendChatMessageForQrScan ~ qrCodeDetails:", qrCodeDetails)
        if (!qrCodeDetails) {
            throw new ErrorBody(400, 'Invalid QR code details');
        }
        const integrationId = qrCodeDetails.integrationId;
        console.log("🚀 ~ file: ChatMessage.controller.js:426 ~ sendChatMessageForQrScan ~ integrationId:", integrationId)
        const integrationDetails = await getIntegrationByIntegrationId(integrationId);
        if (!integrationDetails) {
            throw new ErrorBody(400, 'Invalid Integration');
        }
        const message = qrCodeDetails.welcomeMessage;
        const welcomeMessageFile = qrCodeDetails.welcomeMessageDocument;
        const phoneBookGroups = qrCodeDetails.phoneBookGroups;
        let payload = undefined;
        let messageType = 'TEXT';
        if (welcomeMessageFile) {
            const mimeType = mime.lookup(welcomeMessageFile);
            payload = {
                mimeType,
                documentName: welcomeMessageFile,
                documentOriginalName: welcomeMessageFile,
                documentUrl: welcomeMessageFile,
            }
            messageType = getMessageTypeFromMimeType(mimeType);
        }
        console.log("🚀 ~ file: ChatMessage.controller.js:430 ~ sendChatMessageForQrScan ~ message:", message)
        const _uuid = generateUUID();
        console.log("🚀 ~ file: ChatMessage.controller.js:431 ~ sendChatMessageForQrScan ~ _uuid:", _uuid)
        let chatRoomDetails = await ChatRoomService.getChatRoomByParticipantIntegrationId(userId, integrationId);
        console.log("🚀 ~ file: ChatMessage.controller.js:432 ~ sendChatMessageForQrScan ~ chatRoomDetails:", chatRoomDetails)
        if (!chatRoomDetails || chatRoomDetails.length <= 0) {
            logger.log(`Creating the new chat room as the old one does not exists`);
            chatRoomDetails = await ChatRoomService.upsert({
                participants: [userId],
                integrationId: integrationId,
            })
        } else {
            chatRoomDetails = chatRoomDetails[0];
        }
        const isIntegrationBlocked = await getBlockedIntegrationByUserAndIntegrationId(integrationId, userId);
        if (isIntegrationBlocked) {
            throw new ErrorBody(400, 'Integration blocked by the user', []);
        }
        await ChatMessageService.createChatMessage({
            uuid: _uuid,
            chatRoom: chatRoomDetails.id,
            type: messageType ?? 'TEXT',
            message,
            integrationId,
            messageByIntegration: true,
            payload,
        });
        let existingPhoneBook = await getPhoneBookByIntegrationAndUser(integrationId, userId);
        if (!existingPhoneBook) {
            existingPhoneBook = await addNewPhonebook({
                userId, integrationId, uuid: _uuid,
            });
        }
        console.log("🚀 ~ file: ChatMessage.controller.js:475 ~ sendChatMessageForQrScan ~ existingPhoneBook:", existingPhoneBook)
        const promises = phoneBookGroups.map(async groupItem => {
            console.log("🚀 ~ file: ChatMessage.controller.js:491 ~ promises ~ groupItem:", groupItem)
            const existingData = await getExistingPhoneGroupRelation(existingPhoneBook.id, groupItem.toString());
            console.log("🚀 ~ file: ChatMessage.controller.js:486 ~ promises ~ existingData:", existingData)
            if (!existingData) {
                const createdDataRelation = await createNewPhoneBookGroupRelation({
                    phoneBookId: existingPhoneBook.id, groupId: groupItem.toString()
                })
                console.log("🚀 ~ file: ChatMessage.controller.js:491 ~ promises ~ createdDataRelation:", createdDataRelation)
            }
        });
        await Promise.all(promises);
        res.send({
            success: true,
            data: { ...integrationDetails._doc, chatRoomId: chatRoomDetails.id }
        })
    } catch (error) {
        console.log('Unable to scan the QR code at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Internal server error'));
    }
}




// =================================================================== 

// APP  


async function syncUserMessages(req, res, next) {

    console.log('chat message controller- syncUserMessages called when user opens the app')

    const { id } = req;
    try {
        const messages = await ChatMessageService.syncAllMessagesByUserId(id);
        res.send({
            success: true,
            data: messages,
        })
    } catch (error) {
        logger.error('Unable to sync the messages at the moment');
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}




async function enrichMessagesWithOrderData(messages, userId) {

    const orderStatusTypes = [
        'ORDER_ACCEPTED',
        'ORDER_PACKING',
        'ORDER_DISPATCHED',
        'ORDER_DELIVERED',
        'ORDER_CANCELED',
        'ORDER_REFUND'
    ];

    /* -------------------------------
     * 1. Extract unique orderIds
     * ------------------------------- */
    const orderIdSet = new Set();

    messages.forEach(msg => {
        const messageObj = typeof msg.toJSON === 'function' 
            ? msg.toJSON() 
            : (typeof msg.get === 'function' ? msg.get({ plain: true }) : msg);

        if (
            orderStatusTypes.includes(messageObj.type) &&
            messageObj.orderId
        ) {
            orderIdSet.add(String(messageObj.orderId));
        }
    });

    const orderIds = Array.from(orderIdSet);

    /* -------------------------------
     * 2. Fetch orders
     * ------------------------------- */
    let orderStatusMap = {};
    let orderProductsMap = {};        // object array (for messages)
    let orderProductNamesMap = {};    // string array (for pinned items)

    if (orderIds.length > 0) {
        const orders = await Order.findAll({
            where: {
                id: { [Op.in]: orderIds },
                userId
            },
            attributes: ['id', 'status', 'orderItems'],
            raw: true
        });

        orders.forEach(order => {
            const orderIdStr = order.id.toString();

            // status
            orderStatusMap[orderIdStr] = order.status;

            const productObjects = [];
            const productNames = [];

            (order.orderItems || []).forEach(item => {
                if (!item?.name) return;


                const choiceNames = [];

                (item.customizationDetails || []).forEach(customization => {
                    (customization.choiceName || []).forEach(choice => {
                        if (choice) {
                            choiceNames.push(choice);
                        }
                    });
                });




                // for messages (object array)
                productObjects.push({
                    name: item.name,
                    logo: item.logo,
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    choiceNames
                });

                // for pinned items (string array)
                if (!productNames.includes(item.name)) {
                    productNames.push(item.name);
                }
            });

            orderProductsMap[orderIdStr] = productObjects;
            orderProductNamesMap[orderIdStr] = productNames;
        });
    }

    /* -------------------------------
     * 3. Enrich messages + pinnedItems
     * ------------------------------- */
    const pinnedItems = [];
    const pinnedSet = new Set();

    const enrichedMessages = messages.map(msg => {
        const messageObj = typeof msg.toJSON === 'function' 
            ? msg.toJSON() 
            : (typeof msg.get === 'function' ? msg.get({ plain: true }) : msg);

        let isOrderMessage = orderStatusTypes.includes(messageObj.type);
        let orderId = null;
        let currentStatus = null;
        let productNames = [];

        if (isOrderMessage && messageObj.message) {
            const match = messageObj.message.match(/<b>#([^<]+)<\/b>/);
            if (match) {
                orderId = match[1];
                currentStatus = orderStatusMap[orderId] || null;

                // messages → object array
                productNames = orderProductsMap[orderId] || [];

                //  pinned items → string array (unchanged)
                if (!pinnedSet.has(orderId)) {
                    pinnedSet.add(orderId);
                    pinnedItems.push({
                        orderId,
                        currentStatus,
                        productNames: orderProductNamesMap[orderId] || []
                    });
                }
            }
        }


        const subTotal = isOrderMessage
            ? productNames.reduce((sum, item) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                return sum + (price * quantity);
            }, 0)
            : null;



        return {
            ...messageObj,
            isOrderMessage,
            orderId,
            currentStatus,
            productNames,
            subTotal
        };
    });

    return {
        messages: enrichedMessages,
        pinnedItems
    };
}

function getAllMessagesByChatRoom(req, res, next) {
    console.log(
        'chat message controller - getAllMessagesByChatRoom called - when user opens the app chat box'
    );

    const userId = req.id;

    const { errors } = validationResult(req);
    if (errors.length > 0) {
        return next(new ErrorBody(400, 'Invalid data'));
    }

    const chatRoomId = req.body.chatRoomId;
    const params = req.query;

    ChatMessageService.getAllChatMessagesByChatRoom(chatRoomId, userId, params)
        .then(async (response) => {

            const { messages, pinnedItems } =
                await enrichMessagesWithOrderData(response, userId);


             function mapToObject(map) {
                if (!map) return {};
                return Object.fromEntries(map);
            }

            // enrich messages before sending
            const messagesToSend = messages.map(msg => {
                const messageObj = typeof msg.toJSON === 'function' 
                    ? msg.toJSON() 
                    : (typeof msg.get === 'function' ? msg.get({ plain: true }) : msg);
                return {
                    ...messageObj,
                    payload: mapToObject(messageObj.payload),

                };
            });



            res.json({
                success: true,
                data: messagesToSend.reverse(),
                pinnedItems
            });
        })
        .catch(error => {
            next(
                new ErrorBody(
                    error.statusCode || 500,
                    error.message || 'Internal Server error'
                )
            );
        });
}





// const sendChatMessage = async (req, res, next) => {
//     console.log('chat message controller - send chat message called - when user send chat message from app');

//     const { errors } = validationResult(req);
//     if (errors.length > 0) {
//         return next(new ErrorBody(400, 'Invalid request body', errors));
//     }

//     try {
//         const userId = req.id;
//         const integrationId = req.body.integrationId;
//         const phoneNumber = req.phoneNumber;

//         // Validate integration
//         const integrationDetails = await getIntegrationByIntegrationId(integrationId);
//         if (!integrationDetails || integrationDetails.isActive === false) {
//             throw new ErrorBody(
//                 400,
//                 "Cannot send message to integration as it's not active",
//                 []
//             );
//         }

//         const uuid = generateUUID();
//         const {
//             message,
//             type,
//             chatRoom: chatRoomId,
//             payload,
//             messageActions,
//         } = req.body;


// console.log('req.body', req.body)

//         // Create chat message
//         const chatMessage = await ChatMessageService.createChatMessage({
//             uuid,
//             chatRoom: chatRoomId,
//             type,
//             message,
//             integrationId,
//             messageByUser: userId,
//             payload,
//             messageActions,
//         });

//         // Update last message in chat room
//         await ChatRoomService.addLastMessage(
//             chatRoomId,
//             chatMessage.createdAt,
//             chatMessage._id
//         );

//         // Fetch user details
//         const userDetails = await getUserByPhoneNumber(phoneNumber);


//         // Phonebook: integration + user


//         const phoneBookDetails = await getPhoneBookByIntegrationAndUser(
//             integrationId,
//             userId
//         );

//         if (!phoneBookDetails) {
//             await addNewPhonebook({
//                 integrationId,
//                 userId,
//                 uuid,
//             });
//         }

//         // Hit webhook (safe-skipped internally if webhookUrl missing)
//         await hitIntegrationWebHook(
//             integrationId,
//             chatMessage,
//             phoneNumber,
//             userDetails
//         );

//         return res.status(200).json({
//             success: true,
//             data: chatMessage,
//         });
//     } catch (error) {
//         logger.error('Unable to send the chat message by the user');
//         logger.error(error.message);

//         return next(
//             new ErrorBody(
//                 error.statusCode || 500,
//                 error.message || 'Internal Server error occurred'
//             )
//         );
//     }
// };


const sendChatMessage = async (req, res, next) => {
    console.log(
        'chat message controller - send chat message called - when user send chat message from app'
    );

    const { errors } = validationResult(req);
    if (errors.length > 0) {
        return next(new ErrorBody(400, 'Invalid request body', errors));
    }

    try {
        const userId = req.id;
        let integrationId = req.body.integrationId;
        const phoneNumber = req.phoneNumber;

        const {
            message,
            type,
            chatRoom: chatRoomId,
            payload,
            messageActions,
        } = req.body;

        if (!integrationId && chatRoomId) {
            const chatRoom = await ChatRoomService.getChatRoomByChatRoomId(chatRoomId);
            if (chatRoom) {
                integrationId = chatRoom.integrationId;
            }
        }

        //  Validate integration
        const integrationDetails = await getIntegrationByIntegrationId(
            integrationId
        );

        if (!integrationDetails || integrationDetails.isActive === false) {
            throw new ErrorBody(
                400,
                "Cannot send message to integration as it's not active",
                []
            );
        }

        const uuid = generateUUID();

        console.log("ChatMessageController.sendChatMessage - Request Body:", req.body);
        console.log("ChatMessageController.sendChatMessage - Extracted chatRoomId:", chatRoomId);

        let finalMessage = message;
        let resolvedMessageActions = messageActions;
        let enrichedPayload = payload || {};

        /**
         * =====================================================
         *  AUDIO SPEECH-TO-TEXT PROCESSING
         * =====================================================
         */
        if (type === 'AUDIO' && message) {
            try {
                console.log(`[Audio Message] Processing audio transcription for url: ${message}`);
                const audioResponse = await axios.get(message, { responseType: 'arraybuffer' });
                const fileBuffer = Buffer.from(audioResponse.data);
                const mimeType = audioResponse.headers['content-type'] || 'audio/wav';

                const transcriptionText = await STTHelper.transcribeAudio(fileBuffer, mimeType, integrationId);
                finalMessage = transcriptionText || "[Unintelligible Audio]";
                enrichedPayload = {
                    ...enrichedPayload,
                    type: 'audio',
                    mediaUrl: message,
                    transcription: finalMessage
                };
            } catch (sttError) {
                console.error("❌ [Audio STT Error]:", sttError.message);
                finalMessage = "[Voice Message]";
                enrichedPayload = {
                    ...enrichedPayload,
                    type: 'audio',
                    mediaUrl: message,
                    error: sttError.message
                };
            }
        }

        /**
         * =====================================================
         *  QUICK REPLY HANDLING (Template driven)
         * =====================================================
         */
        if (
            messageActions &&
            messageActions.type === 'QUICK_REPLY' &&
            messageActions.templateId
        ) {
            // 1️ Fetch campaign template
            const template = await getTemplateById(
                messageActions.templateId
            );

            if (!template) {
                throw new ErrorBody(
                    400,
                    'Invalid templateId in quick reply action',
                    []
                );
            }

            // 2️ Find matching action inside template
            const matchedAction = (template.messageActions || []).find(
                (action) => action.title === messageActions.title
            );

            if (!matchedAction || !matchedAction.actionMessage) {
                throw new ErrorBody(
                    400,
                    'Invalid quick reply action for the template',
                    []
                );
            }

            // 3️ Override message with actionMessage
            finalMessage = matchedAction.actionMessage;

            // 4️ Mark action as selected
            resolvedMessageActions = {
                ...messageActions,
                isSelected: true,
            };
        }

        /**
         * =====================================================
         *  CREATE CHAT MESSAGE
         * =====================================================
         */
        const chatMessage =
            await ChatMessageService.createChatMessage({
                uuid,
                chatRoom: chatRoomId,
                type,
                message: finalMessage,
                integrationId,
                messageByUser: userId,
                payload: enrichedPayload,
                messageActions: resolvedMessageActions,
            });

        /**
         * =====================================================
         *  UPDATE CHAT ROOM LAST MESSAGE
         * =====================================================
         */
        await ChatRoomService.addLastMessage(
            chatRoomId,
            chatMessage.createdAt,
            chatMessage.id
        );

        /**
         * =====================================================
         *  USER & PHONEBOOK HANDLING
         * =====================================================
         */
        const userDetails = await getUserByPhoneNumber(phoneNumber);

        await recordMerchantCustomer(userId, integrationId);

        /**
         * =====================================================
         * HIT WEBHOOK (SAFE)
         * =====================================================
         */
        await hitIntegrationWebHook(
            integrationId,
            chatMessage,
            phoneNumber,
            userDetails
        );

        const chatRoom = await ChatRoomService.getChatRoomByChatRoomId(chatRoomId);
        if (chatRoom && chatRoom.isAiActive) {
            let chatHistory = [];
            try {
                // Fetch last 6 messages
                const rawMessages = await ChatMessageService.getAllChatMessagesByChatRoom(chatRoomId, userId, { page: 0, size: 6 });
                // rawMessages is ordered by DESC. Reverse for chronological order
                chatHistory = rawMessages.reverse().map(msg => ({
                    role: msg.messageByIntegration ? 'model' : 'user',
                    message: msg.message
                }));
            } catch (historyErr) {
                console.error("Failed to fetch chat history for AI:", historyErr.message);
            }

            generateVendorAIResponse(integrationId, userId, finalMessage, chatHistory).then(async (aiMessage) => {
                if (aiMessage) {
                    const aiUuid = generateUUID();
                    const aiChatMessage = await ChatMessageService.createChatMessage({
                        uuid: aiUuid,
                        chatRoom: chatRoomId,
                        type: 'TEXT',
                        message: aiMessage,
                        integrationId,
                        messageByIntegration: true, // Bot acts as integration
                    });

                    // Update last message
                    await ChatRoomService.addLastMessage(
                        chatRoomId,
                        aiChatMessage.createdAt,
                        aiChatMessage.id
                    );
                    
                    console.log(`🤖 AI Response sent for integration ${integrationId}`);
                }
            }).catch(err => console.error("AI Response error:", err));
        } else {
            console.log(`🤖 AI Response bypassed because isAiActive is false or chatRoom not found`);
        }

        return res.status(200).json({
            success: true,
            data: chatMessage,
        });
    } catch (error) {
        logger.error(
            'Unable to send the chat message by the user'
        );
        logger.error(error.message);

        return next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Internal Server error occurred'
            )
        );
    }
};




const hitIntegrationWebHook = async (
    integrationId,
    chatMessage,
    phoneNumber,
    userDetails
) => {
    try {
        console.log('hitIntegrationWebHook called');

        // Get plain objects since we are using Sequelize now, not Mongoose
        const chatData = typeof chatMessage.toJSON === 'function' ? chatMessage.toJSON() : { ...chatMessage };
        const userData = userDetails ? (typeof userDetails.toJSON === 'function' ? userDetails.toJSON() : { ...userDetails }) : {};

        // enrich chatMessage
        chatData.phoneNumber = phoneNumber;
        chatData.userDetails = {
            phoneNumber: userData.phoneNumber,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePictureUrl: userData.profilePictureUrl,
        };

        // get integration
        const integration = await getIntegrationByIntegrationId(integrationId);
        const webhookUrl = integration?.webhookUrl;

        //  guard: skip webhook if not configured
        if (!webhookUrl || typeof webhookUrl !== 'string') {
            console.log(
                `Webhook skipped: webhookUrl not configured for integrationId=${integrationId}`
            );
            return true; // skip but don't fail main flow
        }

        // hit webhook
        await axios({
            method: 'POST',
            url: webhookUrl,
            data: chatData,
        });

        return true;
    } catch (error) {
        logger.error('Webhook failed: ' + error.message);
        return false;
    }
};


// when integration  send chat message then just after that calling this api from app

const getChatMessageById = async (req, res, next) => {

    console.log(
        'chat message controller - getChatMessageById called - when integration send chats then calling this api from app'
    );

    try {

        const _userId = req.id;
        const _messageId = req.params.messageId;

        const response =
            await ChatMessageService.getChatMessageByUserIdAndIdV2(
                _messageId,
                _userId
            );


        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        logger.error(
            'Unable to get the chat message by user and id: ' + error.message
        );

        return next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Internal Server error'
            )
        );
    }
};


async function markActionSelected(req, res, next) {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
        next(new ErrorBody(400, 'Invalid request body', errors));
        return;
    }
    try {

        const { body: { title, messageId }, id } = req;
        const messageDetails = await getChatMessageByUserIdAndId(messageId, id);
        const messageActions = messageDetails.messageActions;
        const actionIndex = messageActions.findIndex(item => {
            if (item.title === title) {
                return 1;
            }
            return 0;
        });
        console.log(actionIndex);
        if (actionIndex >= 0) {
            messageActions[actionIndex].isSelected = true;
            messageDetails.messageActions = messageActions;
            await updateChatMessageByUserIdAndId(messageDetails, messageId, id);
        }
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        logger.error("Unable to mark the action as selected");
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Internal Server error occurred'));
    }
}


//  ===================================================

// DASHBOARD


// when integration sends chat message from the vendor portal dashboard

async function sendChatMessageForIntegrationDashboard(req, res, next) {

    console.log(' Chat message controller - send sendChatMessageForIntegrationDashboard called')

    const { errors } = validationResult(req);
    if (errors.length > 0 || !req.query.conversationId) {
        return next(new ErrorBody(400, "Invalid request body", errors));
    }

    try {
        const _chatRoom = req.query.conversationId;
        const _type = req.body.type ?? 'TEXT';
        const { phoneNumber } = req;
        const integrationDetails = await getIntegrationByPhoneNumberService(phoneNumber);

        if (!integrationDetails) {
            return next(new ErrorBody(401, 'Integration not found for this phone number'));
        }

        const integrationId = integrationDetails.id;
        const _message = req.body.body ?? '';
        const _uuid = generateUUID();
        const payload = req.body.payload ?? {};

        if (req.body?.payload?.file) {
            const { s3FileName } = await uploadBase64ToAws(
                req.body.payload.file,
                req.body.payload.mimeType,
                req.body.payload.documentName
            );
            payload.documentUrl = s3FileName;
            delete payload.file;
        }

        // ─── Get the chat room ───────────────────────────────────────────
        const chatRoomDetails = await ChatRoomService.getChatRoomByChatRoomId(_chatRoom);
        if (!chatRoomDetails) {
            return next(new ErrorBody(404, 'Chat room not found'));
        }

        const userId = chatRoomDetails.userId;

        // ─── Block check ─────────────────────────────────────────────────
        const isIntegrationBlocked = await getBlockedIntegrationByUserAndIntegrationId(integrationId, userId);
        if (isIntegrationBlocked) {
            return next(new ErrorBody(400, 'Integration blocked by the user', []));
        }

        // ─── Disable AI so the vendor can manually reply ─────────────────
        await ChatRoom.update({ isAiActive: false }, { where: { id: _chatRoom } });

        // ─── Save message ────────────────────────────────────────────────
        const createdChatMessage = await ChatMessageService.createChatMessage({
            uuid: _uuid,
            chatRoom: _chatRoom,
            type: _type,
            message: _message,
            integrationId,
            messageByIntegration: true,
            payload,
            quickActions: req.body?.quickActions,
            messageActions: req.body?.messageActions,
        });

        // ─── Update chat room timestamp ───────────────────────────────────
        await ChatRoomService.addLastMessage(_chatRoom, createdChatMessage.createdAt, createdChatMessage.id);

        // ─── Push notification to user ────────────────────────────────────
        const chatMessagePlain = createdChatMessage?.dataValues || createdChatMessage;
        await sendNotificationToParticipants(_chatRoom, chatMessagePlain);

        // ─── Build response ───────────────────────────────────────────────
        const allMessages = await ChatMessageService.getChatMessagesForDashboard(_chatRoom);
        const updatedChatRoom = await ChatRoomService.getChatRoomByChatRoomId(_chatRoom);
        const roomUser = updatedChatRoom?.user;

        const updatedData = {
            id: _chatRoom,
            type: 'ONE_TO_ONE',
            unreadCount: 0,
            isAiActive: updatedChatRoom?.isAiActive ?? false,
            messages: allMessages.map(dItem => {
                const raw = typeof dItem.toJSON === 'function' ? dItem.toJSON() : dItem;
                return {
                    id: raw.id,
                    body: raw.content ?? raw.message ?? '',
                    contentType: 'text',
                    attachments: [],
                    createdAt: raw.createdAt ?? '',
                    senderId: raw.sender === 'assistant'
                        ? integrationDetails.phoneNumber
                        : (roomUser?.phoneNumber ?? ''),
                    messageActions: raw?.metadata?.messageActions,
                };
            }),
            participants: [
                {
                    status: 'online',
                    id: integrationDetails.phoneNumber,
                    role: 'admin',
                    email: integrationDetails.email ?? '',
                    name: integrationDetails.integrationName ?? 'Admin',
                    lastActivity: '',
                    address: '',
                    avatarUrl: integrationDetails.logo ?? '',
                    phoneNumber: `${integrationDetails.phoneNumber}`,
                },
                {
                    status: 'online',
                    id: roomUser?.phoneNumber ?? '',
                    role: 'user',
                    email: roomUser?.email ?? '',
                    name: `${roomUser?.firstName ?? ''} ${roomUser?.lastName ?? ''}`.trim()
                        || roomUser?.phoneNumber
                        || 'Unknown',
                    lastActivity: '',
                    address: '',
                    avatarUrl: roomUser?.profilePictureUrl ?? '',
                    phoneNumber: `${roomUser?.phoneNumber ?? ''}`,
                },
            ],
        };

        console.log('✅ sendChatMessageForIntegrationDashboard - success, chatRoomId:', _chatRoom);
        return res.send({ conversation: updatedData });

    } catch (error) {
        console.error('❌ sendChatMessageForIntegrationDashboard error:', error.message, error.stack);
        return next(new ErrorBody(error.statusCode || 500, error.message || 'Internal Server error'));
    }
}







// =================================================================== 

// ORDER RECIEPT MESSAGE 


const sendOrderReceiptMessage = async ({ chatRoomId, integrationId, userId, order }) => {
    try {
        const user = await User.findByPk(userId);
        const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer';

        const uuid = generateUUID();
        const messageText = `
  Hi <b>${userName}</b>! 😄<br><br>
  Your order <b>#${order.id}</b> has been placed successfully and confirmed.<br>
`;

        await ChatMessage.create({
            uuid,
            chatRoomId,
            content: messageText,
            sender: 'assistant',
            metadata: { type: 'ORDER_ACCEPTED', orderId: order.id, integrationId },
        });

        console.log(`Order receipt message sent for order ${order.id}`);
    } catch (err) {
        console.error('Error sending order receipt message:', err.message);
    }
};





const sendOrderRefundMessage = async ({ chatRoomId, integrationId, userId, order }) => {
    try {
        const user = await User.findByPk(userId);
        const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer';
        const uuid = generateUUID();

        const messageText = `
  Hi <b>${userName}</b>! <br>
  Your order <b>#${order.id}</b> was paid successfully, but we encountered an issue while processing it. <br>
  Unfortunately, your order has been <b>canceled</b>, and a refund will be initiated shortly. <br>
  We apologize for the inconvenience caused. <hr>
`;

        await ChatMessage.create({
            uuid,
            chatRoomId,
            content: messageText,
            sender: 'assistant',
            metadata: { type: 'ORDER_REFUND', orderId: order.id, integrationId },
        });

        console.log(`Refund message sent for order ${order.id}`);
    } catch (err) {
        console.error('Error sending refund message:', err.message);
    }
};



const sendUpdateOrderStatusMessage = async ({ chatRoomId, integrationId, userId, order }) => {
    try {
        const user = await User.findByPk(userId);
        const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer';

        const statusTypeMap = {
            accepted:   'ORDER_ACCEPTED',
            packing:    'ORDER_PACKING',
            dispatched: 'ORDER_DISPATCHED',
            delivered:  'ORDER_DELIVERED',
            canceled:   'ORDER_CANCELED',
        };
        const messageType = statusTypeMap[order.status] || 'ORDER_ACCEPTED';

        // Format order items and total price to replace raw order ID
        let itemsSummary = '';
        if (order.orderItems && Array.isArray(order.orderItems)) {
            itemsSummary = order.orderItems.map(item => {
                return `• ${item.name} (x${item.quantity || 1}) - ₹${item.total || item.price}`;
            }).join('<br>');
        }
        const totalBill = order.totalBill ? `₹${order.totalBill}` : '';

        const statusMessageMap = {
            accepted:   `Hi <b>${userName}</b>! 😄<br><br>Your order is confirmed.<br><br><b>Items:</b><br>${itemsSummary}<br><b>Total:</b> ${totalBill}<br>`,
            packing:    `Hi <b>${userName}</b>! 😄<br><br>Your order is now being packed.<br><br><b>Items:</b><br>${itemsSummary}<br><b>Total:</b> ${totalBill}<br><hr>`,
            dispatched: `Hi <b>${userName}</b>! 😄<br><br>Good news! Your order is out for delivery 🚴‍♂️<br><br><b>Items:</b><br>${itemsSummary}<br><b>Total:</b> ${totalBill}<br><hr>`,
            delivered:  `Hi <b>${userName}</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>${itemsSummary}<br><b>Total Paid:</b> ${totalBill}<br>`,
            canceled:   `Hi <b>${userName}</b>! 😔<br><br>Your order has been canceled.<br><br><b>Items Summary:</b><br>${itemsSummary}<br><b>Total Amount:</b> ${totalBill}<br><hr>`,
        };

        const messageText = statusMessageMap[order.status] || `Hi ${userName}!\nYour order status is now ${order.status}.`;

        // Check if order message already exists
        const existingMessage = await ChatMessage.findOne({
            where: { chatRoomId, metadata: { orderId: order.id, integrationId } }
        });

        if (existingMessage) {
            await existingMessage.update({
                content: messageText,
                metadata: { ...existingMessage.metadata, type: messageType },
            });
            console.log(`Order message updated for order ${order.id}`);
            return;
        }

        await ChatMessage.create({
            uuid: generateUUID(),
            chatRoomId,
            content: messageText,
            sender: 'assistant',
            metadata: { type: messageType, orderId: order.id, integrationId },
        });

        console.log(`Order status update message sent for order ${order.id}`);
    } catch (err) {
        console.error('Error sending order status update message:', err.message);
    }
};


const uploadAudioFile = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ErrorBody(400, "No audio file provided");
        }

        const rawIntegrationId = req.body.integrationId || req.query.integrationId;
        const integrationId = (rawIntegrationId && rawIntegrationId !== 'global') ? rawIntegrationId : 'global';
        
        let integrationDetails;
        if (integrationId === 'global') {
            integrationDetails = { id: 'global', integrationName: 'global' };
        } else {
            integrationDetails = await getIntegrationByIntegrationId(integrationId);
            if (!integrationDetails) {
                throw new ErrorBody(404, "Integration not found");
            }
        }

        console.log(`[Audio Upload] Uploading audio for store: ${integrationDetails.integrationName}`);

        const uploadResult = await uploadFileToAws(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname || "audio_msg.wav",
            integrationId,
            integrationDetails.integrationName,
            "chat_audio"
        );

        return res.status(200).json({
            success: true,
            message: "Audio uploaded successfully",
            url: uploadResult.url
        });
    } catch (error) {
        console.error("[Audio Upload Error]:", error);
        next(new ErrorBody(error.statusCode || 500, error.message || "Failed to upload audio file"));
    }
};


module.exports = {

    getAllMessagesByChatRoom,
    sendChatMessage,
    getChatMessageById,
    formConfirmation,
    markActionSelected,
    sendChatMessageForQrScan,
    syncUserMessages,
    sendChatMessageForIntegrationDashboard,
    sendOrderReceiptMessage,
    sendUpdateOrderStatusMessage,
    sendOrderRefundMessage,
    uploadAudioFile
}



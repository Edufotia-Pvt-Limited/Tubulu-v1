const moment = require('moment');
const { validationResult } = require("express-validator");
const ErrorBody = require("../Utils/ErrorBody");
const { Queue } = require('bullmq');
const { newCampaignTemplate, getAllTemplates, getTotalTemplateCount, newCampaign, getAllCampaignsService, getCampaignsTotal, getAllCampaignCompletedToday, approveTemplateById, cancelCampaignService, deleteTemplateService, updateCampaignService, getCampaignById, deleteCampaignService, editCampaignTemplateService } = require("../Services/Campaigns.Service");
const { QUEUES } = require("../Utils/queue.helper");
const { getAllChatRoomsByIntegration } = require("../Services/ChatRoom.Service");
const { getAllChatMessagesForChatRooms, getAllChatMessageBetweenDatesForIntegration } = require("../Services/ChatMessage.Service");
const { uploadBase64ToAws } = require('../Utils/FileHelper');

const campaignQueue = new Queue(QUEUES.CAMPAIGN_QUEUE, {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

async function getDashboardData(req, res, next) {
    try {
        const { id: integrationId } = req;
        console.log('📊 Fetching Dashboard Data for Integration:', integrationId);
        
        if (!integrationId) {
            return res.send({ success: true, data: { totalMessages: 0, users: 0, todayCampaigns: 0, graphData: [] } });
        }
        
        const { sequelize } = require('../Utils/Postgres');
        const isSuperAdmin = req.role === 'SuperAdmin' || (req.phoneNumber && req.phoneNumber.endsWith('9844982389'));

        // 📊 Get Total Users (ChatRooms)
        let userQuery = `SELECT COUNT(*) as count FROM "ChatRooms"`;
        if (!isSuperAdmin) userQuery += ` WHERE "integrationId" = :integrationId`;
        
        const [userCountResult] = await sequelize.query(userQuery, { 
            replacements: { integrationId }, 
            type: sequelize.QueryTypes.SELECT 
        });
        const totalUsersCount = parseInt(userCountResult.count || 0);

        // 💬 Get Total Messages
        let messageQuery = `SELECT COUNT(*) as count FROM "ChatMessages" m JOIN "ChatRooms" r ON m."chatRoomId" = r.id`;
        if (!isSuperAdmin) messageQuery += ` WHERE r."integrationId" = :integrationId`;

        const [messageCountResult] = await sequelize.query(messageQuery, { 
            replacements: { integrationId }, 
            type: sequelize.QueryTypes.SELECT 
        });
        const totalMessagesCount = parseInt(messageCountResult.count || 0);

        // 📈 Graph Data (last 7 days)
        const startMoment = moment().subtract(7, 'days').startOf('day').toISOString();
        let graphQuery = `SELECT m."createdAt" FROM "ChatMessages" m JOIN "ChatRooms" r ON m."chatRoomId" = r.id WHERE m."createdAt" >= :startMoment`;
        if (!isSuperAdmin) graphQuery += ` AND r."integrationId" = :integrationId`;

        const allChatMessagesInDuration = await sequelize.query(graphQuery, { 
            replacements: { integrationId, startMoment }, 
            type: sequelize.QueryTypes.SELECT 
        });

        const chatMessageGraphData = {};
        const graphData = [];
        
        allChatMessagesInDuration.forEach((item) => {
            const messageDate = moment(item.createdAt).format('DD/MM');
            chatMessageGraphData[messageDate] = (chatMessageGraphData[messageDate] || 0) + 1;
        });

        Object.keys(chatMessageGraphData).forEach(date => {
            graphData.push({ date, value: chatMessageGraphData[date] });
        });

        let campaignsToday = 0;
        try {
            // Fetch from Mongo live instead of hardcoding 0
            campaignsToday = await getAllCampaignCompletedToday(integrationId) || 0;
        } catch (mongoErr) {
            console.warn('Mongo campaign count failed:', mongoErr.message);
        }

        res.send({
            success: true,
            data: {
                totalMessages: totalMessagesCount,
                users: totalUsersCount,
                todayCampaigns: campaignsToday,
                graphData
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        next(new ErrorBody(500, 'Unable to load dashboard statistics'));
    }
}

async function getAllCampaignsController(req, res, next) {
    try {
        const { id: integrationId, query: { page = 0, size = 1000, search = '' } } = req;
        const data = await getAllCampaignsService(page, size, search, integrationId);
        const total = await getCampaignsTotal(search, integrationId);
        res.send({
            success: true,
            data,
            total
        })
    } catch (error) {
        console.log('Unable to get all campaigns at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function deleteCampaignController(req, res, next) {
    try {
        const { id: integrationId, params: { id } } = req;
        await cancelCampaignService(id, integrationId);
        await deleteCampaignService(id, integrationId);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        console.log('Unable to delete the campaign at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function cancelCampaignController(req, res, next) {
    try {
        const { id: integrationId, params: { id } } = req;
        await cancelCampaignService(id, integrationId);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        console.log('Unable to cancel the campaign at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}


async function approveTemplateController(req, res, next) {
    try {
        const { params: { id } } = req;
        await approveTemplateById(id);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        console.log('Unable to approve the template at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}



// CAMPAIGN 



const newCampaignController = async (req, res, next) => {
    try {
        const { errors } = validationResult(req);
        console.log(
            "🚀 ~ file: Campaign.controller.js:107 ~ newCampaignController ~ errors:",
            errors
        );

        if (errors.length) {
            next(new ErrorBody(400, 'Invalid request body', errors));
            return;
        }



        // separate destructuring
        const integrationId = req.id;
        const {
            _id,
            title,
            type,
            template,
            scheduledTime,
            users = [],
            status,
            variables,
            phoneBookIds = [],
        } = req.body;

        let data;


        const parseScheduledTime = (value) => {
            if (!value) return null;

            const date = new Date(value);
            if (isNaN(date.getTime())) return null;

            // JS Date automatically converts offset (+05:30) to UTC
            return date.toISOString();
        };

        const parsedScheduledTime = parseScheduledTime(scheduledTime);


        if (type === 'SCHEDULED' && !parsedScheduledTime) {
            return next(
                new ErrorBody(
                    400,
                    'Invalid scheduledTime. Must be a valid ISO date.'
                )
            );
        }


        const payload = {
            integrationId,
            title,
            type,
            template,
            scheduledTime: parsedScheduledTime,
            users,
            status:
                status === 'DRAFT'
                    ? 'DRAFT'
                    : type === 'SCHEDULED'
                        ? 'SCHEDULED'
                        : 'ACTIVE',
            variables,
            phoneBookIds,
        };


        if (_id) {
            await updateCampaignService(_id, payload);
            data = await getCampaignById(_id);
        } else {
            data = await newCampaign(payload);
        }

        if (type === 'IMMEDIATE' && data.status !== 'DRAFT') {
            // immediately start execution
            await campaignQueue.add(QUEUES.CAMPAIGN_QUEUE, data);
        }

        res.send({
            success: true,
            data,
        });
    } catch (error) {
        console.log('Unable to get the campaigns');
        console.log(error);

        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred',
                []
            )
        );
    }
};



// TEMPLATE 



const extractVariablesFromMessage = (message = '') => {
    const regex = /\{([^}]+)\}/g;
    const matches = [...message.matchAll(regex)];

    const cleanedVariables = matches
        .map(m => m[1].trim())   // remove extra spaces
        .filter(Boolean);        // remove empty strings

    // remove duplicates
    return [...new Set(cleanedVariables)];
};



const createNewTemplateController = async (req, res, next) => {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            return next(new ErrorBody(400, 'Invalid request body', errors));
        }

        const integrationId = req.id;

        let {
            title,
            mediaType,
            mediaURL,
            messageBody,
            messageActions = [],
            file,
            mimeType,
            fileName
        } = req.body;

        // 1️ Extract variables from message body
        const extractedVariables = extractVariablesFromMessage(messageBody);

        // 2️ Validate variable names (optional but recommended)
        const invalidVariables = extractedVariables.filter(
            v => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(v)
        );

        if (invalidVariables.length) {
            return next(
                new ErrorBody(
                    400,
                    `Invalid variable names: ${invalidVariables.join(', ')}`,
                    []
                )
            );
        }

        // 3️ Convert variables into schema format
        const variables = extractedVariables.map(v => ({
            key: v
        }));

        // 4️ Upload media if Base64 file is provided
        if (file && mimeType && fileName) {
            const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName);
            mediaURL = s3FileName;
        }


        messageActions.forEach(action => {
            if (action.type === 'CALL_TO_ACTION') {
                if (!action.actionApi) {
                    throw new ErrorBody(
                        400,
                        `Action API is required for CALL_TO_ACTION`,
                        []
                    );
                }
            }

            if (action.type === 'QUICK_REPLY') {
                if (!action.actionMessage) {
                    throw new ErrorBody(
                        400,
                        `Action message is required for QUICK_REPLY`,
                        []
                    );
                }
            }
        });



        // 5️ Prepare template data
        const templateData = {
            integrationId,
            title,
            mediaType,
            mediaURL,
            messageBody,
            messageActions,
            variables, //  correct object array
            status: 'PENDING',
            payload: mediaURL
                ? {
                    documentUrl: mediaURL,
                    documentName: fileName,
                    mimeType
                }
                : undefined
        };



        const data = await newCampaignTemplate(templateData);

        res.send({
            success: true,
            data
        });
    } catch (error) {
        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred',
                []
            )
        );
    }
};



const editTemplateController = async (req, res, next) => {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            return next(new ErrorBody(400, 'Invalid form data'));
        }

        const integrationId = req.id;
        const { id } = req.params;

        let {
            title,
            mediaType,
            mediaURL,
            messageBody,
            messageActions = [],
            file,
            mimeType,
            fileName
        } = req.body;

        let s3FileCreated = false;

        // 1️ Extract variables from updated message body
        const extractedVariables = extractVariablesFromMessage(messageBody);

        // 2️Validate variable names
        const invalidVariables = extractedVariables.filter(
            v => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(v)
        );

        if (invalidVariables.length) {
            return next(
                new ErrorBody(
                    400,
                    `Invalid variable names: ${invalidVariables.join(', ')}`,
                    []
                )
            );
        }

        // 3️ Convert variables to schema format
        const variables = extractedVariables.map(v => ({ key: v }));

        // 4️ Upload media if provided
        if (file && mimeType && fileName) {
            const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName);
            mediaURL = s3FileName;
            s3FileCreated = true;
        }

        // 5️ Validate message actions
        messageActions.forEach(action => {
            if (action.type === 'CALL_TO_ACTION' && !action.actionApi) {
                throw new ErrorBody(
                    400,
                    'Action API is required for CALL_TO_ACTION',
                    []
                );
            }

            if (action.type === 'QUICK_REPLY' && !action.actionMessage) {
                throw new ErrorBody(
                    400,
                    'Action message is required for QUICK_REPLY',
                    []
                );
            }
        });

        // 6️ Prepare update payload
        const templateData = {
            integrationId,
            title,
            mediaType,
            mediaURL,
            messageBody,
            messageActions,
            variables,
            status: 'PENDING'
        };

        if (s3FileCreated) {
            templateData.payload = {
                documentUrl: mediaURL,
                documentName: fileName,
                mimeType
            };
        }

        await editCampaignTemplateService(id, templateData);

        res.send({
            success: true,
            data: true
        });
    } catch (error) {
        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred',
                []
            )
        );
    }
};


const deleteCampaignTemplateController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const integrationId = req.id;

        await deleteTemplateService(id, integrationId);

        res.send({
            success: true,
            data: true
        });
    } catch (error) {
        console.error('Unable to delete the campaign template at the moment');
        console.error(error);

        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred',
                []
            )
        );
    }
};


const getAllTemplate = async (req, res, next) => {
    try {
        const {
            query: { page = 0, size = 10, search = '' },
            id: integrationId
        } = req;

        const data = await getAllTemplates(
            Number(page),
            Number(size),
            search,
            integrationId
        );


        const total = await getTotalTemplateCount(search, integrationId);

        res.send({
            success: true,
            data,
            total
        });
    } catch (error) {
        console.error('Unable to get all the campaign templates at the moment');
        console.error(error);

        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred',
                []
            )
        );
    }
};





module.exports = {
    createNewTemplateController,
    deleteCampaignTemplateController,
    getAllTemplate,
    getAllCampaignsController,
    newCampaignController,
    getDashboardData,
    deleteCampaignController,
    approveTemplateController,
    cancelCampaignController,
    editTemplateController
}

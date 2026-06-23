const { Campaign, CampaignTemplate } = require('../Utils/Postgres');
const { Op } = require('sequelize');
const moment = require('moment');

function newCampaignTemplate(reqBody) {
    return CampaignTemplate.create(reqBody);
}

function editCampaignTemplateService(id, reqBody) {
    return CampaignTemplate.update(reqBody, { where: { id } });
}

function getAllTemplates(page, size, search, integrationId) {
    const where = { integrationId, isDeleted: false };
    if (search) where.title = { [Op.iLike]: `${search}%` };

    return CampaignTemplate.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: size,
        offset: page * size,
    });
}

function getTemplateById(id) {
    return CampaignTemplate.findOne({ where: { id } });
}

function getCampaignById(id) {
    return Campaign.findOne({ where: { id } });
}

async function getTotalTemplateCount(search, integrationId) {
    const where = { integrationId, isDeleted: false };
    if (search) where.title = { [Op.iLike]: `${search}%` };
    return CampaignTemplate.count({ where });
}

async function getAllCampaignCompletedToday(integrationId, date) {
    return Campaign.count({
        where: {
            integrationId,
            status: 'COMPLETED',
            updatedAt: { [Op.gte]: moment().startOf('day').toDate() },
        },
    });
}

function newCampaign(reqBody) {
    return Campaign.create(reqBody);
}

async function getAllCampaignsService(page = 0, size = 1000, search, integrationId) {
    const where = { integrationId };
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    // deletedAt: null equivalent
    where.deletedAt = null;

    return Campaign.findAll({
        where,
        include: [{ model: CampaignTemplate, as: 'template', required: false }],
        limit: size,
        offset: page * size,
        order: [['createdAt', 'DESC']],
    });
}

async function getCampaignsTotal(search, integrationId) {
    const where = { integrationId };
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    return Campaign.count({ where });
}

function updateCampaignStatus(id, status) {
    return Campaign.update({ status }, { where: { id } });
}

function getAllScheduledCampaigns(now) {
    const start = new Date(now);
    start.setUTCSeconds(0, 0);
    const end = new Date(start);
    end.setUTCSeconds(59, 999);

    return Campaign.findAll({
        where: {
            scheduledTime: { [Op.between]: [start, end] },
            status: 'SCHEDULED',
        },
    });
}

function approveTemplateById(id) {
    return CampaignTemplate.update({ status: 'APPROVED' }, { where: { id } });
}

function cancelCampaignService(id, integrationId) {
    return Campaign.update({ status: 'CANCELLED' }, { where: { id, integrationId } });
}

const deleteTemplateService = async (id, integrationId) => {
    return CampaignTemplate.update(
        { isDeleted: true, deletedAt: moment().toISOString() },
        { where: { id, integrationId, isDeleted: false } }
    );
};

function updateCampaignService(id, reqBody) {
    return Campaign.update(reqBody, { where: { id } });
}

function deleteCampaignService(id, integrationId) {
    return Campaign.update({ deletedAt: moment().format() }, { where: { id, integrationId } });
}

module.exports = {
    newCampaignTemplate,
    getAllTemplates,
    getTotalTemplateCount,
    newCampaign,
    getAllCampaignsService,
    getCampaignsTotal,
    getTemplateById,
    updateCampaignStatus,
    getAllCampaignCompletedToday,
    getAllScheduledCampaigns,
    updateCampaignService,
    approveTemplateById,
    cancelCampaignService,
    getCampaignById,
    deleteTemplateService,
    deleteCampaignService,
    editCampaignTemplateService,
};

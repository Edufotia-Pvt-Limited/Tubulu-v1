const { PhoneBookGroup, PhoneBookGroupRelation } = require('../Utils/Postgres');
const { Op } = require('sequelize');

function addNewPhoneGroupBook(reqBody) {
    return PhoneBookGroup.create(reqBody);
}

function getAllGroupsByIntegration(integrationId) {
    return PhoneBookGroup.findAll({ where: { integrationId } });
}

function updatePhoneBookByIntegrationId(id, reqBody) {
    return PhoneBookGroup.update(reqBody, { where: { id } });
}

function createNewPhoneBookGroupRelation(reqBody) {
    return PhoneBookGroupRelation.create({ ...reqBody });
}

function getAllPhoneBookRelationForPhoneBook(phoneBookId) {
    return PhoneBookGroupRelation.findAll({
        where: { phoneBookId },
        include: [{ model: PhoneBookGroup, as: 'group', required: false }],
    });
}

function deletePhoneBookGroupRelation(phoneBookId, groupId) {
    return PhoneBookGroupRelation.destroy({ where: { phoneBookId, groupId } });
}

function getExistingPhoneGroupRelation(phoneBookId, groupId) {
    return PhoneBookGroupRelation.findOne({ where: { phoneBookId, groupId } });
}

function deleteAllRelationsByPhoneBookId(phoneBookId) {
    return PhoneBookGroupRelation.destroy({ where: { phoneBookId } });
}

function bulkCreatePhoneBookRelations(bulkData) {
    return PhoneBookGroupRelation.bulkCreate(bulkData, { ignoreDuplicates: true });
}

const deletePhoneBookGroupAndRelationsService = async (integrationId, groupId) => {
    const deletedCount = await PhoneBookGroup.destroy({ where: { id: groupId, integrationId } });
    if (deletedCount === 0) throw new Error('PhoneBook Group not found or already deleted');
    await PhoneBookGroupRelation.destroy({ where: { groupId } });
    return true;
};

module.exports = {
    addNewPhoneGroupBook,
    getAllGroupsByIntegration,
    updatePhoneBookByIntegrationId,
    createNewPhoneBookGroupRelation,
    deletePhoneBookGroupRelation,
    getAllPhoneBookRelationForPhoneBook,
    deleteAllRelationsByPhoneBookId,
    bulkCreatePhoneBookRelations,
    getExistingPhoneGroupRelation,
    deletePhoneBookGroupAndRelationsService,
};
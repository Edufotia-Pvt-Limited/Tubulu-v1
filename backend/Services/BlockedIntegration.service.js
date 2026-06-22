const { BlockedIntegration, Integration } = require('../Utils/Postgres');

function newBlockedIntegration(integrationId, userId) {
    return BlockedIntegration.create({
        integrationId,
        userId
    });
}

function getBlockedIntegrationByUserAndIntegrationId(integrationId, userId) {
    return BlockedIntegration.findOne({
        where: {
            integrationId,
            userId
        }
    });
}

function removeBlockedIntegrationByUserIdAndIntegrationId(integrationId, userId) {
    return BlockedIntegration.destroy({
        where: {
            integrationId,
            userId
        }
    });
}

function getAllBlockedIntegrationByUser(userId) {
    console.log(`The user id:: ${userId}`);
    return BlockedIntegration.findAll({
        where: {
            userId
        },
        include: [{
            model: Integration,
            as: 'integration',
            required: false
        }]
    });
}

module.exports = {
    newBlockedIntegration,
    getBlockedIntegrationByUserAndIntegrationId,
    removeBlockedIntegrationByUserIdAndIntegrationId,
    getAllBlockedIntegrationByUser,
};
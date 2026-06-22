const {validationResult} = require("express-validator");
const {
    newBlockedIntegration,
    getBlockedIntegrationByUserAndIntegrationId,
    removeBlockedIntegrationByUserIdAndIntegrationId,
    getAllBlockedIntegrationByUser,
} = require("../Services/BlockedIntegration.service");
const ErrorBody = require("../Utils/ErrorBody");
const {logger} = require("../Utils/Logger");
const Strings = require("../Utils/Strings");

async function createBlockedIntegration(req, res, next) {
    const {errors} = validationResult(req);
    if (errors.length) {
        next(new ErrorBody(400, Strings.INVALID_FORM, errors));
        return;
    }
    try {
        const {body: {integrationId}, id} = req;
        const createdBlockedIntegration = await newBlockedIntegration(integrationId, id);
        res.send({
            success: true,
            data: createdBlockedIntegration
        })
    } catch (error) {
        logger.error(`Unable to create the new blocked integration at the moment`);
        next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, []));
    }
}

async function getBlockedIntegration(req, res, next) {
    try {
        const {id, params: {integrationId}} = req;
        const fetchedBlockedIntegration = await getBlockedIntegrationByUserAndIntegrationId(integrationId, id);
        if (!fetchedBlockedIntegration) {
            res.send({
                success: false,
                error: 'No blocked integration exists with the given data',
            })
            return;
        }
        res.send({
            success: true,
            data: fetchedBlockedIntegration,
        })
    } catch (error) {
        logger.error(`Unable to get the blocked integration at the moment`);
        next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, []));
    }
}

async function removeBlockedIntegration(req, res, next) {
    try {
        const {id, params: {integrationId}} = req;
        await removeBlockedIntegrationByUserIdAndIntegrationId(integrationId, id);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        logger.error(`Unable to remove the blocked integration at the moment`);
        next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, []));
    }
}

async function getBlockedIntegrationsForUser(req, res, next) {
    try {
        const {id} = req;
        console.log(`Integration Id:: ${id}`);
        const integrations = await getAllBlockedIntegrationByUser(id);
        res.send({
            success: true,
            data: integrations,
        })
    } catch (error) {
        console.log(error);
        logger.error(`Unable to get the blocked integration for the user.`);
        console.log(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, []));
    }
}

module.exports = {
    createBlockedIntegration,
    getBlockedIntegration,
    removeBlockedIntegration,
    getBlockedIntegrationsForUser
}

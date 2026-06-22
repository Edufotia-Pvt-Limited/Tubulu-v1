const ErrorBody = require("../Utils/ErrorBody");
const { getVendorAIConfig, updateVendorAIConfig } = require("../Services/VendorAI.Service");

async function getMyAIConfig(req, res, next) {
    try {
        const integrationId = req.id; // From auth middleware
        const config = await getVendorAIConfig(integrationId);
        res.send({ success: true, data: config });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

async function updateMyAIConfig(req, res, next) {
    try {
        const integrationId = req.id;
        const config = await updateVendorAIConfig(integrationId, req.body);
        res.send({ success: true, data: config });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

module.exports = {
    getMyAIConfig,
    updateMyAIConfig
};

const { VendorAIConfig, Integration } = require("../Utils/Postgres");
const redis = require("../Utils/Redis");

async function getVendorAIConfig(integrationId) {
    let config = await VendorAIConfig.findOne({ where: { integrationId } });
    
    if (!config) {
        // Create default config if not exists
        config = await VendorAIConfig.create({
            integrationId,
            masterPrompt: "You are a helpful assistant for this store. You only answer questions related to the items in our catalogue.",
            isActive: false
        });
    }
    
    return config;
}

async function updateVendorAIConfig(integrationId, updateData) {
    // 🧹 Clear the cached business context from Redis
    try {
        const cacheKey = `integration:context:${integrationId}`;
        await redis.del(cacheKey);
    } catch (cacheErr) {
        console.error("Failed to invalidate integration cache on config update:", cacheErr);
    }

    const [updated] = await VendorAIConfig.update(updateData, {
        where: { integrationId }
    });
    
    if (!updated) {
        // If update failed (maybe it didn't exist), create it
        return VendorAIConfig.create({
            ...updateData,
            integrationId
        });
    }
    
    return VendorAIConfig.findOne({ where: { integrationId } });
}

module.exports = {
    getVendorAIConfig,
    updateVendorAIConfig
};

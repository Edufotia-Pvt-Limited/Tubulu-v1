const { AICategoryPlaybook, Integration } = require('../Utils/Postgres');
const ErrorBody = require('../Utils/ErrorBody');
const Strings = require('../Utils/Strings');
const redis = require('../Utils/Redis');

// 📋 Get all Category Playbooks for Super Admin
async function getAllPlaybooks(req, res, next) {
    try {
        const playbooks = await AICategoryPlaybook.findAll({
            order: [['categoryKey', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: playbooks
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 💾 Save or Update Category Playbook configuration
async function upsertPlaybook(req, res, next) {
    try {
        const { categoryKey, displayName, masterPrompt, requiredAttributes, actionConfig } = req.body;

        if (!categoryKey || !displayName || !masterPrompt) {
            return next(new ErrorBody(400, "categoryKey, displayName, and masterPrompt are required"));
        }

        // Use Sequelize upsert or findOne & update/create
        let playbook = await AICategoryPlaybook.findOne({ where: { categoryKey } });

        if (playbook) {
            playbook.displayName = displayName;
            playbook.masterPrompt = masterPrompt;
            playbook.requiredAttributes = requiredAttributes || [];
            playbook.actionConfig = actionConfig || {};
            await playbook.save();
        } else {
            playbook = await AICategoryPlaybook.create({
                categoryKey,
                displayName,
                masterPrompt,
                requiredAttributes: requiredAttributes || [],
                actionConfig: actionConfig || {}
            });
        }

        // 🧹 Invalidate Redis Cache for all merchants belonging to this vertical category
        try {
            const merchants = await Integration.findAll({ where: { verticalType: categoryKey } });
            for (const merchant of merchants) {
                const cacheKey = `integration:context:${merchant.id}`;
                await redis.del(cacheKey);
            }
        } catch (cacheErr) {
            console.error("Cache invalidation error during playbook upsert:", cacheErr);
        }

        res.status(200).json({
            success: true,
            message: "Category AI Playbook saved and updated successfully",
            data: playbook
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

module.exports = {
    getAllPlaybooks,
    upsertPlaybook
};

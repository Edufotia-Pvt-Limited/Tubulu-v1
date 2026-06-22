const { StoreFeed, Product, Integration } = require('../Utils/Postgres');
const ErrorBody = require('../Utils/ErrorBody');
const { uploadBase64ToAws } = require('../Utils/FileHelper');
const { Op } = require('sequelize');

/**
 * Resolves the correct Integration record for the requesting merchant.
 * Strategy:
 *   1. Try the integrationId from the token directly (fast path).
 *   2. If it doesn't exist (stale/user-id token), fall back to phone number lookup.
 * This allows the feature to work even when the user hasn't re-logged-in after a DB reset.
 */
async function resolveIntegration(integrationIdFromToken, phoneNumber) {
    // Fast path — token already carries a valid integration UUID
    if (integrationIdFromToken) {
        const integration = await Integration.findByPk(integrationIdFromToken);
        if (integration) return integration;
    }

    // Fallback — look up by phone number (handles stale tokens and user-ID-as-merchantId)
    if (phoneNumber) {
        const barePhone = String(phoneNumber).replace(/^\+91|^91/, '');
        const integration = await Integration.findOne({
            where: {
                phoneNumber: {
                    [Op.or]: [barePhone, `+91${barePhone}`, `91${barePhone}`]
                }
            }
        });
        if (integration) return integration;
    }

    return null;
}

async function createFeed(req, res, next) {
    try {
        let { title, description, mediaUrl, actionProductId, startsAt, expiresAt } = req.body;

        if (!title || !description) {
            return next(new ErrorBody(400, 'Title and description are required'));
        }

        const integration = await resolveIntegration(req.id, req.phoneNumber);
        if (!integration) {
            return next(new ErrorBody(404, 'Merchant store not found. Please ensure your account is linked to a store.'));
        }
        const integrationId = integration.id;

        if (actionProductId) {
            const product = await Product.findOne({ where: { id: actionProductId, integrationId } });
            if (!product) {
                return next(new ErrorBody(404, 'Linked product not found or does not belong to this store'));
            }
        }

        // Validate startsAt / expiresAt
        if (startsAt) {
            startsAt = new Date(startsAt);
            if (isNaN(startsAt.getTime())) {
                return next(new ErrorBody(400, 'Invalid startsAt timestamp'));
            }
        } else {
            startsAt = null;
        }

        if (expiresAt) {
            expiresAt = new Date(expiresAt);
            if (isNaN(expiresAt.getTime())) {
                return next(new ErrorBody(400, 'Invalid expiresAt timestamp'));
            }
        } else {
            expiresAt = null;
        }

        if (startsAt && expiresAt && expiresAt <= startsAt) {
            return next(new ErrorBody(400, 'Expiration time must be after start time'));
        }

        let uploadedUrl = mediaUrl;
        if (mediaUrl && mediaUrl.startsWith('data:')) {
            const matches = mediaUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const extension = mimeType.split('/')[1] || 'jpg';
                const fileName = `feed_${Date.now()}.${extension}`;
                const uploadResult = await uploadBase64ToAws(base64Data, mimeType, fileName);
                uploadedUrl = uploadResult.s3FileName;
            }
        }

        const feed = await StoreFeed.create({
            integrationId,
            title,
            description,
            mediaUrl: uploadedUrl,
            actionProductId: actionProductId || null,
            startsAt,
            expiresAt,
        });

        return res.status(201).json({
            success: true,
            message: 'Feed post created successfully',
            data: feed,
        });
    } catch (error) {
        return next(error);
    }
}

async function getMerchantFeeds(req, res, next) {
    try {
        const integration = await resolveIntegration(req.id, req.phoneNumber);
        if (!integration) {
            return res.status(200).json({ success: true, data: [] });
        }

        const feeds = await StoreFeed.findAll({
            where: { integrationId: integration.id },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Product,
                    as: 'linkedProduct',
                    attributes: ['id', 'name', 'price', 'imageUrls'],
                }
            ],
        });

        const now = new Date();
        const feedsWithStatus = feeds.map(feed => {
            const feedJson = feed.toJSON();
            let status = 'active';
            
            if (feedJson.startsAt && new Date(feedJson.startsAt) > now) {
                status = 'scheduled';
            } else if (feedJson.expiresAt && new Date(feedJson.expiresAt) <= now) {
                status = 'expired';
            }
            
            feedJson.status = status;
            return feedJson;
        });

        return res.status(200).json({ success: true, data: feedsWithStatus });
    } catch (error) {
        return next(error);
    }
}

async function deleteFeed(req, res, next) {
    try {
        const integration = await resolveIntegration(req.id, req.phoneNumber);
        const integrationId = integration ? integration.id : req.id;
        const { id } = req.params;

        const feed = await StoreFeed.findOne({ where: { id, integrationId } });
        if (!feed) {
            return next(new ErrorBody(404, 'Feed post not found or does not belong to this store'));
        }

        await feed.destroy();

        return res.status(200).json({
            success: true,
            message: 'Feed post deleted successfully',
        });
    } catch (error) {
        return next(error);
    }
}

async function getPublicStoreFeeds(req, res, next) {
    try {
        const { storeId } = req.params;
        const now = new Date();
        const feeds = await StoreFeed.findAll({
            where: {
                integrationId: storeId,
                startsAt: {
                    [Op.or]: [
                        null,
                        { [Op.lte]: now }
                    ]
                },
                expiresAt: {
                    [Op.or]: [
                        null,
                        { [Op.gt]: now }
                    ]
                }
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Product,
                    as: 'linkedProduct',
                    attributes: ['id', 'name', 'price', 'imageUrls'],
                }
            ],
        });

        return res.status(200).json({ success: true, data: feeds });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createFeed,
    getMerchantFeeds,
    deleteFeed,
    getPublicStoreFeeds,
};

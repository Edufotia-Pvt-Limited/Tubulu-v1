const { MerchantMembership, Integration, User } = require('../Utils/Postgres');

/**
 * Middleware to verify if a logged-in Super Admin has access to the requested merchant/business portfolio.
 */
const checkPortfolio = async (req, res, next) => {
    try {
        const user = req.user;
        const targetMerchantId = req.headers['x-integration-id'] || req.body.integrationId || req.query.integrationId;

        if (!user) {
            return res.status(401).json({ status: false, message: 'Unauthorized: No session active.' });
        }

        // If the user is a vendor/merchant admin instead of a platform super admin, skip to membership checks
        if (user.role?.toLowerCase() !== 'super_admin' && user.role?.toLowerCase() !== 'admin') {
            return next();
        }

        const portfolio = user.portfolioAccess || { accessType: 'GLOBAL' };

        // 1. GLOBAL Super Admins have full access to all merchants
        if (portfolio.accessType === 'GLOBAL') {
            return next();
        }

        if (!targetMerchantId) {
            return res.status(400).json({ status: false, message: 'Bad Request: Target integration ID is missing.' });
        }

        // 2. VERTICAL Super Admins can only access merchants matching their verticalType categories
        if (portfolio.accessType === 'VERTICAL') {
            const merchant = await Integration.findByPk(targetMerchantId);
            if (!merchant || !portfolio.verticals?.includes(merchant.verticalType)) {
                return res.status(403).json({ status: false, message: 'Forbidden: This merchant is outside your assigned vertical portfolio.' });
            }
            return next();
        }

        // 3. MERCHANT-assigned Super Admins can only access specific merchant integration IDs
        if (portfolio.accessType === 'MERCHANT') {
            if (!portfolio.merchants?.includes(targetMerchantId)) {
                return res.status(403).json({ status: false, message: 'Forbidden: You do not have dedicated admin permissions for this store.' });
            }
            return next();
        }

        return res.status(403).json({ status: false, message: 'Forbidden: Invalid portfolio configuration.' });
    } catch (err) {
        console.error('Portfolio Guard Error:', err);
        return res.status(500).json({ status: false, message: 'Internal Server Error in Portfolio Guard.' });
    }
};

/**
 * Middleware to enforce multi-agent permissions at the Vendor Staff / Store level.
 * @param {string[]} allowedRoles Array of allowed roles: ['OWNER', 'MANAGER', 'CASHIER']
 */
const checkMembership = (allowedRoles = ['OWNER', 'MANAGER']) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const targetMerchantId = req.headers['x-integration-id'] || req.body.integrationId || req.query.integrationId;

            if (!user) {
                return res.status(401).json({ status: false, message: 'Unauthorized: No session active.' });
            }

            // Platform Super Admins bypass store-level membership guards
            if (user.role?.toLowerCase() === 'super_admin' || user.role?.toLowerCase() === 'admin') {
                return next();
            }

            if (!targetMerchantId) {
                return res.status(400).json({ status: false, message: 'Bad Request: Target store ID is required.' });
            }

            const membership = await MerchantMembership.findOne({
                where: { userId: user.id, integrationId: targetMerchantId }
            });

            if (!membership) {
                return res.status(403).json({ status: false, message: 'Forbidden: You do not belong to this business.' });
            }

            const parsedAllowedRoles = allowedRoles.map(r => r.toUpperCase());
            if (!parsedAllowedRoles.includes(membership.role.toUpperCase())) {
                return res.status(403).json({ status: false, message: `Forbidden: Action restricted to ${allowedRoles.join('/')} roles only.` });
            }

            // Attach membership context to request for controllers to use
            req.membership = membership;
            return next();
        } catch (err) {
            console.error('Membership Guard Error:', err);
            return res.status(500).json({ status: false, message: 'Internal Server Error in Membership Guard.' });
        }
    };
};

/**
 * Ensures an enabler can only submit/view merchants in their assigned city.
 * City is determined from their creating City Manager's scopedCityId.
 */
const checkEnablerCityLock = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role !== 'enabler') return next(); // non-enablers skip

        const targetCityId = req.body.cityId || req.query.cityId;
        if (!targetCityId) return res.status(400).json({ message: 'cityId is required' });

        // enabler's city comes from their creator City Manager
        const creator = await User.findByPk(user.createdByUserId);
        if (!creator || creator.scopedCityId !== targetCityId) {
            return res.status(403).json({ message: 'Forbidden: Outside your assigned city' });
        }
        req.enablerCityId = creator.scopedCityId;
        next();
    } catch (err) {
        console.error('City Lock Guard Error:', err);
        return res.status(500).json({ message: 'Internal Server Error in City Lock Guard.' });
    }
};

module.exports = {
    checkPortfolio,
    checkMembership,
    checkEnablerCityLock
};

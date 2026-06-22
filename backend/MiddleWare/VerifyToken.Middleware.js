const ErrorBody = require("../Utils/ErrorBody")
const {validateAuthToken, validateAuthTokenIntegration} = require("../Utils/Helper")
const Strings = require("../Utils/Strings")
const { User } = require("../Utils/Postgres");

function verifyToken(req, res, next) {
    const _authToken = req.headers.authorization
    if (_authToken) {
        validateAuthToken(_authToken)
            .then(async (response) => {
                try {
                    const user = await User.findByPk(response.id);
                    if (!user || user.isDeleted || user.isActive === false) {
                        return next(new ErrorBody(401, "User session invalid or account deactivated"));
                    }

                    const cleanToken = _authToken.startsWith("Bearer ")
                        ? _authToken.split(" ")[1]
                        : _authToken;

                    if (user.currentSessionToken && user.currentSessionToken !== cleanToken) {
                        return next(new ErrorBody(401, "Session expired. Logged in from another device."));
                    }

                    req.phoneNumber = response.phoneNumber
                    req.id = response.id
                    req.role = response.role
                    req.user = {
                        id: response.id,
                        phoneNumber: response.phoneNumber,
                        role: response.role
                    }
                    next()
                } catch (dbError) {
                    next(new ErrorBody(500, "Database verification failed"));
                }
            })
            .catch((error) => {
                next(
                    new ErrorBody(
                        401,
                        error.message || Strings.NO_AUTH_TOKEN,
                        []
                    )
                )
            })
    } else {
        next(new ErrorBody(401, Strings.NO_AUTH_TOKEN, []))
    }
}

async function verifyIntegrationToken(req, res, next) {
    const authToken = req.headers.authorization;   
    
    if (authToken) {
        try {
            let details;
            // 1. Try Integration Token
            try {
                details = await validateAuthTokenIntegration(authToken, 0);            
                req.phoneNumber = details.phoneNumber;
                req.id = details.id;
                req.role = details.role || 'merchant_admin';
                req.user = { id: details.id, phoneNumber: details.phoneNumber, role: req.role };

                const isValidUUID = (uuid) => typeof uuid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
                const targetIntegrationId = req.headers['x-integration-id'] || req.body.integrationId || req.query.integrationId;
                if (targetIntegrationId && isValidUUID(targetIntegrationId)) {
                    req.id = targetIntegrationId;
                }
            } catch (e) {
                // 2. Fallback to User Token (for mobile app merchant login)
                details = await validateAuthToken(authToken, 0);
                req.phoneNumber = details.phoneNumber;
                req.id = details.merchantId || details.id;
                req.role = details.role;
                req.user = { id: details.merchantId || details.id, phoneNumber: details.phoneNumber, role: details.role };

                const isValidUUID = (uuid) => typeof uuid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
                const targetIntegrationId = req.headers['x-integration-id'] || req.body.integrationId || req.query.integrationId;
                if (targetIntegrationId && isValidUUID(targetIntegrationId)) {
                    req.id = targetIntegrationId;
                }
            }

            // For manager and enabler roles, enrich req.user with scope fields from the User record
            const managerRoles = ['regional_manager', 'state_manager', 'city_manager', 'enabler'];
            if (req.role && managerRoles.includes(req.role.toLowerCase())) {
                try {
                    const { User } = require('../Utils/Postgres');
                    const userRecord = await User.findByPk(details.userId || details.id, {
                        attributes: ['scopedStateId', 'scopedCityId', 'scopedCountryId', 'createdByUserId']
                    });
                    if (userRecord) {
                        req.user.scopedStateId   = userRecord.scopedStateId;
                        req.user.scopedCityId    = userRecord.scopedCityId;
                        req.user.scopedCountryId = userRecord.scopedCountryId;
                        req.user.createdByUserId = userRecord.createdByUserId;
                    }
                } catch (e) {
                    // Non-fatal — scope enrichment failed, proceed without it
                    console.warn('[AUTH] Could not enrich manager scope:', e.message);
                }
            }

            // Suspension Check: Restrict suspended merchants to billing/me APIs
            const integrationId = req.id;
            if (integrationId && req.role?.toLowerCase() === 'merchant_admin') {
                const Integration = require('../Models/Integration.pg');
                const integration = await Integration.findByPk(integrationId, { attributes: ['isSuspended'] });
                if (integration && integration.isSuspended) {
                    const whitelistedPaths = [
                        '/api/v1/integrations/myDetails',
                        '/api/v1/billing',
                        '/api/v1/payment-connection'
                    ];
                    const isWhitelisted = whitelistedPaths.some(path => req.originalUrl.startsWith(path));
                    if (!isWhitelisted) {
                        return next(new ErrorBody(403, 'SUBSCRIPTION_EXPIRED: Your subscription has expired. Please recharge your wallet to reactivate.'));
                    }
                }
            }

            return next();
        } catch (error) {
            next(new ErrorBody(401, 'Invalid auth details'));
        }
    } else {
        next(new ErrorBody(401, 'Invalid auth token'));
    }
}

function verifySuperAdmin(req, res, next) {
    if (req.role === 'SuperAdmin') {
        next();
    } else {
        next(new ErrorBody(403, "Access denied. SuperAdmin privileges required."));
    }
}

// verifyIntegrationTokenStrict — same as verifyIntegrationToken but also blocks suspended merchants
async function verifyIntegrationTokenStrict(req, res, next) {
    // Re-use existing verifyIntegrationToken as base, then add suspension check
    verifyIntegrationToken(req, res, async (err) => {
        if (err) return next(err);
        try {
            const integrationId = req.id;
            if (integrationId) {
                const Integration = require('../Models/Integration.pg');
                const integration = await Integration.findByPk(integrationId, { attributes: ['isSuspended'] });
                if (integration && integration.isSuspended) {
                    return next(new ErrorBody(403, 'SUBSCRIPTION_EXPIRED: Your subscription has expired. Please recharge your wallet to reactivate.'));
                }
            }
            next();
        } catch (e) {
            next(new ErrorBody(500, 'Subscription check failed'));
        }
    });
}

module.exports = {
    verifyToken,
    verifyIntegrationToken,
    verifyIntegrationTokenStrict,
    verifySuperAdmin
}

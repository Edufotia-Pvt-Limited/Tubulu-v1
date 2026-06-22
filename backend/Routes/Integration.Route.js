const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');
const phoneBookController = require('../Controllers/Phonebook.controller');

const IntegrationController = require('../Controllers/Integration.controller');
const ErrorBody = require('../Utils/ErrorBody');
const {
    verifyIntegrationPhoneNumberController,
    confirmIntegrationOTP,
    onboardUnregisteredIntegration, adminVerifyIntegration, getAllIntegrationNoPagination
} = require("../Controllers/Integration.controller");
const { getCategoriesForIntegrationsFilter } = require('../Controllers/Category.controller');

router.get('/resolve-identity', IntegrationController.resolveIdentityController);

router.get('/discovery', IntegrationController.getAppDiscoveryIntegrations);
router.get('/all/integrations',verifyToken,  getAllIntegrationNoPagination)

router.patch('/toggle-status', verifyIntegrationToken, IntegrationController.toggleIntegrationStatus);

router.post('/create', (req, res, next) => {
    let _authToken = req.headers.authorization;
    if (_authToken === '4VW38XmpI31^S^A&') {
        next();
    } else {
        next(new ErrorBody(401, 'Unauthorized to create integration', []));
    }
}, [
    body('logo').notEmpty(),
    body('integrationName').notEmpty(),
    body('apiUrl').notEmpty(),
    body('chatBaseUrl').notEmpty()
], IntegrationController.createIntegration);

router.put('/update/:integrationId', (req, res, next) => {
    let _authToken = req.headers.authorization;
    if (_authToken === '4VW38XmpI31^S^A&') {
        next();
    } else {
        next(new ErrorBody(401, 'Unauthorized to update the integration', []));
    }
}, [
    body('logo').notEmpty(),
    body('integrationName').notEmpty(),
    body('apiUrl').notEmpty(),
    body('chatBaseUrl').notEmpty(),
    body('_id').isEmpty(),
], IntegrationController.updateIntegration)

router.get('/user/recent',verifyToken, IntegrationController.getAllIntegrationsRecentByUser)

router.get('/user/nonInteracted', verifyToken, IntegrationController.getNonInteractedIntegrationByUser);

router.get('/all', verifyToken, IntegrationController.getAllIntegrations);

router.get('/byId/:id', verifyToken, IntegrationController.getIntegrationById);


router.get('/welcome/:integrationId', verifyToken, IntegrationController.welcomeUserToIntegration)

router.post('/welcome/misscall', IntegrationController.integrateMissedCall);



router.post('/verifyIntegrationPhoneNumber', [
    body('phoneNumber').notEmpty(),
], verifyIntegrationPhoneNumberController);


router.post('/confirmIntegrationPhoneAndCode', [
    body('phoneNumber').notEmpty(),
    body('code').notEmpty(),
], confirmIntegrationOTP);


router.post('/update/unregisteredIntegration', verifyIntegrationToken, [
    body('integrationName').notEmpty(),
    body('category').notEmpty(),
    body('email').optional({ checkFalsy: true }),
    body('website').optional({ checkFalsy: true }),
    body('country').notEmpty(),
    body('city').notEmpty(),
    body('state').notEmpty(),
], onboardUnregisteredIntegration);

router.post('/updateProfilePic', verifyIntegrationToken, [
    body('mimeType').notEmpty(),
    body('file').notEmpty(),
    body('fileName').notEmpty(),
], IntegrationController.updateIntegrationProfilePicController);

router.delete('/delete/:integrationId', (req, res, next) => {
    let _authToken = req.headers.authorization;
    if (_authToken === '4VW38XmpI31^S^A&') {
        next();
    } else {
        next(new ErrorBody(401, 'Unauthorized to update the integration', []));
    }
}, IntegrationController.deactivateIntegration);

router.post('/verify/integration', (req, res, next) => {
    let _authToken = req.headers.authorization;
    if (_authToken === '4VW38XmpI31^S^A&') {
        next();
    } else {
        next(new ErrorBody(401, 'Unauthorized to update the integration', []));
    }
}, [
    body('phoneNumber').notEmpty(),
], adminVerifyIntegration);

router.get('/activate/:integrationId', (req, res, next) => {
    let _authToken = req.headers.authorization;
    if (_authToken === '4VW38XmpI31^S^A&') {
        next();
    } else {
        next(new ErrorBody(401, 'Unauthorized to update the integration', []));
    }
}, IntegrationController.activateIntegration);

router.post('/unregisteredIntegration/documents', verifyIntegrationToken, IntegrationController.updateIntegrationDocuments)

router.post('/unregisteredIntegration/createIntegration', verifyIntegrationToken, [
    body('fileName').notEmpty(),
    body('mimeType').notEmpty(),
    body('file').notEmpty(),
    body('businessName').notEmpty(),
    body('description').notEmpty(),
], IntegrationController.unregisteredCreateIntegration);


router.get('/all/categories', getCategoriesForIntegrationsFilter);




// PHONEBOOK ROUTES 



router.post('/new-phonebook', verifyIntegrationToken, [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('phoneNumber').notEmpty(),
    body('cc').notEmpty(),
], phoneBookController.addNewPhoneBookController);

router.delete('/delete-phone-book/:phoneBookId', verifyIntegrationToken, phoneBookController.deletePhoneBookByIdController);

router.post('/phone-book-phone-details', verifyIntegrationToken, [
    body('cc').notEmpty(),
    body('phoneNumber').notEmpty(),
], phoneBookController.getPhoneBookDetailsForIntegration);

router.post('/update-phonebook/:id', verifyIntegrationToken, [
    body('phoneBookGroups').isArray(),
], phoneBookController.updatePhoneBook);

router.get('/all-phonebook', verifyIntegrationToken, phoneBookController.getPhoneBookForIntegration);


// PHONEBOOK  GROUP ROUTES 

router.post('/phoneBookGroup/new', verifyIntegrationToken, [
    body('groupName').notEmpty(),
], phoneBookController.addNewPhoneBookGroupController);

router.get('/phoneBookGroup/all', verifyIntegrationToken, phoneBookController.getNewPhoneBookGroupController);

router.post('/phoneBookGroup/update/:id', verifyIntegrationToken, phoneBookController.updatePhoneBookGroupByIdController);


router.delete('/phoneBookGroup/delete/:groupId',verifyIntegrationToken, phoneBookController.deletePhoneBookGroupById);



// /**
//  * @openapi
//  * /integrations/myDetails:
//  *   get:
//  *     tags:
//  *       - Integration
//  *     summary: Get integration self details (Web)
//  *     description: Requires a valid JWT Bearer token. The integrationId is extracted from the token.
//  *     security:
//  *       - BearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Integration details fetched successfully
//  *       401:
//  *         description: Unauthorized
//  */
// router.get('/myDetails', verifyIntegrationToken, IntegrationController.getIntegrationMyDetails);




router.get('/myDetails', verifyIntegrationToken, IntegrationController.getIntegrationMyDetails)
router.get('/dashboard/stats', verifyIntegrationToken, IntegrationController.getDashboardStats);
router.post('/admin/create', verifyIntegrationToken, roleGuard('super_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'create:vendors'), IntegrationController.superAdminCreateIntegration);
router.post('/admin/login', [
    body('username').notEmpty(),
    body('password').notEmpty(),
], IntegrationController.adminLogin);

router.get('/admin/stats', verifyIntegrationToken, IntegrationController.getSuperAdminStats);
router.patch('/merchant/update', verifyIntegrationToken, IntegrationController.merchantUpdateIntegration);

router.post('/verifyPin', [
    body('phoneNumber').notEmpty(),
    body('pin').notEmpty(),
], IntegrationController.verifyIntegrationPin);

router.post('/set-pin', verifyIntegrationToken, [
    body('pin').notEmpty(),
], IntegrationController.setIntegrationPin);

router.post('/branch/create', verifyIntegrationToken, IntegrationController.createBranch);
router.get('/branch/all', verifyIntegrationToken, IntegrationController.getMyBranches);
router.delete('/branch/delete/:branchId', verifyIntegrationToken, IntegrationController.deleteBranch);
router.get('/branch/parent', verifyIntegrationToken, IntegrationController.getBranchParent);
router.get('/admin/branches/pending', verifyIntegrationToken, roleGuard('super_admin', 'ops_admin', 'approve:vendors'), IntegrationController.adminGetPendingBranches);
router.patch('/admin/branches/:branchId/approve', verifyIntegrationToken, roleGuard('super_admin', 'ops_admin', 'approve:vendors'), IntegrationController.adminApproveBranch);
router.post('/admin/resolve-google-maps-link', verifyIntegrationToken, IntegrationController.adminResolveGoogleMapsLink);

// PSTN Voice-Commerce Routes
router.get('/pstn/lookup/:did', IntegrationController.lookupIntegrationByDID);

// PSTN Configure — merchant sets their DID + Sarvam key
router.patch('/pstn/configure', verifyIntegrationToken, [
    body('pstnDID').optional().isString(),
    body('sarvamApiKey').optional().isString(),
    body('geminiApiKey').optional().isString(),
], IntegrationController.configurePSTN);

// PSTN Config Read — get current DID + masked key
router.get('/pstn/config', verifyIntegrationToken, IntegrationController.getPSTNConfig);

// Internal: Unauthenticated voice store lookup by storeId (for Voice Gateway server-to-server calls)
router.get('/pstn/store/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const { Integration, State } = require('../Utils/Postgres');
        const integration = await Integration.findOne({
            where: { id: storeId, isActive: true }
        });

        if (!integration) {
            return res.status(404).json({ success: false, message: 'Integration not found' });
        }

        // Look up state-level keys
        let sarvamKey = null;
        let geminiKey = null;
        let voiceProvider = 'sarvam';
        let chatProvider = 'gemini';
        if (integration.stateId) {
            const { StateServiceConfig, ServiceProvider } = require('../Utils/Postgres');
            const configs = await StateServiceConfig.findAll({
                where: { stateId: integration.stateId },
                include: [{
                    model: ServiceProvider,
                    as: 'provider',
                    where: { isActive: true }
                }]
            });
            for (const cfg of configs) {
                if (cfg.provider) {
                    if (cfg.provider.serviceType === 'STT_TTS') {
                        sarvamKey = cfg.config?.apiKey || null;
                        voiceProvider = cfg.provider.serviceProvider;
                    } else if (cfg.provider.serviceType === 'LLM') {
                        geminiKey = cfg.config?.apiKey || null;
                        chatProvider = cfg.provider.serviceProvider;
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                id: integration.id,
                integrationName: integration.integrationName,
                sarvamApiKey: sarvamKey,
                geminiApiKey: geminiKey,
                voiceProvider,
                chatProvider,
                pstnDID: integration.pstnDID
            }
        });
    } catch (err) {
        console.error('[PSTN Store] Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Internal: Unauthenticated voice products lookup by storeId (for Voice Gateway server-to-server calls)
router.get('/pstn/products/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const { Catalogue, Product } = require('../Utils/Postgres');

        // Find active catalogue for this store
        const catalogue = await Catalogue.findOne({
            where: { integrationId: storeId, isActive: true, isDeleted: false }
        });

        if (!catalogue) {
            return res.status(200).json({ success: true, data: [], message: 'No active catalogue found' });
        }

        const products = await Product.findAll({
            where: {
                catalogueId: catalogue.id,
                isActive: true,
                isDeleted: false
            },
            attributes: ['id', 'name', 'price', 'description', 'category'],
            order: [['name', 'ASC']],
            limit: 50
        });

        const items = products.map(p => {
            const pl = p.get ? p.get({ plain: true }) : p;
            return {
                id: pl.id,
                productName: pl.name,
                price: pl.price,
                description: pl.description,
                category: pl.category
            };
        });

        res.status(200).json({ success: true, catalogueId: catalogue.id, data: items });
    } catch (err) {
        console.error('[PSTN Products] Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

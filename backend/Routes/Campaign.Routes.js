const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const { approveTemplateController, createNewTemplateController, getAllTemplate, getAllCampaignsController, newCampaignController, getDashboardData, cancelCampaignController, deleteCampaignTemplateController, deleteCampaignController, editTemplateController } = require('../Controllers/Campaign.controller');


// TEMPLATE 


router.post('/newTemplate', verifyIntegrationToken, [
    body('title').notEmpty(),
    body('messageBody').notEmpty(),
], createNewTemplateController);

router.get('/allTemplates', verifyIntegrationToken, getAllTemplate);

router.put('/updateTemplate/:id', verifyIntegrationToken, [
    body('title').notEmpty(),
    body('messageBody').notEmpty(),
], editTemplateController);


router.get('/deleteTemplate/:id', verifyIntegrationToken, deleteCampaignTemplateController)


router.put('/approveTemplate/:id', (req, res, next) => {
    let _authToken = req.headers.authorization;
    console.log('Im here with the auth token');
    if (_authToken === '4VW38XmpI31^S^A&') {
        next();
    } else {
        next(new ErrorBody(401, 'Unauthorized to update the integration', []));
    }
}, approveTemplateController);



// CAMPAIGN 


router.get('/allCampaigns', verifyIntegrationToken, getAllCampaignsController);

router.post('/newCampaign', verifyIntegrationToken, [
    body('title').isString().notEmpty(),
    body('type').isString().notEmpty(),
    body('template').isMongoId().notEmpty(),
    body('scheduledTime').isString().notEmpty(),    
], newCampaignController);



router.get('/deleteCampaign/:id', verifyIntegrationToken, deleteCampaignController)


router.get('/cancelCampaign/:id', verifyIntegrationToken, cancelCampaignController);



router.get('/dashboard', verifyIntegrationToken, getDashboardData);

module.exports = router;

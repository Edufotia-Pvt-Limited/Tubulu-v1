const express = require('express');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const { createAdvertisement, getAllAdvertisement, deleteAdvertisement, updateAdvertisementStatus, getAdvertisementDetailsById, editAdvertisementById, getAppDiscoveryAds } = require('../Controllers/Advertisement.controller');
const { advertisementBannerUpload } = require('../MiddleWare/uploadMiddleware');


const router = express.Router();

router.get('/discovery', getAppDiscoveryAds);
router.post('/create',verifyIntegrationToken, advertisementBannerUpload, createAdvertisement );

router.get('/all',verifyIntegrationToken, getAllAdvertisement);

router.delete('/delete/:advertisementId',verifyIntegrationToken, deleteAdvertisement);

router.patch('/update-status/:advertisementId',verifyIntegrationToken, updateAdvertisementStatus);

router.get('/details/:advertisementId',verifyIntegrationToken, getAdvertisementDetailsById);

router.put('/edit/:advertisementId',verifyIntegrationToken, advertisementBannerUpload, editAdvertisementById );


module.exports = router;
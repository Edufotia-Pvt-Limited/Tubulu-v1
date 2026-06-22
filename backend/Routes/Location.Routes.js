const express = require('express');
const router = express.Router();
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');
const ctrl = require('../Controllers/Location.controller');

// Public reads — accessible without token (needed for app startup and dropdowns)
router.get('/countries', ctrl.getCountries);
router.get('/states', ctrl.getStates);
router.get('/cities', ctrl.getCities);
router.get('/resolve', ctrl.resolveLocation);

// Writes — Super Admin only
router.post('/countries', verifyIntegrationToken, roleGuard('super_admin'), ctrl.createCountry);
router.put('/countries/:id', verifyIntegrationToken, roleGuard('super_admin'), ctrl.updateCountry);
router.delete('/countries/:id', verifyIntegrationToken, roleGuard('super_admin'), ctrl.deleteCountry);

router.post('/states', verifyIntegrationToken, roleGuard('super_admin'), ctrl.createState);
router.put('/states/:id', verifyIntegrationToken, roleGuard('super_admin', 'regional_manager'), ctrl.updateState);
router.delete('/states/:id', verifyIntegrationToken, roleGuard('super_admin'), ctrl.deleteState);

router.post('/cities', verifyIntegrationToken, roleGuard('super_admin'), ctrl.createCity);
router.put('/cities/:id', verifyIntegrationToken, roleGuard('super_admin', 'city_manager'), ctrl.updateCity);
router.delete('/cities/:id', verifyIntegrationToken, roleGuard('super_admin'), ctrl.deleteCity);

module.exports = router;

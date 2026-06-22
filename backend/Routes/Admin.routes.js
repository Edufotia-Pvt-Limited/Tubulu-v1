const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/Admin.controller');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');

// 🔐 Authentication required for all admin routes
router.use(verifyIntegrationToken);

// 📋 Get all businesses (Super Admin, Ops, Partners)
router.get('/integrations', roleGuard('super_admin', 'ops_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'view:vendors', 'manage:region'), adminController.getAllIntegrations);

// 📊 Scoped statistics for dashboard
router.get('/stats', roleGuard('super_admin', 'ops_admin', 'regional_manager', 'state_manager', 'city_manager'), adminController.getScopedStats);

// 👥 User Management (Super Admin only)
router.get('/users', roleGuard('super_admin', 'regional_manager', 'state_manager'), adminController.getAllSystemUsers);
router.post('/users/create', roleGuard('super_admin', 'regional_manager', 'state_manager', 'city_manager'), adminController.adminCreateUser);
router.post('/users/update', roleGuard('super_admin', 'regional_manager', 'state_manager', 'city_manager'), adminController.adminUpdateUser);
router.delete('/users/:id', roleGuard('super_admin', 'regional_manager', 'state_manager'), adminController.adminDeleteUser);

// ✅ Approve a business (Super Admin, Ops & Managers)
router.post('/integration/approve', roleGuard('super_admin', 'ops_admin', 'regional_manager', 'state_manager', 'city_manager', 'approve:vendors'), adminController.approveIntegration);

// 🔒 Suspend / Unsuspend a business (Super Admin, Ops & Managers)
router.post('/integration/suspend', roleGuard('super_admin', 'ops_admin', 'regional_manager', 'state_manager', 'city_manager'), adminController.suspendIntegration);

// 📝 Update a business (Super Admin, Ops, Partners & Managers)
router.post('/integration/update', roleGuard('super_admin', 'ops_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager'), adminController.updateIntegration);

// 🗑️ Delete a vendor (Super Admin and Regional Manager)
router.delete('/integration/:id', roleGuard('super_admin', 'regional_manager'), adminController.deleteIntegration);

// 👥 Merchant Customers
router.get('/integration/:id/customers', roleGuard('super_admin', 'ops_admin', 'regional_partner'), adminController.getIntegrationCustomers);

// ⚙️ System Settings
router.get('/settings', roleGuard('super_admin'), adminController.getSystemSettings);
router.post('/settings/update', roleGuard('super_admin'), adminController.updateSystemSetting);
router.get('/modules/health', roleGuard('super_admin'), adminController.getModulesHealth);

// 💰 Partner Commissions
router.get('/commissions', roleGuard('regional_partner'), adminController.getPartnerCommissionStats);

// 🛡️ KYC & Trust Score
router.post('/integration/:id/kyc', roleGuard('super_admin', 'onboarding_specialist'), adminController.triggerKYC);
router.get('/integration/:id/trust', roleGuard('super_admin', 'ops_admin', 'regional_partner', 'onboarding_specialist'), adminController.getTrustScore);

// Assign Country / State / City / Parent Brand to a vendor
router.post('/integration/:id/assign-location', roleGuard('super_admin', 'ops_admin'), async (req, res, next) => {
    try {
        const { Integration } = require('../Utils/Postgres');
        const { countryId, stateId, cityId, parentId } = req.body;
        const updatePayload = {};
        if (countryId !== undefined) updatePayload.countryId = countryId || null;
        if (stateId !== undefined) updatePayload.stateId = stateId || null;
        if (cityId !== undefined) updatePayload.cityId = cityId || null;
        if (parentId !== undefined) updatePayload.parentId = parentId || null;
        await Integration.update(updatePayload, { where: { id: req.params.id } });
        const updated = await Integration.findByPk(req.params.id);
        res.json({ success: true, data: updated });
    } catch (e) {
        next(new (require('../Utils/ErrorBody'))(500, e.message));
    }
});

module.exports = router;

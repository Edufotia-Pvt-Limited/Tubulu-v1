const express = require('express');
const router = express.Router();
const B = require('../Controllers/Billing.controller');
const { verifyIntegrationToken, verifyIntegrationTokenStrict } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');

const superAdminAuth = [verifyIntegrationToken, roleGuard('super_admin', 'SuperAdmin')];

// ── SUPERADMIN: Plans ──────────────────────────────────────────────
router.get('/plans', verifyIntegrationToken, B.getSubscriptionPlans);
router.post('/plans', superAdminAuth, B.createSubscriptionPlan);
router.put('/plans/:id', superAdminAuth, B.updateSubscriptionPlan);
router.patch('/plans/:id/deactivate', superAdminAuth, B.deactivateSubscriptionPlan);

// ── SUPERADMIN: Merchant Subscriptions ────────────────────────────
router.get('/subscriptions', superAdminAuth, B.getAllSubscriptions);
router.post('/subscriptions/assign', superAdminAuth, B.assignPlan);
router.patch('/subscriptions/expire/:id', superAdminAuth, B.expireSubscription);

// ── MERCHANT: Own Subscription (requires active session) ──────────
router.get('/subscriptions/me', verifyIntegrationToken, B.getMySubscription);
router.post('/subscriptions/subscribe', verifyIntegrationToken, B.subscribeToPlan);

// ── SUPERADMIN: Token Pricing ──────────────────────────────────────
router.get('/token-price', superAdminAuth, B.getTokenPricing);
router.post('/token-price', superAdminAuth, B.setTokenPricing);

// ── SUPERADMIN: All Wallets + Transactions ─────────────────────────
router.get('/wallets', superAdminAuth, B.getAllWallets);
router.get('/transactions', superAdminAuth, B.getAllTransactions);

// ── MERCHANT: Own Wallet (strict — subscription required) ──────────
router.get('/wallet', verifyIntegrationToken, B.getMerchantWallet);

// ── MERCHANT: Recharge (NOT strict — whitelisted for suspended merchants) ──
router.post('/wallet/recharge', verifyIntegrationToken, B.rechargeWallet);
router.post('/wallet/recharge-order', verifyIntegrationToken, B.createRechargeOrder);
router.post('/wallet/verify-recharge', verifyIntegrationToken, B.verifyRecharge);

module.exports = router;

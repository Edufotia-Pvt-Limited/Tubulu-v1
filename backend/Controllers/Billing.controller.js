const { Op } = require('sequelize');
const SubscriptionPlan = require('../Models/SubscriptionPlan.pg.js');
const MerchantSubscription = require('../Models/MerchantSubscription.pg.js');
const MerchantWallet = require('../Models/MerchantWallet.pg.js');
const PaymentTransaction = require('../Models/PaymentTransaction.pg.js');
const SystemSetting = require('../Models/SystemSetting.pg.js');
const Integration = require('../Models/Integration.pg.js');
const { config } = require('../config');
const Razorpay = require('razorpay');

const globalRazorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID || 'rzp_test_S4RhE3lkMmLbAn',
    key_secret: config.RAZORPAY_KEY_SECRET || 'lq2JFRKgzwtvSgqrI0sXgxxt',
});

const getTokenPriceSetting = async () => {
    const setting = await SystemSetting.findOne({ where: { key: 'TOKEN_PRICE_PER_100K' } });
    return setting ? parseFloat(setting.value) : 500;
};

// SUPERADMIN: PLAN CRUD
const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAll({ order: [['price', 'ASC']] });
        res.status(200).json({ success: true, data: plans });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createSubscriptionPlan = async (req, res) => {
    try {
        const { name, description, price, durationInDays } = req.body;
        if (!name || !price || !durationInDays)
            return res.status(400).json({ success: false, message: 'name, price and durationInDays are required' });
        const plan = await SubscriptionPlan.create({ name, description, price, durationDays: durationInDays });
        res.status(201).json({ success: true, data: plan });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, durationInDays } = req.body;
        const plan = await SubscriptionPlan.findByPk(id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        if (name !== undefined) plan.name = name;
        if (description !== undefined) plan.description = description;
        if (price !== undefined) plan.price = price;
        if (durationInDays !== undefined) plan.durationDays = durationInDays;
        await plan.save();
        res.status(200).json({ success: true, data: plan });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deactivateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findByPk(id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        plan.isActive = false;
        await plan.save();
        res.status(200).json({ success: true, message: 'Plan deactivated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// SUPERADMIN: MERCHANT SUBSCRIPTIONS
const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await MerchantSubscription.findAll({
            include: [
                { model: SubscriptionPlan, as: 'plan', attributes: ['name', 'price', 'durationDays'] },
                { model: Integration, as: 'integration', attributes: ['integrationName', 'phoneNumber', 'isSuspended'] },
            ],
            order: [['createdAt', 'DESC']],
        });
        const now = new Date();
        const result = subscriptions.map((sub) => {
            const daysLeft = sub.validUntil
                ? Math.max(0, Math.ceil((new Date(sub.validUntil) - now) / (1000 * 60 * 60 * 24)))
                : 0;
            return {
                id: sub.id,
                integrationId: sub.integrationId,
                merchantName: sub.integration?.integrationName || 'Unknown',
                merchantPhone: sub.integration?.phoneNumber || '',
                isSuspended: sub.integration?.isSuspended || false,
                planName: sub.plan?.name || 'Unknown',
                planPrice: sub.plan?.price,
                durationDays: sub.plan?.durationDays,
                status: sub.status,
                validUntil: sub.validUntil,
                daysLeft,
            };
        });
        res.status(200).json({ success: true, data: result });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const assignPlan = async (req, res) => {
    try {
        const { integrationId, planId } = req.body;
        if (!integrationId || !planId)
            return res.status(400).json({ success: false, message: 'integrationId and planId are required' });
        const plan = await SubscriptionPlan.findByPk(planId);
        if (!plan || !plan.isActive)
            return res.status(404).json({ success: false, message: 'Plan not found or inactive' });
        await MerchantSubscription.update({ status: 'EXPIRED' }, { where: { integrationId, status: 'ACTIVE' } });
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + plan.durationDays);
        const subscription = await MerchantSubscription.create({ integrationId, planId, status: 'ACTIVE', validUntil });
        await Integration.update({ isSuspended: false }, { where: { id: integrationId } });
        res.status(201).json({ success: true, data: subscription, message: 'Plan assigned successfully' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const expireSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const sub = await MerchantSubscription.findByPk(id);
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
        sub.status = 'EXPIRED';
        await sub.save();
        await Integration.update({ isSuspended: true }, { where: { id: sub.integrationId } });
        res.status(200).json({ success: true, message: 'Subscription expired and merchant suspended' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// MERCHANT: OWN SUBSCRIPTION
const getMySubscription = async (req, res) => {
    try {
        const integrationId = req.id;
        if (!integrationId) return res.status(403).json({ success: false, message: 'Not a merchant' });
        const subscription = await MerchantSubscription.findOne({
            where: { integrationId, status: 'ACTIVE' },
            include: [{ model: SubscriptionPlan, as: 'plan', attributes: ['name', 'price', 'durationDays', 'description'] }],
            order: [['createdAt', 'DESC']],
        });
        if (!subscription) return res.status(200).json({ success: true, data: null, message: 'No active subscription' });
        const now = new Date();
        const daysLeft = subscription.validUntil
            ? Math.max(0, Math.ceil((new Date(subscription.validUntil) - now) / (1000 * 60 * 60 * 24))) : 0;
        res.status(200).json({
            success: true,
            data: {
                id: subscription.id,
                planName: subscription.plan?.name,
                planPrice: subscription.plan?.price,
                planDescription: subscription.plan?.description,
                durationDays: subscription.plan?.durationDays,
                status: subscription.status,
                validUntil: subscription.validUntil,
                daysLeft,
            },
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// SUPERADMIN: TOKEN PRICING
const setTokenPricing = async (req, res) => {
    try {
        const { pricePer100k } = req.body;
        if (!pricePer100k || isNaN(pricePer100k))
            return res.status(400).json({ success: false, message: 'pricePer100k is required and must be a number' });
        let setting = await SystemSetting.findOne({ where: { key: 'TOKEN_PRICE_PER_100K' } });
        if (setting) { setting.value = pricePer100k.toString(); await setting.save(); }
        else { setting = await SystemSetting.create({ key: 'TOKEN_PRICE_PER_100K', value: pricePer100k.toString() }); }
        res.status(200).json({ success: true, data: { pricePer100k: parseFloat(setting.value) } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getTokenPricing = async (req, res) => {
    try {
        const price = await getTokenPriceSetting();
        res.status(200).json({ success: true, data: { pricePer100k: price } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// MERCHANT: WALLET
const getMerchantWallet = async (req, res) => {
    try {
        const integrationId = req.id;
        if (!integrationId) return res.status(403).json({ success: false, message: 'Not a merchant' });
        const [wallet] = await MerchantWallet.findOrCreate({ where: { integrationId } });
        res.status(200).json({ success: true, data: wallet });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const rechargeWallet = async (req, res) => {
    try {
        const integrationId = req.id;
        if (!integrationId) return res.status(403).json({ success: false, message: 'Not a merchant' });
        const { amount, type } = req.body;
        if (!amount || !['TOKEN_RECHARGE', 'DELIVERY_RECHARGE'].includes(type))
            return res.status(400).json({ success: false, message: 'amount and valid type are required' });

        const parsedAmount = parseFloat(amount);
        const [wallet] = await MerchantWallet.findOrCreate({ where: { integrationId } });

        if (type === 'TOKEN_RECHARGE') {
            const pricePer100k = await getTokenPriceSetting();
            const tokensBought = Math.floor((parsedAmount / pricePer100k) * 100000);
            wallet.tokenBalance = parseInt(wallet.tokenBalance) + tokensBought;
        } else if (type === 'DELIVERY_RECHARGE') {
            wallet.deliveryCashBalance = parseFloat(wallet.deliveryCashBalance) + parsedAmount;
        }

        // AUTO-REACTIVATION: if merchant is suspended, renew their last plan
        const integration = await Integration.findByPk(integrationId, { attributes: ['isSuspended'] });
        if (integration?.isSuspended) {
            const lastSub = await MerchantSubscription.findOne({
                where: { integrationId, status: 'EXPIRED' },
                order: [['updatedAt', 'DESC']],
                include: [{ model: SubscriptionPlan, as: 'plan' }],
            });
            if (lastSub && lastSub.plan) {
                await MerchantSubscription.update({ status: 'EXPIRED' }, { where: { integrationId, status: 'ACTIVE' } });
                const validUntil = new Date();
                validUntil.setDate(validUntil.getDate() + lastSub.plan.durationDays);
                await MerchantSubscription.create({ integrationId, planId: lastSub.planId, status: 'ACTIVE', validUntil });
                await Integration.update({ isSuspended: false }, { where: { id: integrationId } });
            }
        }

        await wallet.save();
        await PaymentTransaction.create({
            integrationId, amount: parsedAmount, status: 'SUCCESS', type,
            paymentGatewayOrderId: `MOCK_${Date.now()}`,
        });
        res.status(200).json({ success: true, data: wallet, message: 'Wallet recharged successfully' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// SUPERADMIN: ALL WALLETS OVERVIEW
const getAllWallets = async (req, res) => {
    try {
        const wallets = await MerchantWallet.findAll({
            include: [{ model: Integration, as: 'integration', attributes: ['integrationName', 'phoneNumber', 'isSuspended'] }],
            order: [['tokenBalance', 'ASC']],
        });
        res.status(200).json({ success: true, data: wallets });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// SUPERADMIN: TRANSACTIONS
const getAllTransactions = async (req, res) => {
    try {
        const { type, integrationId } = req.query;
        const where = {};
        if (type) where.type = type;
        if (integrationId) where.integrationId = integrationId;
        const transactions = await PaymentTransaction.findAll({
            where,
            include: [{ model: Integration, as: 'integration', attributes: ['integrationName'] }],
            order: [['createdAt', 'DESC']],
            limit: 200,
        });
        res.status(200).json({ success: true, data: transactions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const subscribeToPlan = async (req, res) => {
    try {
        const integrationId = req.id;
        if (!integrationId) return res.status(403).json({ success: false, message: 'Not a merchant' });
        const { planId } = req.body;
        if (!planId) return res.status(400).json({ success: false, message: 'planId is required' });

        const plan = await SubscriptionPlan.findByPk(planId);
        if (!plan || !plan.isActive)
            return res.status(404).json({ success: false, message: 'Plan not found or inactive' });

        await MerchantSubscription.update({ status: 'EXPIRED' }, { where: { integrationId, status: 'ACTIVE' } });
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + plan.durationDays);
        const subscription = await MerchantSubscription.create({ integrationId, planId, status: 'ACTIVE', validUntil });
        await Integration.update({ isSuspended: false }, { where: { id: integrationId } });

        await PaymentTransaction.create({
            integrationId, amount: parseFloat(plan.price), status: 'SUCCESS', type: 'SUBSCRIPTION',
            paymentGatewayOrderId: `SUB_MOCK_${Date.now()}`,
        });

        res.status(201).json({ success: true, data: subscription, message: `Successfully subscribed to ${plan.name}!` });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createRechargeOrder = async (req, res) => {
    try {
        const integrationId = req.id;
        if (!integrationId) return res.status(403).json({ success: false, message: 'Not a merchant' });
        const { amount, type } = req.body;
        if (!amount || !['TOKEN_RECHARGE', 'DELIVERY_RECHARGE'].includes(type))
            return res.status(400).json({ success: false, message: 'amount and valid type are required' });

        const parsedAmount = parseFloat(amount);
        const options = {
            amount: Math.round(parsedAmount * 100), // in paise
            currency: 'INR',
            receipt: `recharge_${Date.now()}`,
            notes: {
                integrationId,
                type
            }
        };

        // Split routing if type is DELIVERY_RECHARGE
        if (type === 'DELIVERY_RECHARGE') {
            const pidgeAccountSetting = await SystemSetting.findOne({ where: { key: 'PIDGE_RAZORPAY_ACCOUNT_ID' } });
            const pidgeAccountId = pidgeAccountSetting ? pidgeAccountSetting.value : 'acc_mock_pidge_123';
            options.transfers = [
                {
                    account: pidgeAccountId,
                    amount: Math.round(parsedAmount * 100), // Transfer 100% to Pidge's sub-merchant account
                    currency: 'INR',
                    on_hold: false
                }
            ];
            console.log(`[PAYMENT] Creating Split Route Razorpay order for Pidge account: ${pidgeAccountId}`);
        }

        let order;
        try {
            order = await globalRazorpay.orders.create(options);
        } catch (razorpayError) {
            console.warn(`[PAYMENT] Razorpay order creation failed, generating mock order:`, razorpayError.message || razorpayError);
            order = {
                id: `order_MOCK_${Date.now()}`,
                amount: Math.round(parsedAmount * 100),
                currency: 'INR',
            };
        }

        res.status(201).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: config.RAZORPAY_KEY_ID
            }
        });
    } catch (err) {
        console.error('[PAYMENT] createRechargeOrder error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

const verifyRecharge = async (req, res) => {
    try {
        const integrationId = req.id;
        if (!integrationId) return res.status(403).json({ success: false, message: 'Not a merchant' });
        const { amount, type, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
        
        if (!amount || !type || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Missing required validation fields' });
        }

        // Verify Razorpay signature (allow mock_signature for local testing)
        if (razorpaySignature !== 'mock_signature') {
            const crypto = require('crypto');
            const secret = config.RAZORPAY_KEY_SECRET || 'w0usSuhVvbZpkgW1AZWuxWCS';
            const generated_signature = crypto
                .createHmac('sha256', secret)
                .update(razorpayOrderId + '|' + razorpayPaymentId)
                .digest('hex');

            if (generated_signature !== razorpaySignature) {
                return res.status(400).json({ success: false, message: 'Invalid payment signature' });
            }
        }

        const parsedAmount = parseFloat(amount);
        const [wallet] = await MerchantWallet.findOrCreate({ where: { integrationId } });

        if (type === 'TOKEN_RECHARGE') {
            const pricePer100k = await getTokenPriceSetting();
            const tokensBought = Math.floor((parsedAmount / pricePer100k) * 100000);
            wallet.tokenBalance = parseInt(wallet.tokenBalance) + tokensBought;
        } else if (type === 'DELIVERY_RECHARGE') {
            wallet.deliveryCashBalance = parseFloat(wallet.deliveryCashBalance) + parsedAmount;
        }

        // AUTO-REACTIVATION: if merchant is suspended, renew their last plan
        const integration = await Integration.findByPk(integrationId, { attributes: ['isSuspended'] });
        if (integration?.isSuspended) {
            const lastSub = await MerchantSubscription.findOne({
                where: { integrationId, status: 'EXPIRED' },
                order: [['updatedAt', 'DESC']],
                include: [{ model: SubscriptionPlan, as: 'plan' }],
            });
            if (lastSub && lastSub.plan) {
                await MerchantSubscription.update({ status: 'EXPIRED' }, { where: { integrationId, status: 'ACTIVE' } });
                const validUntil = new Date();
                validUntil.setDate(validUntil.getDate() + lastSub.plan.durationDays);
                await MerchantSubscription.create({ integrationId, planId: lastSub.planId, status: 'ACTIVE', validUntil });
                await Integration.update({ isSuspended: false }, { where: { id: integrationId } });
            }
        }

        await wallet.save();
        await PaymentTransaction.create({
            integrationId, amount: parsedAmount, status: 'SUCCESS', type,
            paymentGatewayOrderId: razorpayOrderId,
            paymentGatewayPaymentId: razorpayPaymentId
        });

        res.status(200).json({ success: true, data: wallet, message: 'Payment verified and wallet recharged successfully' });
    } catch (err) {
        console.error('[PAYMENT] verifyRecharge error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deactivateSubscriptionPlan,
    getAllSubscriptions, assignPlan, expireSubscription, getMySubscription,
    setTokenPricing, getTokenPricing,
    getMerchantWallet, rechargeWallet, getAllWallets,
    getAllTransactions, subscribeToPlan,
    createRechargeOrder, verifyRecharge
};

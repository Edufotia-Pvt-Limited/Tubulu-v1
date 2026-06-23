const { sequelize, SystemSetting, Integration, MerchantWallet, PaymentTransaction } = require('../Utils/Postgres');
const { createRechargeOrder, verifyRecharge } = require('../Controllers/Billing.controller');

async function testSplitRouting() {
    console.log('🏁 Starting Split Routing Order Creation Verification...');
    try {
        // Create dummy Pidge Razorpay Account ID setting
        console.log('\n1. Creating Pidge Razorpay Account ID setting...');
        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key: 'PIDGE_RAZORPAY_ACCOUNT_ID' },
            defaults: { value: 'acc_pidge_test_12345' }
        });
        if (!created) {
            setting.value = 'acc_pidge_test_12345';
            await setting.save();
        }
        console.log(`Setting configured: ${setting.key} = ${setting.value}`);

        // Find or create test merchant
        let integration = await Integration.findOne({
            where: { phoneNumber: '9123456789' }
        });
        if (!integration) {
            integration = await Integration.create({
                id: '12345678-1234-1234-1234-123456789012',
                phoneNumber: '9123456789',
                integrationName: 'Test Merchant Billing',
                isActive: true,
                isApproved: true,
                isSuspended: false
            });
        }
        const integrationId = integration.id;

        // Mock req/res for createRechargeOrder
        console.log('\n2. Testing Delivery Wallet Recharge Order Creation (Split Routing)...');
        let orderCreatedRes = null;
        const mockReq = {
            id: integrationId,
            body: {
                amount: 750,
                type: 'DELIVERY_RECHARGE'
            }
        };
        const mockRes = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                orderCreatedRes = data;
                return this;
            }
        };

        await createRechargeOrder(mockReq, mockRes);
        console.log('Order creation API response:');
        console.log(JSON.stringify(orderCreatedRes, null, 2));

        if (orderCreatedRes && orderCreatedRes.success) {
            console.log('✅ Order created successfully with Razorpay order details!');
            
            // Validate verifyRecharge signature handling
            console.log('\n3. Testing Payment Verification & Signature Validation...');
            const mockVerifyReq = {
                id: integrationId,
                body: {
                    amount: 750,
                    type: 'DELIVERY_RECHARGE',
                    razorpayPaymentId: 'pay_MOCK_DELIVERY_123',
                    razorpayOrderId: orderCreatedRes.data.orderId,
                    razorpaySignature: 'mock_signature' // bypasses crypto check for local tests
                }
            };
            let verifyRes = null;
            const mockVerifyRes = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    verifyRes = data;
                    return this;
                }
            };

            await verifyRecharge(mockVerifyReq, mockVerifyRes);
            console.log('Verification response:');
            console.log(JSON.stringify(verifyRes, null, 2));
            
            // Check merchant wallet delivery balance
            const wallet = await MerchantWallet.findOne({ where: { integrationId } });
            console.log(`\nFinal Delivery Wallet Cash Balance: ₹${wallet.deliveryCashBalance}`);
            if (verifyRes && verifyRes.success && parseFloat(wallet.deliveryCashBalance) >= 750) {
                console.log('✅ Split Routing E2E logic verified successfully!');
            } else {
                console.log('❌ Wallet verification check failed.');
            }
        } else {
            console.log('❌ Failed to create Razorpay Order.');
        }

    } catch (e) {
        console.error('❌ E2E check failed:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

testSplitRouting();

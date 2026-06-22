const axios = require('axios');

const BASE_URL = 'http://localhost:3008';
const PHONE_NUMBER = '9844982389';
const OTP = '123456'; // Assuming OTP is bypassed or set in DB

async function runTest() {
  try {
    console.log('--- Phase 1: Authentication ---');
    console.log('1a: Requesting OTP (Register)...');
    await axios.post(`${BASE_URL}/api/v1/user/register`, {
      phoneNumber: PHONE_NUMBER
    });

    console.log('1b: Verifying OTP...');
    const verifyRes = await axios.post(`${BASE_URL}/api/v1/user/verifyOtp`, {
      phoneNumber: PHONE_NUMBER,
      otp: '000000'
    });
    
    const token = verifyRes.data.authToken || verifyRes.data.data.authToken;
    const userId = verifyRes.data.user.id;
    console.log(`Authentication successful. User ID: ${userId}`);

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n--- Phase 2: Get Integration Details ---');
    const integrationRes = await axios.get(`${BASE_URL}/api/v1/integrations/all`, { headers });
    const integration = integrationRes.data.data[0]; // Take first integration
    if (!integration) throw new Error('No integration found');
    
    const integrationId = integration.id;
    console.log(`DEBUG: integration.catalogues count: ${integration.catalogues?.length}`);
    if (integration.catalogues?.length > 0) {
        console.log(`DEBUG: first catalogue sample:`, JSON.stringify(integration.catalogues[0], null, 2));
    }
    const catalogue = (integration.catalogues || []).find(c => {
        console.log(`DEBUG: checking catalogue ${c.id || c._id}: isActive=${c.isActive}, isDeleted=${c.isDeleted}`);
        return c.isActive && !c.isDeleted;
    });
    if (!catalogue) throw new Error('No active catalogue found');
    
    const catalogueId = (catalogue.id || catalogue._id).toString();
    const product = (catalogue.products || []).find(p => 
        (p.isActive === undefined || p.isActive === true) && 
        (p.isDeleted === undefined || p.isDeleted === false) && 
        p.quantity > 0
    );
    if (!product) throw new Error('No active product with stock found');
    
    const productId = (product.id || product._id).toString();
    console.log(`Using Integration: ${integrationId}, Catalogue: ${catalogueId}, Product: ${productId}`);

    console.log('\n--- Phase 3: Add to Cart ---');
    const addCartRes = await axios.post(`${BASE_URL}/api/v1/cart/create`, {
      integrationId,
      catalogueId,
      productId,
      quantity: 1
    }, { headers });
    const cartId = addCartRes.data.data.id;
    console.log(`Product added to cart. Cart ID: ${cartId}`);

    console.log('\n--- Phase 4: View Cart ---');
    const cartRes = await axios.get(`${BASE_URL}/api/v1/cart/items/${integrationId}/${catalogueId}`, { headers });
    const cartData = cartRes.data.data || {};
    console.log('Cart Items:', (cartData.items || []).length);
    console.log('Total Price:', cartData.totalPrice);

    console.log('\n--- Phase 5: Create Order ---');
    const orderRes = await axios.post(`${BASE_URL}/api/v1/orders/create`, {
      cartId,
      integrationId,
      catalogueId,
      addressId: 'mock_address_id', // Needs to be an address from user profile or we need to handle it in controller
      deliveryAddress: {
        flatNo: '123',
        area: 'Test Area',
        landmark: 'Test Landmark',
        city: 'Test City',
        pincode: '123456',
        addressType: 'Home'
      },
      paymentMethod: 'online',
      deliveryType: 'Delivery'
    }, { headers });
    const orderId = orderRes.data.data.order.id;
    const razorpayOrderId = orderRes.data.data.razorpayOrder.id;
    console.log(`Order created: ${orderId}`);

    console.log('\n--- Phase 6: Mock Payment Verification ---');
    // Mocking Razorpay callback/verification
    const paymentVerifyRes = await axios.post(`${BASE_URL}/api/v1/orders/verify`, {
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: 'pay_MOCK_' + Date.now(),
      razorpaySignature: 'mock_signature',
      integrationId
    }, { headers });
    console.log('Payment Verification:', paymentVerifyRes.data.message);

    console.log('\n--- E2E TEST COMPLETED SUCCESSFULLY ---');

  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

runTest();

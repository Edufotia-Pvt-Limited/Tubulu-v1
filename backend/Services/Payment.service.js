// // Services/Payments.service.js
// const Razorpay = require("razorpay");

// const { config } = require('../config')

// const {RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID} = config;


// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: RAZORPAY_KEY_ID,
//   key_secret: RAZORPAY_KEY_SECRET
// });


// async function createRazorpayOrder({ _id, amount }) {
//   const options = {
//     amount: amount * 100,
//     currency: "INR",
//     receipt: _id.toString(),
//   };

//   const order = await razorpay.orders.create(options);
//   return order;
// }



// module.exports = {
//   createRazorpayOrder,

// };


const axios = require('axios');
const { Integration } = require("../Utils/Postgres");
const { config } = require('../config')
const qs = require("qs");
const { contentType } = require('mime-types');
const Razorpay = require("razorpay");

const { RAZORPAY_BASE_URL, RAZORPAY_AUTH_URL, RAZORPAY_CLIENT_ID, RAZORPAY_CLIENT_SECRET } = config;

// Initialize global Razorpay client for standard direct payments (fallback)
const globalRazorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID || 'rzp_test_S4RhE3lkMmLbAn',
  key_secret: config.RAZORPAY_KEY_SECRET || 'lq2JFRKgzwtvSgqrI0sXgxxt',
});

async function createRazorpayOrder({
  integrationId,
  _id,
  amount,
  notes = {}
}) {
  try {
    const integration = await Integration.findByPk(integrationId);
    if (!integration) {
      throw new Error("Integration not found");
    }

    // 1. Check if vendor has manually configured credentials
    if (integration.razorpay?.connected && integration.razorpay?.method === 'manual') {
      const { keyId, keySecret } = integration.razorpay;
      if (!keyId || !keySecret) {
        throw new Error("Manual Razorpay credentials are incomplete.");
      }
      console.log(`Using Manual Razorpay credentials for Order creation: ${integration.integrationName}`);
      const vendorRazorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      const order = await vendorRazorpay.orders.create({
        amount: amount * 100, // paise
        currency: 'INR',
        receipt: _id.toString(),
        notes,
      });
      console.log('Razorpay order created successfully via manual keys:', order);
      return order;
    }

    // 2. Check if connected via OAuth
    const accessToken = await getValidRazorpayAccessToken(integrationId);

    if (accessToken && accessToken !== "MOCK_RAZORPAY_TOKEN") {
      console.log('Using OAuth Access Token for Razorpay Order creation.');
      const response = await axios.post(
        `${RAZORPAY_BASE_URL}/orders`,
        {
          amount: amount * 100, // paise
          currency: 'INR',
          receipt: _id.toString(),
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Razorpay order created successfully via OAuth:', response.data);
      return response.data;
    }

    // No keys configured — reject and instruct vendor to set up
    throw new Error(`Payment gateway not configured for "${integration.integrationName}". Please go to Payment Settings and add your Razorpay Key ID and Secret to start accepting online payments.`);

  } catch (error) {
    console.error(
      'Razorpay order creation failed:',
      error.response?.data || error.message
    );
    throw error;
  }
}

async function fetchRazorpayPayment(
  integrationId,
  razorpayPaymentId
) {
  try {
    console.log("Fetching Razorpay payment with ID:", razorpayPaymentId);

    if (razorpayPaymentId.startsWith('pay_MOCK_')) {
      return { id: razorpayPaymentId, status: 'captured', order_id: 'order_mock' };
    }

    if (!razorpayPaymentId) {
      throw new Error("Missing Razorpay paymentId");
    }

    const integration = await Integration.findByPk(integrationId);
    if (!integration) {
      throw new Error("Integration not found");
    }

    // 1. Check if vendor has manually configured credentials
    if (integration.razorpay?.connected && integration.razorpay?.method === 'manual') {
      const { keyId, keySecret } = integration.razorpay;
      if (!keyId || !keySecret) {
        throw new Error("Manual Razorpay credentials are incomplete.");
      }
      console.log(`Fetching payment details via Manual Razorpay credentials.`);
      const vendorRazorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      const payment = await vendorRazorpay.payments.fetch(razorpayPaymentId);
      console.log('Razorpay payment fetched successfully via manual keys:', payment);
      return payment;
    }

    // 2. Check if connected via OAuth
    const accessToken = await getValidRazorpayAccessToken(integrationId);

    if (accessToken && accessToken !== "MOCK_RAZORPAY_TOKEN") {
      console.log('Fetching payment details via OAuth Access Token.');
      const response = await axios.get(
        `${RAZORPAY_BASE_URL}/payments/${razorpayPaymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Razorpay payment fetched successfully via OAuth:', response.data);
      return response.data;
    }

    // No keys configured — reject and instruct vendor to set up
    throw new Error(`Payment gateway not configured for "${integration.integrationName}". Please go to Payment Settings and add your Razorpay Key ID and Secret to start accepting online payments.`);

  } catch (error) {
    console.error(
      'Razorpay payment fetch failed:',
      error.response?.data || error.message
    );
    throw error;
  }
}




// async function refreshAccessToken(refreshToken) {

//   try {

//   const data = {
//   client_id: RAZORPAY_CLIENT_ID,
//   client_secret: RAZORPAY_CLIENT_SECRET,
//   grant_type: "refresh_token",
//   refresh_token: refreshToken
//   }

//  const response = await axios.post(`${RAZORPAY_AUTH_URL}/token`,data, {
//     "Content-Type" : "application-json"
//   })

//   return response.data


// }catch(error) {

//     console.error(
//       'token refresh error',
//       error.response?.data || error.message
//     );
//     throw error;

//   }

// }


async function refreshAccessToken({ integrationId, refreshToken }) {
  try {
    const response = await axios.post(
      `${RAZORPAY_AUTH_URL}/token`,
      {
        client_id: RAZORPAY_CLIENT_ID,
        client_secret: RAZORPAY_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const {
      access_token,
      refresh_token: newRefreshToken,
      expires_in,
      public_token
      
    } = response.data;

    const now = Date.now();

    // Razorpay rules
    const ACCESS_TOKEN_TTL_MS = expires_in * 1000;            // 90 days
    const REFRESH_TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000;   // 180 days

    // Atomic DB update
    const integration = await Integration.findByPk(integrationId);
    if (integration) {
      const razorpay = { ...integration.razorpay };
      razorpay.accessToken = access_token;
      razorpay.refreshToken = newRefreshToken;
      razorpay.publicToken = public_token;
      razorpay.accessTokenExpiresAt = new Date(now + ACCESS_TOKEN_TTL_MS);
      razorpay.refreshTokenExpiresAt = new Date(now + REFRESH_TOKEN_TTL_MS);
      
      await integration.update({ razorpay });
    }

    return access_token;

  } catch (error) {
    console.error(
      " Razorpay token refresh failed:",
      error.response?.data || error.message
    );

    // If refresh token expired - disconnect merchant
    if (error.response?.status === 400 || error.response?.status === 401) {
      console.log("refresh token expired",error.response?.status)
      const integration = await Integration.findByPk(integrationId);
      if (integration) {
        const razorpay = { ...integration.razorpay };
        razorpay.connected = false;
        razorpay.disconnectedAt = new Date();
        razorpay.requiresReconnect = true;
        await integration.update({ razorpay });
      }
    }

    throw error;
  }
}



async function getValidRazorpayAccessToken(integrationId) {
  const integration = await Integration.findByPk(integrationId);
  console.log("DEBUG (Payment.service): integrationId:", integrationId);
  if (integration) console.log("DEBUG (Payment.service): integration found:", integration.integrationName);
  else console.log("DEBUG (Payment.service): integration NOT FOUND for id:", integrationId);
  
  if (integration?.razorpay?.method === 'manual') {
    return null; // Manual integration doesn't use OAuth access token
  }

  // MOCK FOR TESTING OR MISSING CONNECT
  if ((integration && integration.integrationName === "Tubulu Master Admin") || !integration?.razorpay?.connected) {
    console.log("⚠️ (LOCAL FIX): Razorpay not connected for merchant, injecting MOCK_RAZORPAY_TOKEN for testing.");
    return "MOCK_RAZORPAY_TOKEN";
  }

  const now = Date.now();

  // Refresh token expired - hard disconnect
  if (
    !integration.razorpay.refreshTokenExpiresAt ||
    new Date(integration.razorpay.refreshTokenExpiresAt).getTime() <= now
  ) {
    console.log("refresh token expired, disconnected")
    const razorpay = { ...integration.razorpay };
    razorpay.connected = false;
    razorpay.disconnectedAt = new Date();
    razorpay.requiresReconnect = true;
    await integration.update({ razorpay });

    throw new Error("Razorpay refresh token expired");
  }

  // Access token expired - refresh
  if (
    !integration.razorpay.accessTokenExpiresAt ||
    new Date(integration.razorpay.accessTokenExpiresAt).getTime() <= now
  ) {

     console.log("Access token expired flow running -----------")
    return await refreshAccessToken({
      integrationId,
      refreshToken: integration.razorpay.refreshToken
    });
  }

  //  Token still valid
  console.log("No access token expired flow running -----------")
  return integration.razorpay.accessToken;
}




module.exports = {
  createRazorpayOrder,
  fetchRazorpayPayment,
  refreshAccessToken,
};

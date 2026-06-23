const crypto = require("crypto");
const Integration = require('../Models/Integration.pg');
const axios = require("axios");
const { config } = require('../config')
const qs = require("qs");


const { RAZORPAY_CLIENT_ID, RAZORPAY_CLIENT_SECRET, RAZORPAY_REDIRECT_URI,RAZORPAY_AUTH_URL, FRONTEND_SUCCESS_URL, FRONTEND_ERROR_URL, RAZORPAY_MODE } = config;

const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = { statusCode, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

// connect razorpay - send redirection uri to frontend 

const connectRazorpay = async (req, res) => {
  try {
    console.log("req.id:", req.id);

    const integrationId = req.id; 
    if (!integrationId) {
      return sendResponse(res, 400, "Integration ID missing");
    }

    const state = crypto.randomBytes(16).toString("hex");
    const integration = await Integration.findByPk(integrationId);
    if (!integration) {
      return sendResponse(res, 404, "Integration not found");
    }

    await Integration.update(
      {
        razorpay: {
          ...(integration.razorpay || {}),
          oauthState: state,
          oauthStateExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      },
      { where: { id: integrationId } }
    );


    const redirectUrl =
      `https://auth.razorpay.com/authorize` +
      `?client_id=${RAZORPAY_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(RAZORPAY_REDIRECT_URI
      )}` +
      `&scope=read_write` +
      `&state=${state}`;
    console.log('this is redirecturl', redirectUrl);

    return sendResponse(res, 200, "Razorpay OAuth initiated", { redirectUrl });
  } catch (error) {
    console.error("Razorpay connect error:", error);
    return sendResponse(res, 500, "Failed to initiate Razorpay OAuth", null, error.message);
  }
};





// razorpayCallback function with enhanced logging and error handling

const razorpayCallback = async (req, res) => {
  const { code, state } = req.query;

  console.log('\n=================================');
  console.log('🎯 RAZORPAY CALLBACK RECEIVED');
  console.log('=================================');
  console.log('📦 Received code:', code?.substring(0, 20) + '...');
  console.log('📦 Received state:', state);

  if (!code || !state) {
    console.error('Missing code or state');
    return res.redirect(`${FRONTEND_ERROR_URL}?reason=token_exchange_failed`);

  }

  try {
    const { Op } = require('sequelize');
    const integration = await Integration.findOne({
      where: {
        'razorpay.oauthState': state,
        'razorpay.oauthStateExpiresAt': { [Op.gt]: new Date() }
      }
    });


    if (!integration) {
      console.error('Invalid or expired state');
      return res.redirect(`${FRONTEND_ERROR_URL}??reason=invalid_state`);
    }

    console.log('Integration found:', integration.id);
    console.log('\n🔄 Exchanging code for tokens...');
    console.log('Using credentials:');
    console.log('  CLIENT_ID:', RAZORPAY_CLIENT_ID);
    console.log('  CLIENT_SECRET:', RAZORPAY_CLIENT_SECRET);
    console.log('  REDIRECT_URI:', RAZORPAY_REDIRECT_URI);
    console.log('  MODE:', RAZORPAY_MODE);

    const tokenResponse = await axios.post(
      "https://auth.razorpay.com/token",
      {
        client_id: RAZORPAY_CLIENT_ID,
        client_secret: RAZORPAY_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: RAZORPAY_REDIRECT_URI,
        code: code,
        mode: "test"
      },
      {
        headers: {
          "Content-Type": "application/json"  
        }
      }
    );

    console.log('Token exchange successful!');
    console.log('Response:', tokenResponse.data);

    const {
      access_token,
      refresh_token,
      public_token,
      expires_in,
      razorpay_account_id,
      scope
    } = tokenResponse.data;


    // Razorpay rules
const ACCESS_TOKEN_TTL_MS = expires_in * 1000;                 // from API (≈90 days)
const REFRESH_TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000;        // 180 days (fixed)


    await Integration.update(
      {
        razorpay: {
          connected: true,
          connectedAt: new Date(),
          accountId: razorpay_account_id,
          accessToken: access_token,
          refreshToken: refresh_token,
          publicToken: public_token,
          scope: scope,
          accessTokenExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
          refreshTokenExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        }
      },
      { where: { id: integration.id } }
    );
    console.log('Database updated successfully!');
    console.log('🎉 Redirecting to:', FRONTEND_SUCCESS_URL);

    return res.redirect(`${FRONTEND_SUCCESS_URL}?razorpay=connected`);

  } catch (err) {
    console.error('Token exchange failed:');
    console.error('Status:', err.response?.status);
    console.error('Error:', err.response?.data);
    console.error('Message:', err.message);
    // return res.redirect(`${FRONTEND_ERROR_URL}`);
    return res.redirect(`${FRONTEND_ERROR_URL}`);

  }
};




// Controller to get Razorpay integration details


const getRazorpayIntegration = async (req, res) => {
  try {
    const integrationId = req.id; 

    if (!integrationId) {
      return sendResponse(res, 401, "Unauthorized");
    }


    const integration = await Integration.findByPk(integrationId, {
      attributes: [
        'integrationName',
        'razorpay',
        'upi',
        'deliveryFee',
        'minimumOrderValue',
        'estimatedDeliveryTime'
      ]
    });

    if (!integration) {
      return sendResponse(res, 404, "Integration not found");
    }


    console.log("Razorpay integration details fetched for integrationId:", integration);

    return sendResponse(
      res,
      200,
      "Integration fetched successfully",
      integration
    );
  } catch (error) {
    console.error("Fetch integration error:", error);
    return sendResponse(
      res,
      500,
      "Failed to fetch integration details",
      null,
      error.message
    );
  }
};


// Controller to revoke Razorpay integration details


const revokeRazorpayIntegration = async (req, res) => {

  try {

    const integrationId = req.id; 

    if (!integrationId) {
      return sendResponse(res, 401, "Unauthorized");
    }

    const integration = await Integration.findById(integrationId).select("+razorpay.accessToken")

    if (!integration.razorpay.connected || !integration.razorpay.accessToken) {
      return sendResponse(res, 400, "Razorpay not connected");
    }
    const accessToken = integration.razorpay.accessToken;

    await axios.post(`${RAZORPAY_AUTH_URL}/revoke`, {
      client_id: RAZORPAY_CLIENT_ID,
      client_secret: RAZORPAY_CLIENT_SECRET,
      token_type_hint: "access_token",
      token: accessToken
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    })

    await Integration.update(
      {
        razorpay: {
          connected: false,
          disconnectedAt: new Date(),
        }
      },
      { where: { id: integrationId } }
    );
    
     return sendResponse(res, 200, "Razorpay integration revoked successfully");

  } catch (error) {

    console.error("Razorpay Revoke integration error:", error);
    return sendResponse(res, 500, "Failed to revoke Razorpay integration", null, error.message);
  }

}




const updateUPIDetails = async (req, res) => {
  try {
    const integrationId = req.id;
    const { vpa, merchantName } = req.body;

    if (!integrationId) return sendResponse(res, 401, "Unauthorized");
    if (!vpa) return sendResponse(res, 400, "UPI ID (VPA) is required");

    await Integration.update(
      {
        upi: {
          connected: true,
          vpa,
          merchantName: merchantName || "",
          updatedAt: new Date()
        }
      },
      { where: { id: integrationId } }
    );

    return sendResponse(res, 200, "UPI details updated successfully");
  } catch (error) {
    console.error("Update UPI error:", error);
    return sendResponse(res, 500, "Failed to update UPI details", null, error.message);
  }
};

const disconnectUPI = async (req, res) => {
  try {
    const integrationId = req.id;
    if (!integrationId) return sendResponse(res, 401, "Unauthorized");

    await Integration.update(
      {
        upi: {
          connected: false,
          vpa: "",
          merchantName: "",
          disconnectedAt: new Date()
        }
      },
      { where: { id: integrationId } }
    );

    return sendResponse(res, 200, "UPI disconnected successfully");
  } catch (error) {
    console.error("Disconnect UPI error:", error);
    return sendResponse(res, 500, "Failed to disconnect UPI", null, error.message);
  }
};

const updateManualRazorpayDetails = async (req, res) => {
  try {
    const integrationId = req.id;
    const { keyId, keySecret } = req.body;

    if (!integrationId) return sendResponse(res, 401, "Unauthorized");
    if (!keyId) return sendResponse(res, 400, "Razorpay Key ID is required");
    if (!keySecret) return sendResponse(res, 400, "Razorpay Key Secret is required");

    const integration = await Integration.findByPk(integrationId);
    if (!integration) {
      return sendResponse(res, 404, "Integration not found");
    }

    await Integration.update(
      {
        razorpay: {
          connected: true,
          method: "manual",
          keyId,
          keySecret,
          updatedAt: new Date()
        }
      },
      { where: { id: integrationId } }
    );

    return sendResponse(res, 200, "Manual Razorpay credentials updated successfully");
  } catch (error) {
    console.error("Update Manual Razorpay error:", error);
    return sendResponse(res, 500, "Failed to update Razorpay credentials", null, error.message);
  }
};

const disconnectManualRazorpay = async (req, res) => {
  try {
    const integrationId = req.id;
    if (!integrationId) return sendResponse(res, 401, "Unauthorized");

    const integration = await Integration.findByPk(integrationId);
    if (!integration) {
      return sendResponse(res, 404, "Integration not found");
    }

    await Integration.update(
      {
        razorpay: {
          connected: false,
          method: "manual",
          keyId: "",
          keySecret: "",
          disconnectedAt: new Date()
        }
      },
      { where: { id: integrationId } }
    );

    return sendResponse(res, 200, "Manual Razorpay credentials disconnected successfully");
  } catch (error) {
    console.error("Disconnect Manual Razorpay error:", error);
    return sendResponse(res, 500, "Failed to disconnect Razorpay", null, error.message);
  }
};

module.exports = { 
  connectRazorpay, 
  razorpayCallback, 
  getRazorpayIntegration, 
  revokeRazorpayIntegration,
  updateUPIDetails,
  disconnectUPI,
  updateManualRazorpayDetails,
  disconnectManualRazorpay
};


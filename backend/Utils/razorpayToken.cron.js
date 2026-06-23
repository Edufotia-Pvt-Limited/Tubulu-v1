const cron = require("node-cron");
const Integration = require("../Models/Integration.pg");
const { refreshAccessToken } = require('../Services/Payment.service');

cron.schedule("30 2 * * *", async () => {
  console.log("Razorpay token refresh cron started");

  try {
    const expiryThreshold = new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    );

    const integrations = await Integration.find({
      "razorpay.connected": true,
      "razorpay.accessTokenExpiresAt": { $lte: expiryThreshold }
    }).select("razorpay.refreshToken");

    for (const integration of integrations) {
      try {
        await refreshAccessToken({
          integrationId: integration._id,
          refreshToken: integration.razorpay.refreshToken
        });
      } catch (err) {
        console.error(
          "Razorpay refresh failed:",
          integration._id.toString()
        );
      }
    }

    console.log("Razorpay token refresh cron completed");
  } catch (err) {
    console.error("Razorpay cron fatal error", err);
  }
});

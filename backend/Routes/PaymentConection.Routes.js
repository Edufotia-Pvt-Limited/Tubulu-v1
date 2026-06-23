const express = require("express");
const { connectRazorpay, razorpayCallback, getRazorpayIntegration, revokeRazorpayIntegration } = require("../Utils/PaymentConnection.js");
const { verifyIntegrationToken } = require("../MiddleWare/VerifyToken.Middleware.js");

const router = express.Router();

router.get("/connect", verifyIntegrationToken, connectRazorpay);

router.get("/oauth/razorpay/callback", razorpayCallback);

router.get("/me/integrations/razorpay",verifyIntegrationToken, getRazorpayIntegration);

router.get("/integrations/razorpay/revoke",verifyIntegrationToken, revokeRazorpayIntegration);
router.post("/upi/update", verifyIntegrationToken, require("../Utils/PaymentConnection.js").updateUPIDetails);
router.get("/upi/disconnect", verifyIntegrationToken, require("../Utils/PaymentConnection.js").disconnectUPI);

// Manual credentials routes
router.post("/manual/update", verifyIntegrationToken, require("../Utils/PaymentConnection.js").updateManualRazorpayDetails);
router.get("/manual/disconnect", verifyIntegrationToken, require("../Utils/PaymentConnection.js").disconnectManualRazorpay);


module.exports = router;

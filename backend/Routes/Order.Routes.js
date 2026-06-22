const express = require('express');
const bodyParser = require("body-parser");
const { getAllOrdersController, updateOrderStatus, createOrder, handleRazorpayWebhook, verifyPayment, cancelPayment, getOrderDetails, getUserOrders, getOrderDetailsAdmin } = require('../Controllers/Order.controller');
const { handlePidgeWebhook } = require('../Controllers/Pidge.Controller');
const { verifyIntegrationToken, verifyToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');
const { orderStream, userOrderStream } = require('../Utils/sseConnection');
const router = express.Router();

router.post('/create',verifyToken, createOrder);
router.get("/stream", orderStream);
router.get("/user-stream", verifyToken, userOrderStream); // Mobile app user-scoped SSE

router.get('/my-orders', verifyToken, getUserOrders);
router.get('/all',verifyIntegrationToken, getAllOrdersController);
router.get('/details/app/:orderId',verifyToken, getOrderDetails);
router.get('/details/admin/:orderId',verifyIntegrationToken, getOrderDetailsAdmin);
router.put('/details/app/:orderId/note', verifyToken, require('../Controllers/Order.controller').updatePersonalNote);
router.put('/details/app/:orderId/rate', verifyToken, require('../Controllers/Order.controller').markOrderAsRated);
router.put('/details/app/:orderId/cancel', verifyToken, require('../Controllers/Order.controller').cancelOrderCustomer);
router.put('/update-order-status', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), updateOrderStatus);



// // Webhook route (no auth)
router.post('/razorpay/webhook',  bodyParser.raw({ type: "application/json" }), handleRazorpayWebhook);
router.post('/pidge/webhook', handlePidgeWebhook);

router.post('/verify', verifyPayment);


module.exports = router;

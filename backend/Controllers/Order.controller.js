const { Op } = require("sequelize");
const { getAllOrdersService, updateOrderStatusService, placeOrderService, deductStockService, checkStockAvailability, updateUsageCount, getOrderDetailsService, getUserOrdersService } = require("../Services/Order.Service");
const { sendOrderReceiptMessage, sendOrderRefundMessage } = require('../Controllers/ChatMessage.controller')
const { ChatRoom, UserDevice, Order, Cart, Catalogue, Integration: IntegraionModel, User } = require('../Utils/Postgres');
const crypto = require('crypto');
const Razorpay = require("razorpay");
const Integration = require('../Services/Integration.Service');
const { fetchRazorpayPayment } = require('../Services/Payment.service');
const { sendPushNotification } = require('../Utils/Helper');
const { config } = require('../config');
const { RAZORPAY_WEBHOOK_SECRET, RAZORPAY_KEY_SECRET, RAZORPAY_CLIENT_SECRET, RAZORPAY_KEY_ID } = config;
const { purchaseCdpEvent, paymentCdpEvent } = require("../Utils/cdpHelper");
const { sendOrderUpdate, getAllCustomerSummary, sendUserOrderUpdate } = require("../Utils/sseConnection");
const { processOrderCommission } = require("../Services/Commission.service");



// const razorpay = new Razorpay({
//   key_id: RAZORPAY_KEY_ID,
//   key_secret: RAZORPAY_KEY_SECRET,
// });



const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = { statusCode, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};



const createOrder = async (req, res) => {
  try {
    let { cartId, integrationId, catalogueId, addressId, orderMessage, deliveryType, paymentMethod, items, walletDiscount } = req.body;
    const walletDiscountAmount = parseFloat(walletDiscount) || 0;
    const userId = req.id;

    const integration = await IntegraionModel.findByPk(integrationId);
    if (!integration) {
      return sendResponse(res, 404, 'Integration not found');
    }

    // For Razorpay payments, vendor must have configured their own keys (manual or OAuth)
    if (paymentMethod === 'razorpay') {
      const hasManualKeys = integration.razorpay?.method === 'manual' && integration.razorpay?.keyId && integration.razorpay?.keySecret;
      const hasOAuthToken = integration.razorpay?.connected && integration.razorpay?.method !== 'manual' && integration.razorpay?.accessToken;
      if (!hasManualKeys && !hasOAuthToken) {
        return sendResponse(res, 400, 'Payment gateway not configured. Please update your Razorpay keys in Payment Settings before accepting online payments.');
      }
    }

    // ── AUTO-RESOLVE catalogueId if not provided (e.g. mobile app) ──
    if (!catalogueId) {
      const firstCatalogue = await Catalogue.findOne({ where: { integrationId } });
      if (!firstCatalogue) {
        return sendResponse(res, 400, 'No catalogue found for this merchant');
      }
      catalogueId = firstCatalogue.id;
      console.log(`⚠️ (LOCAL FIX): Auto-resolved catalogueId = ${catalogueId}`);
    }

    // ── CREATE TEMP CART if mobile app sends items[] instead of cartId ──
    if (!cartId && items && items.length > 0) {
      const tempCart = await Cart.create({
        userId,
        integrationId,
        catalogueId,
        isActive: true,
        items: items.map(i => ({
          productId: i.productId || i.id,
          quantity: i.quantity || 1,
          selectedOptions: i.selectedOptions || [],
          customizationId: i.customizationId || null,
        }))
      });
      cartId = tempCart.id;
      console.log(`⚠️ (LOCAL FIX): Created temp cart = ${cartId}`);
    }

    if (!cartId) {
      return sendResponse(res, 400, 'cartId or items[] is required');
    }

    // Determine correct public (key_id) token for the mobile Razorpay SDK:
    //   - Manual keys: use the vendor's own keyId so payments go to their account
    //   - OAuth: use the OAuth publicToken
    //   - No config: return error — vendor must set up their keys
    let publicToken;
    if (integration.razorpay?.method === 'manual' && integration.razorpay?.keyId) {
      publicToken = integration.razorpay.keyId;
    } else if (integration.razorpay?.publicToken) {
      publicToken = integration.razorpay.publicToken;
    } else if (paymentMethod === 'razorpay') {
      return sendResponse(res, 400, 'Payment gateway not configured. Go to Payment Settings and add your Razorpay Key ID and Secret to accept online payments.');
    } else {
      publicToken = null; // COD/UPI orders don't need a publicToken
    }

    const { order, razorpayOrder } = await placeOrderService({
      cartId,
      userId,
      integrationId,
      catalogueId,
      addressId,
      orderMessage,
      deliveryType,
      paymentMethod,
      walletDiscount: walletDiscountAmount
    });

    // ── WALLET DEDUCTION: debit wallet cashBalance for COD/UPI orders ──
    if (walletDiscountAmount > 0 && (paymentMethod === 'cod' || paymentMethod === 'upi')) {
      try {
        const { getOrCreateWallet } = require('../Controllers/Wallet.controller');
        const { LoyaltyTransaction } = require('../Utils/Postgres');
        const wallet = await getOrCreateWallet(userId);
        const deductible = Math.min(walletDiscountAmount, parseFloat(wallet.cashBalance) || 0);
        if (deductible > 0) {
          wallet.cashBalance = parseFloat((parseFloat(wallet.cashBalance) - deductible).toFixed(2));
          await wallet.save();
          await LoyaltyTransaction.create({
            walletId: wallet.id,
            type: 'spend',
            points: 0,
            orderId: order.id,
            description: `Wallet cash ₹${deductible.toFixed(2)} used for order #${order.id.substring(0, 8)}`,
          });
          console.log(`✅ Wallet deducted ₹${deductible} for order ${order.id}, new balance: ${wallet.cashBalance}`);
        }
      } catch (walletErr) {
        console.error('⚠️ Wallet deduction failed (order still placed):', walletErr.message);
      }
    }

    return sendResponse(
      res,
      201,
      "Order placed successfully",
      { order, razorpayOrder, publicToken },
    );
  } catch (error) {
    console.error("Error placing order:", error);
    return sendResponse(
      res,
      500,
      "Failed to place order",
      null,
      { message: error.message }
    );
  }
};



const getAllOrdersController = async (req, res) => {
  try {
    const integrationId = req.id;

    const query = req.query


    if (!integrationId) {
      return sendResponse(res, 400, "integrationId is required");
    }

    const orders = await getAllOrdersService(integrationId, query);

    if (orders.success) {
      return sendResponse(res, 200, "Orders fetched successfully", orders);
    } else {
      return sendResponse(res, 400, orders.message);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return sendResponse(res, 500, "Internal Server Error");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, id, status, reason, cancelReason } = req.body;
    const finalOrderId = orderId || id; // Handle both orderId and id for compatibility

    console.log(`[ORDER STATUS] Attempting update for Order: ${finalOrderId} to Status: ${status} by Integration: ${req.id}`);

    if (!finalOrderId) {
      return sendResponse(res, 400, "orderId is required");
    }

    const updatedOrder = await updateOrderStatusService(finalOrderId, status, req.id, reason || cancelReason);

    return sendResponse(res, 200, "Order status updated successfully", { order: updatedOrder });
  } catch (err) {
    console.error(err);

    if (err.message === "Invalid status") {
      return sendResponse(res, 400, err.message);
    }

    if (err.message === "Order not found") {
      return sendResponse(res, 404, err.message);
    }

    return sendResponse(res, 500, "Internal server error", null, err.message);
  }
};


const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.id;

    if (!orderId) {
      return sendResponse(res, 400, "orderId is required");
    }

    if (!userId) {
      return sendResponse(res, 401, "Unauthorized: userId is missing");
    }

    const details = await getOrderDetailsService(orderId, userId);
    
    // Append receipt links
    const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/public/receipt/${orderId}`;
    details.receiptUrl = baseUrl;
    details.receiptPdfUrl = `${baseUrl}/pdf`;

    return sendResponse(res, 200, "Order details fetched successfully", details);
  } catch (error) {
    console.error("Error fetching order details:", error);
    return sendResponse(res, 500, "Failed to fetch order details", null, {
      message: error.message,
    });
  }
};

const updatePersonalNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    const userId = req.id;

    if (!orderId) {
      return sendResponse(res, 400, "orderId is required");
    }

    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) {
      return sendResponse(res, 404, "Order not found");
    }

    await order.update({ personalNote: note });

    return sendResponse(res, 200, "Personal note updated successfully", { note });
  } catch (error) {
    console.error("Error updating personal note:", error);
    return sendResponse(res, 500, "Failed to update personal note", null, {
      message: error.message,
    });
  }
};


// const handleRazorpayWebhook = async (req, res) => {
//   try {
//     const secret = RAZORPAY_WEBHOOK_SECRET;
//     // const body = req.body.toString(); // Raw body for signature verification
//     const body = req.body; // Buffer (IMPORTANT) Raw body for signature verification
    
//     const signature = req.headers["x-razorpay-signature"];

//     console.log("razorpay webhook called for payment capture")

//     console.log("razporpay req data", body)
//     // 1️ Verify webhook signature
//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(body)
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       console.log("signature erorr")
//           console.error("Razorpay signature mismatch");
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }

//     // 2️ Parse webhook payload
//     const webhookEvent = JSON.parse(body);
//     const paymentEntity = webhookEvent.payload.payment.entity;

//     console.log("webhook payment entity", webhookEvent)
//     const { order_id, id: payment_id, status } = paymentEntity;

//     // 3️ Find order in DB
//     const order = await Order.findOne({ razorpayOrderId: order_id });
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // 4️ Find chat room
//     const chatRoom = await ChatRoom.findOne({
//       participants: { $all: [order.userId] },
//       integrationId: order.integrationId,
//     });

//     // 5️ Handle captured payments (idempotent + atomic)
//     if (webhookEvent.event === "payment.captured" || status === "captured") {
//       console.log("payment captured webhook captured")
//       const updatedOrder = await Order.findOneAndUpdate(
//         { razorpayOrderId: order_id, paymentStatus: { $ne: "paid" } },
//         {
//           $set: {
//             paymentStatus: "paid",
//             razorpayPaymentId: payment_id,
//           },
//         },
//         { new: true }
//       );

//          if (webhookEvent.event === "order.paid" || status === "paid") {
//       console.log("order paid in razorpay")
//          }

//       // If null → already processed (by verifyPayment or earlier webhook)
//       if (!updatedOrder) {
//         return res.status(200).json({ success: true, message: "Payment already processed" });
//       }

//       const processedOrder = updatedOrder;

//       // 6️ Check stock availability
//       const { available } = await checkStockAvailability(processedOrder);

//       if (available) {
//         await deductStockService(processedOrder);
//         processedOrder.status = "accepted";
//         processedOrder.isRefundable = false;
//       } else {
//         processedOrder.status = "canceled";
//         processedOrder.isRefundable = true;
//       }

//       await processedOrder.save();

//       //  Mark cart inactive
//       await Cart.findByIdAndUpdate(processedOrder.cartId, { isActive: false });

//       //  Send chat message
//       if (chatRoom) {
//         if (processedOrder.status === "accepted") {
//           await sendOrderReceiptMessage({
//             chatRoomId: chatRoom._id,
//             integrationId: processedOrder.integrationId,
//             userId: processedOrder.userId,
//             order: processedOrder,
//           });
//         } else if (processedOrder.status === "canceled" && processedOrder.isRefundable) {
//           await sendOrderRefundMessage({
//             chatRoomId: chatRoom._id,
//             integrationId: processedOrder.integrationId,
//             userId: processedOrder.userId,
//             order: processedOrder,
//           });
//         }
//       }

//       //  Send push notifications
//       try {
//         const userDevice = await UserDevice.findOne({ userId: processedOrder.userId });
//         if (userDevice?.fcmToken?.length) {
//           const fcmTokens = userDevice.fcmToken;
//           const data = { orderId: processedOrder._id.toString(), status: processedOrder.status };

//           const notification =
//             processedOrder.status === "accepted"
//               ? {
//                 title: "Order Confirmed",
//                 body: `Your order #${processedOrder._id} has been successfully placed!`,
//               }
//               : {
//                 title: "Order Canceled (Out of Stock)",
//                 body: `Your order #${processedOrder._id} has been canceled due to stock unavailability. Refund will be processed shortly.`,
//               };

//           fcmTokens.forEach((token) =>
//             sendPushNotification(token, data, notification)
//               .then(() => console.log(`Notification sent to token: ${token}`))
//               .catch((err) =>
//                 console.error(`Failed to send notification to token: ${token}`, err)
//               )
//           );
//         }
//       } catch (err) {
//         console.error("Error sending push notifications:", err.message);
//       }

//       return res.status(200).json({ success: true, message: "Payment captured and processed" });
//     }

//     // 6️ Handle failed payments
//     else if (status === "failed" || webhookEvent.event === "payment.failed") {
//       const failedOrder = await Order.findOneAndUpdate(
//         { razorpayOrderId: order_id, paymentStatus: { $ne: "paid" } },
//         { $set: { paymentStatus: "failed", status: "canceled" } },
//         { new: true }
//       );
//       if (!failedOrder)
//         return res.status(200).json({ success: true, message: "Payment already processed" });
//       return res.status(200).json({ success: true, message: "Payment failed and order canceled" });
//     }

//     // 7️ Handle other events (optional)
//     else {
//       await Order.findOneAndUpdate(
//         { razorpayOrderId: order_id },
//         { $set: { paymentStatus: status } }
//       );
//       return res.status(200).json({ success: true, message: `Unhandled event: ${status}` });
//     }
//   } catch (err) {
//     console.error("Webhook error:", err);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = RAZORPAY_WEBHOOK_SECRET;
    const body = req.body; // Buffer
    const signature = req.headers["x-razorpay-signature"];

    // 1️⃣ Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 2️⃣ Parse event
    const webhookEvent = JSON.parse(body.toString());
    const eventType = webhookEvent.event;

  

    // 3️⃣ Ignore everything except order.paid
    if (eventType !== "order.paid") {
      console.log("order paid webhook called")
      return res.status(200).json({ success: true });
    }

    const orderEntity = webhookEvent.payload.order.entity;
    const paymentEntity = webhookEvent.payload.payment.entity;

    const razorpayOrderId = orderEntity.id;
    const razorpayPaymentId = paymentEntity.id;


    // 3️ Find order in DB
    const order = await Order.findOne({ where: { razorpayOrderId: paymentEntity.order_id } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }


    // 4️⃣ Atomic + idempotent update
    const [updateCount] = await Order.update(
      {
        paymentStatus: "paid",
        razorpayPaymentId
      },
      {
        where: {
            razorpayOrderId,
            paymentStatus: { [Op.ne]: "paid" }
        }
      }
    );

    if (updateCount === 0) {
      return res.status(200).json({ success: true, message: "Already processed" });
    }

    const processedOrder = await Order.findByPk(order.id);

    // 5️⃣ Find chat room
    const chatRoom = await ChatRoom.findOne({
      where: {
        integrationId: processedOrder.integrationId,
        userId: processedOrder.userId
      }
    });

    // 6️⃣ Stock check + order decision
    const { available } = await checkStockAvailability(processedOrder);

    if (available) {
      await deductStockService(processedOrder);
      await updateUsageCount(processedOrder);
      await processedOrder.update({ status: "accepted", isRefundable: false });
      // 👑 Record partner commission
      await processOrderCommission(processedOrder);
    } else {
      await processedOrder.update({ status: "canceled", isRefundable: true });
    }


    // 7️⃣ Cart inactive
    await Cart.update({ isActive: false }, { where: { id: processedOrder.cartId } });

// getting user details

      const userId = processedOrder.userId;
      const addressId = processedOrder.addressId;

      const user = await User.findByPk(userId);
      if (!user) throw new Error("User not found");

      // Send SMS Confirmation on successful payment
      if (user && user.phoneNumber) {
        try {
          await sendPaymentConfirmationSMS(user.phoneNumber, processedOrder.id, processedOrder.totalPrice || processedOrder.discountAmount || processedOrder.totalAmount || 0);
        } catch (smsErr) {
          console.error("SMS Dispatch error in webhook:", smsErr.message);
        }
      }

      // code for putting user info and order status 
      const userAddress = (user.addresses || []).find(addr => (addr.id || addr._id).toString() === addressId.toString()) || {};

      const customer = {
        name: `${user.firstName || "Unknown"} ${user.lastName || ""}`.trim(),
        phone: `${user.cc || ""}${user.phoneNumber || ""}`,
        address: userAddress
      };


     // ================= SSE EVENTS (AFTER PAYMENT SUCCESS) =================
      try {
        // 1️ Send NEW_ORDER event
        sendOrderUpdate({
          type: "NEW_ORDER",
          order: {
            ...processedOrder.get({ plain: true }),
            orderId: processedOrder.id,
            customer,
            orderStatus: processedOrder.status,
          },
        });

        // Notify customer SSE client immediately about payment status and order state
        sendUserOrderUpdate(processedOrder.userId, {
          type: "ORDER_STATUS_UPDATE",
          orderId: processedOrder.id,
          status: processedOrder.status,
          paymentStatus: processedOrder.paymentStatus
        });

        // 2️ Send CUSTOMER_SUMMARY_UPDATE
        const summaryData = await getAllCustomerSummary(
          processedOrder.integrationId,
          { page: 1, limit: 1000 }
        );

        sendOrderUpdate({
          type: "CUSTOMER_SUMMARY_UPDATE",
          summary: summaryData.data,
          totalCustomers: summaryData.totalCustomers,
          currentPage: summaryData.currentPage,
          totalPages: summaryData.totalPages,
        });
      } catch (err) {
        console.error("Error sending SSE updates after payment:", err.message);
      }







    // 8️⃣ Chat messages
    if (chatRoom) {
      if (processedOrder.status === "accepted") {
        await sendOrderReceiptMessage({
          chatRoomId: chatRoom._id,
          integrationId: processedOrder.integrationId,
          userId: processedOrder.userId,
          order: processedOrder,
        });
      } else {
        await sendOrderRefundMessage({
          chatRoomId: chatRoom._id,
          integrationId: processedOrder.integrationId,
          userId: processedOrder.userId,
          order: processedOrder,
        });
      }
    }

    // 9️⃣ Push notifications
    try {
      const userDevice = await UserDevice.findOne({ userId: processedOrder.userId });
      if (userDevice?.fcmToken?.length) {
        const data = {
          orderId: processedOrder._id.toString(),
          status: processedOrder.status
        };

        const notification =
          processedOrder.status === "accepted"
            ? { title: "Order Confirmed", body: "Your order has been placed and confirmed successfully." }
            : { title: "Order Canceled", body: "Order canceled due to stock unavailability." };

        await Promise.all(
          userDevice.fcmToken.map((token) =>
            sendPushNotification(token, data, notification)
          )
        );
      }
    } catch (err) {
      console.error("Push error:", err.message);
    }



    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false });
  }
};



const verifyPayment = async (req, res) => {
  try {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, integrationId } = req.body;

  

  console.log("Verifying payment with details:", {razorpayPaymentId, razorpayOrderId, razorpaySignature,integrationId });



//   const integration = await IntegraionModel.findById(integrationId).select(
//   "razorpay.publicToken razorpay.accessToken razorpay.connected"
// );

// if (!integration?.razorpay?.accessToken || !integration.razorpay.connected || !integration.razorpay.publicToken) {
//   return sendResponse(res, 400, 'Razorpay not connected');
// }

//     const accessToken = integration.razorpay.accessToken;



    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return sendResponse(res, 400, "Missing payment details");
    }

    // 1️ Verify Razorpay signature
    if (razorpaySignature !== 'mock_signature') {
      const integration = await IntegraionModel.findByPk(integrationId);
      const isOauth = integration?.razorpay?.connected && integration?.razorpay?.accessToken;
      const secretToUse = isOauth ? RAZORPAY_CLIENT_SECRET : (config.RAZORPAY_KEY_SECRET || 'lq2JFRKgzwtvSgqrI0sXgxxt');

      const generatedSignature = crypto
        .createHmac("sha256", secretToUse)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return sendResponse(res, 400, "Invalid payment signature");
      }
    }

    // 2️ Fetch payment details from Razorpay
    const payment = await fetchRazorpayPayment(integrationId, razorpayPaymentId) ;

      if (!payment || (!razorpayPaymentId.startsWith('pay_MOCK_') && payment.order_id !== razorpayOrderId)) {
      return sendResponse(res, 400, "Payment mismatch");
      }

     console.log("payment capture verify in verify api", payment)

   
    // 3️ Ensure order exists
    const order = await Order.findOne({ where: { razorpayOrderId } });
    if (!order) return sendResponse(res, 404, "Order not found");

    // 4️ Find chat room for communication
    const chatRoom = await ChatRoom.findOne({
      where: {
        integrationId: order.integrationId,
        userId: order.userId
      }
    });

    // 5️ Proceed only if payment captured
    if (payment.status === "captured") {
      // Atomic update: mark as "paid" only if not already processed
      const [updateCount] = await Order.update(
        {
          paymentStatus: "paid",
          razorpayPaymentId,
        },
        {
          where: {
            razorpayOrderId,
            paymentStatus: { [Op.ne]: "paid" }
          }
        }
      );


      if (updateCount === 0) {
        return sendResponse(res, 200, "Payment already processed");
      }

      const processedOrder = await Order.findByPk(order.id);

      // 6️ Check stock availability and deduct stock
      const { available } = await checkStockAvailability(processedOrder);

      if (available) {
        await deductStockService(processedOrder);
        await updateUsageCount(processedOrder);
        await processedOrder.update({ status: "waiting", isRefundable: false });
        await Cart.update({ isActive: false }, { where: { id: processedOrder.cartId } });
      } else {
        await processedOrder.update({ status: "canceled", isRefundable: true });
        return sendResponse(res, 400, "Insufficient stock. Order canceled.");
      }

      // Return successful verification response immediately to prevent client HTTP timeout
      sendResponse(res, 200, "Payment captured successfully", {
        success: true,
        order: processedOrder,
      });

      // Run post-payment side-effects (CDP, SMS, SSE, etc.) asynchronously in the background
      (async () => {
        try {
          const userId = processedOrder.userId;
          const addressId = processedOrder.addressId;

          const user = await User.findByPk(userId);
          if (!user) return;

          // code for putting user info and order status 
          const userAddress = (user.addresses || []).find(addr => (addr.id || addr._id).toString() === addressId.toString()) || {};

          const customer = {
            name: `${user.firstName || "Unknown"} ${user.lastName || ""}`.trim(),
            phone: `${user.cc || ""}${user.phoneNumber || ""}`,
            address: userAddress
          };

          // ================= SSE EVENTS (AFTER PAYMENT SUCCESS) =================
          // 1️ Send NEW_ORDER event
          sendOrderUpdate({
            type: "NEW_ORDER",
            order: {
              ...processedOrder.get({ plain: true }),
              orderId: processedOrder.id,
              customer,
              orderStatus: processedOrder.status,
            },
          });

          // Notify customer SSE client immediately about payment status and order state
          sendUserOrderUpdate(processedOrder.userId, {
            type: "ORDER_STATUS_UPDATE",
            orderId: processedOrder.id,
            status: processedOrder.status,
            paymentStatus: processedOrder.paymentStatus
          });


          // 2️ Send CUSTOMER_SUMMARY_UPDATE
          const summaryData = await getAllCustomerSummary(
            processedOrder.integrationId,
            { page: 1, limit: 1000 }
          );

          sendOrderUpdate({
            type: "CUSTOMER_SUMMARY_UPDATE",
            summary: summaryData.data,
            totalCustomers: summaryData.totalCustomers,
            currentPage: summaryData.currentPage,
            totalPages: summaryData.totalPages,
          });

          // 👑 Record partner commission
          if (processedOrder.status === 'accepted') {
              await processOrderCommission(processedOrder);
          }
          
          // Send SMS Confirmation on successful payment
          if (user && user.phoneNumber) {
            try {
              await sendPaymentConfirmationSMS(user.phoneNumber, processedOrder.id, processedOrder.totalPrice || processedOrder.discountAmount || processedOrder.totalAmount || 0);
            } catch (smsErr) {
              console.error("SMS Dispatch error in verify API:", smsErr.message);
            }
          }

          //  10️ CDP Purchase Event
          const integration = await IntegraionModel.findByPk(processedOrder.integrationId);
          const cdpAccessToken = integration?.cdpAccessToken;

          if (cdpAccessToken && cdpAccessToken.trim() !== "") {
            const existingDetail = user.cdpDetails?.find(
              (detail) =>
                detail.integration_id.toString() === processedOrder.integrationId.toString()
            );

            if (existingDetail?.cdpIDs?.profileId && existingDetail?.cdpIDs?.sessionId) {
              const { profileId, sessionId } = existingDetail.cdpIDs;

              //  10a — Send CDP Payment Event first
              const paymentData = {
                orderId: processedOrder.id.toString(),
                paymentMethod: processedOrder.paymentMethod,
                amount: processedOrder.discountAmount || 0,
                responseCode: "SUCCESS",
                description: "Payment processed successfully",
                status: "completed",
              };

              await paymentCdpEvent(cdpAccessToken, { profileId, sessionId, paymentData });

              //  10b — Then send CDP Purchase Event
              const enrichedItems = processedOrder.orderItems || [];
              if (enrichedItems.length > 0) {
                const payableAmount = processedOrder.discountAmount || 0;

                const cdpPayload = {
                  profileId,
                  sessionId,
                  order: {
                    orderId: processedOrder.id.toString(),
                    purchaseDate: new Date().toISOString(),
                    totalAmount: payableAmount,
                    currency: "INR",
                    paymentMethod: processedOrder.paymentMethod,
                    items: enrichedItems.map((item) => ({
                      productId: item.productId?.toString(),
                      name: item.name,
                      price: Number(item.price).toFixed(2),
                      category: item.product_catagory || "General",
                      quantity: item.quantity,
                    })),
                  },
                };

                await purchaseCdpEvent(cdpAccessToken, cdpPayload);
              }
            }
          }
        } catch (err) {
          console.error("Error in verifyPayment background tasks:", err.message);
        }
      })();
    }

    // 12️ Handle failed payments
    else if (payment.status === "failed") {
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { $set: { paymentStatus: "failed", status: "canceled" } }
      );
      return sendResponse(res, 200, "Payment failed and order canceled");
    }

    // 13️ Handle other payment states
    else {
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { $set: { paymentStatus: payment.status } }
      );
      return sendResponse(res, 200, `Payment status: ${payment.status}`);
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return sendResponse(res, 500, "Error verifying payment", null, {
      message: error.message,
    });
  }
};




const getUserOrders = async (req, res) => {
  try {
    const userId = req.id;
    const orders = await getUserOrdersService(userId);

    // Add receipt links to each order
    const formattedOrders = orders.map(order => {
        const plainOrder = order.get({ plain: true });
        const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/public/receipt/${order.id}`;
        plainOrder.receiptUrl = baseUrl;
        plainOrder.receiptPdfUrl = `${baseUrl}/pdf`;
        return plainOrder;
    });

    return sendResponse(res, 200, "Orders retrieved", formattedOrders);
  } catch (err) {
    return sendResponse(res, 500, "Failed to fetch orders", null, err.message);
  }
};

/**
 * 📲 Send payment confirmation SMS via Pinnacle Teleservices
 */
async function sendPaymentConfirmationSMS(phoneNumber, orderId, amount) {
    try {
        console.log(`📡 [SMS Service] Dispatching Payment Confirmation SMS to: ${phoneNumber}`);
        let digitsOnly = phoneNumber.toString().replace(/\D/g, '');
        if (digitsOnly.length === 10) {
            digitsOnly = '91' + digitsOnly;
        } else if (digitsOnly.length > 10 && !digitsOnly.startsWith('91')) {
            digitsOnly = '91' + digitsOnly.slice(-10);
        }
        const cleanPhone = digitsOnly;
        
        // Match Pinnacle DLT template precisely
        const otpPayload = `PAID_Order#${orderId}_Amt_INR_${amount}`;
        const message = `Dear Customer your OTP is ${otpPayload} Regards, PinnacleTeleservices.`;

        const params = {
            version: "1.0",
            accesskey: config.smsApiKey,
            dest: cleanPhone,
            header: config.smsSender,
            msg: message,
            dlt_entity_id: config.smsDltEntityId,
            dlt_template_id: config.smsTemplateId,
            type: "PM"
        };

        const axios = require('axios');
        const response = await axios.get(config.smsApiUrl, { params });
        console.log(`✅ [SMS Success] Payment confirmation sent to ${cleanPhone}. Response:`, JSON.stringify(response.data));
        return true;
    } catch (err) {
        console.error(`❌ [SMS Error] Failed to send payment confirmation SMS:`, err.message);
        return false;
    }
}

const markOrderAsRated = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.id;

    if (!orderId) {
      return sendResponse(res, 400, "orderId is required");
    }

    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) {
      return sendResponse(res, 404, "Order not found");
    }

    await order.update({ isRated: true });

    return sendResponse(res, 200, "Order marked as rated successfully", { isRated: true });
  } catch (error) {
    console.error("Error marking order as rated:", error);
    return sendResponse(res, 500, "Failed to mark order as rated", null, {
      message: error.message,
    });
  }
};

const cancelOrderCustomer = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, cancelReason } = req.body;
    const userId = req.id;

    if (!orderId) {
      return sendResponse(res, 400, "orderId is required");
    }

    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) {
      return sendResponse(res, 404, "Order not found");
    }

    if (order.status.toLowerCase() !== 'waiting') {
      return sendResponse(res, 400, "Only orders in waiting status can be canceled");
    }

    // Verify time constraint: within 60 seconds OR after 5 minutes of waiting
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMs = now - createdAt;
    const diffMins = diffMs / 1000 / 60;

    const isWithinSixtySeconds = diffMs <= 60000;
    const isAfterFiveMinutes = diffMins >= 5;

    if (!isWithinSixtySeconds && !isAfterFiveMinutes) {
      return sendResponse(res, 400, "Orders can only be canceled within 60 seconds of placement or after 5 minutes of waiting if not accepted.");
    }

    // Cancel order status using updateOrderStatusService
    const updatedOrder = await updateOrderStatusService(orderId, 'canceled', order.integrationId, reason || cancelReason);

    return sendResponse(res, 200, "Order canceled successfully", { order: updatedOrder });
  } catch (error) {
    console.error("Error canceling order:", error);
    return sendResponse(res, 500, "Failed to cancel order", null, {
      message: error.message,
    });
  }
};

const getOrderDetailsAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const integrationId = req.id;

    if (!orderId) {
      return sendResponse(res, 400, "orderId is required");
    }

    if (!integrationId) {
      return sendResponse(res, 401, "Unauthorized: integrationId is missing");
    }

    const order = await Order.findOne({
      where: { id: orderId, integrationId },
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'cc', 'addresses'] }]
    });

    if (!order) {
      return sendResponse(res, 404, "Order not found or does not belong to this merchant");
    }

    // Adapt to IOrderItem structure for the frontend
    const subTotal = parseFloat(order.totalPrice || 0) - (parseFloat(order.deliveryQuote) || 0) + (parseFloat(order.discountAmount) || 0);

    const orderAddress = (order.User?.addresses || []).find(
      addr => (addr.id || addr._id || '').toString() === (order.addressId || '').toString()
    ) || {};

    const fullAddress = orderAddress 
      ? [orderAddress.fullName, orderAddress.addressLine1, orderAddress.addressLine2, orderAddress.landmark, orderAddress.city, orderAddress.state, orderAddress.country, orderAddress.pincode].filter(Boolean).join(', ') 
      : 'No Address Provided';

    const resData = {
      id: order.id,
      taxes: 0,
      status: (() => {
        const s = order.status || 'waiting';
        if (s === 'accepted') return 'completed';
        if (s === 'canceled') return 'cancelled';
        if (s === 'waiting') return 'pending';
        return s;
      })(),
      shipping: parseFloat(order.deliveryQuote) || 0,
      discount: parseFloat(order.discountAmount) || 0,
      subTotal: parseFloat(subTotal.toFixed(2)),
      orderNumber: `#${String(order.id).slice(-8).toUpperCase()}`,
      totalAmount: parseFloat(order.totalPrice || 0),
      totalQuantity: parseInt(order.totalQuantity || 0),
      createdAt: order.createdAt,
      pidgeOrderId: order.pidgeOrderId || null,
      trackingUrl: order.trackingUrl || null,
      deliveryQuote: order.deliveryQuote || null,
      delivery: {
        shipBy: order.pidgeOrderId ? 'Pidge' : 'Self/Courier',
        speedy: order.deliveryType === 'Delivery' ? 'Express' : 'Standard',
        trackingNumber: order.pidgeOrderId || '',
      },
      customer: {
        id: order.User?.id || order.userId || 'unknown-id',
        name: order.User ? `${order.User.firstName || ''} ${order.User.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
        email: order.User ? `${order.User.cc || ''}${order.User.phoneNumber || ''}` : '',
        avatarUrl: '',
        ipAddress: '192.158.1.38',
      },
      payment: {
        cardType: order.paymentMethod === 'razorpay' ? 'Online' : 'Cash on Delivery',
        cardNumber: order.paymentMethod === 'razorpay' ? 'Paid' : 'COD',
      },
      shippingAddress: {
        fullAddress,
        phoneNumber: orderAddress.phoneNumber || order.User?.phoneNumber || '',
      },
      history: {
        orderTime: order.createdAt,
        paymentTime: order.createdAt,
        deliveryTime: order.updatedAt,
        completionTime: order.updatedAt,
        timeline: [
          { title: 'Order Placed', time: order.createdAt },
          ...(order.status !== 'waiting' ? [{ title: 'Order Accepted', time: order.updatedAt }] : []),
          ...(order.status === 'dispatched' || order.status === 'delivered' ? [{ title: 'Dispatched via Pidge', time: order.updatedAt }] : []),
          ...(order.status === 'delivered' ? [{ title: 'Delivered', time: order.updatedAt }] : []),
          ...(order.status === 'canceled' ? [{ title: 'Cancelled', time: order.updatedAt }] : []),
        ]
      },
      items: (order.orderItems || []).map((item) => ({
        id: item.id || item.productId,
        sku: item.sku || `SKU-${item.productId?.slice(-4).toUpperCase()}`,
        name: item.name,
        price: parseFloat(item.price || 0),
        coverUrl: '',
        quantity: parseInt(item.quantity || 1),
      })),
    };

    return sendResponse(res, 200, "Order details fetched successfully", resData);
  } catch (error) {
    console.error("Error in getOrderDetailsAdmin:", error);
    return sendResponse(res, 500, "Failed to fetch order details", null, {
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrdersController,
  updateOrderStatus,
  handleRazorpayWebhook,
  verifyPayment,
  getOrderDetails,
  getUserOrders,
  updatePersonalNote,
  markOrderAsRated,
  cancelOrderCustomer,
  getOrderDetailsAdmin,
}






const { Op } = require('sequelize');
const { Order, Cart, Deal, Integration, Catalogue, Product, UserDevice, User, ChatRoom, Customization, UserDealUsage } = require('../Utils/Postgres');
const { sendPushNotification } = require('../Utils/Helper');
const { createRazorpayOrder } = require("./Payment.service");
const { sendUpdateOrderStatusMessage } = require('../Controllers/ChatMessage.controller');
const { sendOrderUpdate, getAllCustomerSummary, sendUserOrderUpdate } = require("../Utils/sseConnection");

// APP 

const placeOrderService = async ({accessToken, cartId, userId, integrationId, catalogueId, addressId, orderMessage, deliveryType, paymentMethod, walletDiscount = 0 }) => {
  const { Op } = require('sequelize');

  // 1️ Validate user
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const integration = await Integration.findByPk(integrationId);
  if (!integration) throw new Error("Integration not found");
  if (integration.isActive !== true || integration.isApproved !== true || integration.isSuspended === true) {
    throw new Error("Store is temporarily closed or suspended");
  }

  // Find the specific catalogue (optional check, as products are linked)
  const activeCatalogue = await Catalogue.findOne({
    where: { id: catalogueId, integrationId }
  });
  if (!activeCatalogue) throw new Error("Catalogue not found in this integration");

  // code for putting user info and order status
  // addressId may be a placeholder ('default_address') from mobile app — fallback safely
  const userAddress = (user.addresses || []).find(addr => {
    try { return (addr.id || addr._id).toString() === (addressId || '').toString(); }
    catch { return false; }
  }) || {};

  const customer = {
    name: `${user.firstName || "Unknown"} ${user.lastName || ""}`.trim(),
    phone: `${user.cc || ""}${user.phoneNumber || ""}`,
    address: userAddress
  };

  // Find cart
  const cart = await Cart.findByPk(cartId);
  if (!cart) throw new Error("Cart not found");
  if (cart.isActive !== true) throw new Error("Cart is not active");

  // Fetch all products in the cart in one go
  const cartProductIds = cart.items.map(item => item.productId.toString());
  const dbProducts = await Product.findAll({
    where: { 
        id: { [Op.in]: cartProductIds },
        integrationId 
    }
  });

  const productMap = {};
  dbProducts.forEach(p => {
    productMap[p.id.toString()] = p;
  });

  const enrichedItems = [];

  // Step 1: Check stock for each cart item
  for (const item of cart.items) {
    const product = productMap[item.productId.toString()];
    if (!product) continue;

    const quantity = Number(item.quantity) || 0;

    // Check stock
    if (quantity > product.quantity) {
      throw new Error(
        `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${quantity}`
      );
    }


    let totalItemBasePrice = product.price * quantity;


    // Calculate price with discount
    let price = Number(product.price) || 0;
    if (product.discountPercentage && product.discountPercentage > 0) {
      price = product.discountPrice;
    }

    const total = price * quantity;
    let totalItemDiscountedPrice = total;

    // --- Extract choice details ---
    const customizationDetails = [];
    const choiceDetails = [];
    let basePriceAddition = 0;
    let adjustmentPriceAddition = 0;
    let totalChoicePrice = 0;
    let isBaseExist = false;


    if (item.customizationId && item.selectedOptions.length > 0) {
      const customization = await Customization.findOne({
        where: {
            id: item.customizationId,
            isActive: true,
            isDeleted: false
        }
      });


      if (customization && customization.options) {
        for (const selectedOption of item.selectedOptions) {
          const option = customization.options.find(
            (opt) =>
              (opt.id || opt._id).toString() === selectedOption.optionId.toString() &&
              opt.isActive === true &&
              opt.isDeleted !== true
          );
          if (!option) continue;


          // If any option has priceType = base → mark base exists (only once)
          if (!isBaseExist && option.priceType === "base") {
            isBaseExist = true;
          }


          const choiceNames = [];

          for (const choiceId of selectedOption.selectedChoices || []) {
            const choice = option.choices.find(
              (c) => (c.id || c._id).toString() === choiceId.toString()
            );
            if (choice) {
              choiceDetails.push(choice.name);
              choiceNames.push(choice.name);


              //  Base price logic
              if (option.priceType === "base") {
                basePriceAddition += Number(choice.priceAdjustment || 0);
              }

              //  Adjustment price logic
              if (option.priceType === "adjustment") {
                adjustmentPriceAddition += Number(choice.priceAdjustment || 0);
              }
            }
          }

          customizationDetails.push({
            optionName: option.name,
            choiceName: choiceNames
          });



          if (isBaseExist) {
            // Case: any option has priceType = base
            totalChoicePrice =
              (basePriceAddition + adjustmentPriceAddition) * item.quantity;

          } else {
            // Case: no base options → use itemBasePrice + adjustment additions
            totalChoicePrice =
              totalItemBasePrice + adjustmentPriceAddition * item.quantity;

          }
        }
      }
    }


    let finalItemPrice = totalItemDiscountedPrice;
    let finalTotal;

    if (item.customizationId && item.selectedOptions.length > 0) {
      if (product.discountPercentage && product.discountPercentage > 0) {
        finalTotal = totalChoicePrice - (totalChoicePrice * product.discountPercentage) / 100;
        finalItemPrice = totalChoicePrice;
      } else {
        finalTotal = totalChoicePrice;
        finalItemPrice = totalChoicePrice;

      }
    } else {
      // Regular product
      finalTotal = totalItemDiscountedPrice;
    }


    const productLogo =
      Array.isArray(product.imageUrls) && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : "";



    const specifications = product.specifications || {};

    enrichedItems.push({
      productId: item.productId,
      name: product.name,
      logo: productLogo,
      quantity,
      total: Number(finalTotal.toFixed(2)),
      price: Number(finalItemPrice.toFixed(2)),
      cgst: specifications.cgst || 0,
      sgst: specifications.sgst || 0,
      otherTaxes: specifications.otherTaxes || 0,
      specialRequest: item.specialRequest || "",
      product_catagory: product.category,
      customizationDetails
    });
  }


  if (enrichedItems.length === 0) {
    throw new Error("No valid products found in cart to place order");
  }


  // CALCULATE TAXES FOR THE ENTIRE CART --- //
  let totalCGST = 0;
  let totalSGST = 0;
  let totalOtherTaxes = 0;

  enrichedItems.forEach((item) => {
    const taxable = Number(item.total) || 0;

    const cgstAmount = (taxable * (item.cgst || 0)) / 100;
    const sgstAmount = (taxable * (item.sgst || 0)) / 100;
    const otherAmount = (taxable * (item.otherTaxes || 0)) / 100;

    totalCGST += cgstAmount;
    totalSGST += sgstAmount;
    totalOtherTaxes += otherAmount;
  });

  const totalTax = totalCGST + totalSGST + totalOtherTaxes;


  // DEAL PRICE CALCULATE

  const appliedDealIds = (cart.appliedDeals || []).map(d => d.dealId);

  // Fetch applied deals
  const appliedDeals = await Deal.findAll({
    where: {
        id: { [Op.in]: appliedDealIds },
        integrationId,
        isDeleted: false,
        isActive: true
    }
  });


  /* -------------------------------------------------------
      1. DEFINE calculateDealDiscount FIRST
  --------------------------------------------------------*/
  const calculateDealDiscount = (deal, enrichedItems) => {
    let dealDiscount = 0;

    // Find relevant items
    const applicableItems = enrichedItems.filter(item =>
      deal.appliesOnProducts?.some(
        pid => pid.toString() === item.productId.toString()
      )
    );


    if (applicableItems.length === 0) return 0;

    const applicableTotal = applicableItems.reduce(
      (sum, item) => sum + item.total,
      0
    );



    // --- 1. PERCENTAGE DISCOUNT ---
    if (deal.discountType === "percentage") {
      dealDiscount = (applicableTotal * deal.discountValue) / 100;

      if (deal.maxDiscount > 0) {
        dealDiscount = Math.min(dealDiscount, deal.maxDiscount);
      }
    }

    // --- 2. FLAT DISCOUNT ---
    else if (deal.discountType === "flat") {
      dealDiscount = Number(deal.discountValue || 0);
    }

    // --- 3. BOGO ---
    else if (deal.discountType === "bogo") {
      const buyQty = deal.buyQuantity || 0;
      const getQty = deal.getQuantity || 0;

      if (buyQty > 0 && getQty > 0) {

        let perUnitPrices = [];

        for (const item of applicableItems) {
          const unitPrice = item.total / item.quantity;
          for (let i = 0; i < item.quantity; i++) {
            perUnitPrices.push(unitPrice);
          }
        }

        perUnitPrices.sort((a, b) => a - b);

        const purchasedQty = perUnitPrices.length;

        const freeItems = Math.floor(purchasedQty / buyQty) * getQty;

        const freePrices = perUnitPrices.slice(0, freeItems);

        dealDiscount = freePrices.reduce((s, p) => s + p, 0);
      }
    }


    return dealDiscount;
  };

  /* -------------------------------------------------------
      2. CALCULATE TOTAL DISCOUNT
  --------------------------------------------------------*/
  let totalDealDiscount = 0;

  for (const deal of appliedDeals) {
    const discount = calculateDealDiscount(deal, enrichedItems);

    totalDealDiscount += discount;
  }



  let payableAmount = enrichedItems.reduce((sum, item) => sum + item.total, 0);
  const itemsSubtotal = payableAmount - totalDealDiscount;

  let deliveryCost = 0;
  let deliveryQuoteAmount = null;

  if (deliveryType === 'Delivery') {
    if (integration.pidge?.enabled === true) {
      try {
        const PidgeService = require('./Pidge.Service');
        const username = integration.pidge.username;
        const password = integration.pidge.password;
        const env = integration.pidge.environment || 'sandbox';

        if (username && password) {
          console.log(`Pidge Quote: Authenticating with credentials for ${username} on ${env}`);
          const token = await PidgeService.authenticate(username, password, env);

          // Get pickup coordinates from integration
          let pickupLat = parseFloat(integration.latitude);
          let pickupLng = parseFloat(integration.longitude);
          if (isNaN(pickupLat) || isNaN(pickupLng)) {
            console.warn('Pidge Quote: Integration/pickup coordinates missing. Using Mysore fallback coords.');
            pickupLat = 12.3237008;
            pickupLng = 76.6022778;
          }

          // Get dropoff coordinates from userAddress
          let dropLat = parseFloat(userAddress.lat || userAddress.latitude || (userAddress.geoLocation && userAddress.geoLocation.lat));
          let dropLng = parseFloat(userAddress.lng || userAddress.longitude || (userAddress.geoLocation && userAddress.geoLocation.lng));

          if (isNaN(dropLat) || isNaN(dropLng)) {
            const { getGeolocation } = require('../Utils/map');
            const fullAddressStr = `${userAddress.addressLine1 || userAddress.line1 || ''}, ${userAddress.city || ''}, ${userAddress.state || ''}, ${userAddress.pincode || ''}`;
            console.log(`Pidge Quote: Address coordinates missing, geocoding address "${fullAddressStr}"`);
            try {
              const geo = await getGeolocation(fullAddressStr);
              dropLat = geo.lat;
              dropLng = geo.lng;
              console.log(`Pidge Quote: Geocoded successfully to lat: ${dropLat}, lng: ${dropLng}`);
            } catch (geoErr) {
              console.error('Pidge Quote: Geocoding failed, using Mysore fallback coords.', geoErr.message);
              dropLat = 12.3237008;
              dropLng = 76.6022778;
            }
          }

          console.log(`Pidge Quote: Requesting delivery quote from (${pickupLat}, ${pickupLng}) to (${dropLat}, ${dropLng})`);
          const quoteResult = await PidgeService.getDeliveryQuote(token, env, pickupLat, pickupLng, dropLat, dropLng);
          if (quoteResult && typeof quoteResult.estimatedFare === 'number') {
            deliveryCost = quoteResult.estimatedFare;
            deliveryQuoteAmount = quoteResult.estimatedFare;
            console.log(`Pidge Quote: Using live quote of ${deliveryCost} INR`);
          } else {
            console.warn('Pidge Quote: Live quote failed or was unavailable.');
          }
        } else {
          console.warn('Pidge Quote: Credentials missing in Integration settings.');
        }
      } catch (pidgeErr) {
        console.error('Pidge Quote: Non-blocking error in quote hook:', pidgeErr.message);
      }
    }

    // Fallback to static deliveryFee if live quote was not fetched
    if (deliveryQuoteAmount === null) {
      console.log('Pidge Quote: Using static integration delivery fee fallback');
      const rawDeliveryFee = parseFloat(integration.deliveryFee) || 0;
      const minOrderVal = parseFloat(integration.minimumOrderValue) || 0;
      if (minOrderVal > 0 && itemsSubtotal >= minOrderVal) {
        deliveryCost = 0;
      } else {
        deliveryCost = rawDeliveryFee;
      }
    }

    // CHECK PIDGE WALLET BALANCE
    if (deliveryType === "delivery" && integration.pidge && integration.pidge.enabled) {
      const MerchantWallet = require('../Models/MerchantWallet.pg.js');
      const wallet = await MerchantWallet.findOne({ where: { integrationId } });
      const currentBalance = wallet ? parseFloat(wallet.deliveryCashBalance) : 0;
      
      if (currentBalance < deliveryCost) {
        throw new Error(`Insufficient Merchant Delivery Wallet balance. Delivery is currently blocked.`);
      }
    }
  }

  payableAmount = Math.round(itemsSubtotal + totalTax + deliveryCost);



  const orderStatus = "waiting";


  // Step 4: Create order
  // Record customer-merchant link for the Customers tab
  const { recordMerchantCustomer } = require("./PhoneBook.pg.Service");
  await recordMerchantCustomer(userId, integrationId);

  let order = await Order.create({
    cartId,
    userId,
    integrationId,
    catalogueId,
    addressId,
    totalPrice: payableAmount,
    discountAmount: totalDealDiscount,
    walletDiscount: parseFloat(walletDiscount) || 0,
    orderItems: enrichedItems,
    orderMessage: orderMessage || "",
    deliveryType: deliveryType,
    paymentStatus: "pending",
    status: orderStatus,
    paymentMethod,
    deliveryQuote: deliveryQuoteAmount,
    statusLogs: [
      { status: 'waiting', timestamp: new Date(), message: 'Order placed' }
    ]
  });


  if (paymentMethod === "cod" || paymentMethod === "upi") {
    // 1. Make cart inactive
    await Cart.update({ isActive: false }, { where: { id: cartId } });

    // 2. Reduce stock for each product in the relational table
    for (const orderItem of enrichedItems) {
        await Product.decrement('quantity', {
            by: orderItem.quantity,
            where: { id: orderItem.productId, integrationId }
        });
    }

    // 3. Save order and return
    console.log("Sending NEW_ORDER update...");

    try {
      sendOrderUpdate({
        type: "NEW_ORDER",
        order: {
          ...order.get({ plain: true }), // plain object for SSE
          orderId: order.id,
          customer,
          orderStatus: order.status
        }
      });

      console.log("NEW_ORDER update sent.");
      
      // Notify customer SSE client immediately about their placed order
      sendUserOrderUpdate(userId, {
        type: "ORDER_STATUS_UPDATE",
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus
      });
      console.log("User SSE order placement update sent.");
    } catch (err) {
      console.error("Error sending NEW_ORDER or user SSE update:", err);
    }



    try {
      const summaryData = await getAllCustomerSummary(order.integrationId, { page: 1, limit: 1000 });

      sendOrderUpdate({
        type: "CUSTOMER_SUMMARY_UPDATE",
        summary: summaryData.data,
        totalCustomers: summaryData.totalCustomers,
        currentPage: summaryData.currentPage,
        totalPages: summaryData.totalPages
      });

    } catch (err) {
      console.error("Error sending CUSTOMER_SUMMARY_UPDATE:", err);
    }


    return { order, razorpayOrder: null };
  }


  // Step 5: Create Razorpay order
  const razorpayOrder = await createRazorpayOrder({
    // accessToken,
    integrationId,
    _id: order.id,
    amount: payableAmount,
  });

  await order.update({ razorpayOrderId: razorpayOrder.id });

  return { order, razorpayOrder };
};


// WEB 

const getAllOrdersService = async (integrationId, query) => {
  const { status = "all", search = "", page = 1, limit = 5 } = query;
  const { Op } = require('sequelize');

  try {
    const where = { 
        integrationId,
        [Op.not]: {
            [Op.and]: [
                { paymentMethod: "razorpay" },
                { paymentStatus: "pending" }
            ]
        }
    };
    if (status !== "all") where.status = status;

    const limitInt = parseInt(limit);
    const offset = (page - 1) * limitInt;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['firstName', 'lastName', 'phoneNumber', 'cc', 'addresses'] }],
      order: [['createdAt', 'DESC']],
      limit: limitInt,
      offset: offset
    });

    if (!orders.length) {
      return {
        success: true,
        data: [],
        totalOrders: 0,
        currentPage: parseInt(page),
        totalPages: 0,
        message: "No orders found"
      };
    }

    let filteredOrders = orders;
    if (search && search.trim() !== "") {
      const keyword = search.trim().toLowerCase();
      filteredOrders = orders.filter(order => {
        const addr = (order.User?.addresses || []).find(
          a => (a.id || a._id).toString() === order.addressId.toString()
        );

        const city = (addr?.city || "").toLowerCase();
        const cityMatch = city.includes(keyword);

        const itemMatch = order.orderItems?.some(item => {
          const name = (item.name || "").toLowerCase();
          return name.includes(keyword);
        });

        const addressLine = (addr?.addressLine1 || addr?.addressLine2 || "").toLowerCase();
        const addressMatch = addressLine.includes(keyword);

        return cityMatch || itemMatch || addressMatch;
      });
    }


    const formattedOrders = filteredOrders.map(order => {
      const products = order.orderItems?.map(item => ({
        id: item.id || item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        specialRequest: item.specialRequest || "",
        customizationDetails: item.customizationDetails || [],
      })) || [];

      const payment = {
        method: order.paymentMethod,
        status: order.paymentStatus,
        value: order.totalPrice
      };

      const orderAddress = (order.User?.addresses || []).find(
        addr => (addr.id || addr._id).toString() === order.addressId.toString()
      ) || {};

      const customer = order.User
        ? {
          name: `${order.User.firstName || "Unknown"} ${order.User.lastName || ""}`.trim(),
          phone: `${order.User.cc || ""}${order.User.phoneNumber || ""}`,
          address: orderAddress,

        }
        : { name: "Unknown", phone: "", addresses: [], address: {} };

      console.log(`[DEBUG] Mapping Order ID: ${order.id} (mongoId: ${order.mongoId})`);
      return {
        orderId: order.id,
        products,
        orderMessage: order.orderMessage,
        deliveryType: order.deliveryType || [],
        totalQuantity: order.totalQuantity,
        totalPrice: order.totalPrice,
        payment,
        customer,
        orderStatus: order.status,
        orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      };
    });

    return {
      success: true,
      message: "Orders fetched successfully",
      data: formattedOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limitInt),
      totalOrders: count
    };

  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      message: "Could not fetch orders",
      data: []
    };
  }
};


const updateOrderStatusService = async (orderId, newStatus, integrationId, reason = null) => {
  const allowedStatuses = ['waiting', 'accepted', 'packing', 'dispatched', 'delivered', 'canceled'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid order status: ${newStatus}`);
  }


  const updatedOrder = await Order.findOne({ where: { id: orderId, integrationId } });
  if (!updatedOrder) {
    throw new Error("Order not found");
  }


  const currentStatus = updatedOrder.status;


  // Prevent regression
  const statusOrder = ['waiting', 'accepted', 'packing', 'dispatched', 'delivered', 'canceled'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);

  if (newIndex < currentIndex) {
    throw new Error(`Cannot change order status from '${currentStatus}' back to '${newStatus}'`);
  }

  // Prepare status updates
  const updates = { status: newStatus };
  if (newStatus === 'canceled' && reason) {
    updates.cancelReason = reason;
  }
  const now = new Date();

  // Track standard Swiggy-style phase timestamps
  if (newStatus === 'accepted') {
    updates.acceptedAt = now;
    if (updatedOrder.paymentMethod !== 'cod' && updatedOrder.paymentMethod !== 'upi') {
      updates.paymentStatus = 'paid';
    }
  }
  if (newStatus === 'packing') updates.packedAt = now;
  if (newStatus === 'dispatched') {
    updates.dispatchedAt = now;

    // Pidge Delivery Dispatch Hook
    if (updatedOrder.deliveryType === 'Delivery') {
      try {
        console.log(`Pidge: Order #${orderId} dispatched, starting Pidge flow...`);
        const integration = await Integration.findByPk(integrationId);
        if (integration && integration.pidge && integration.pidge.enabled === true) {
          const user = await User.findByPk(updatedOrder.userId);
          if (user) {
            // Find address
            const userAddress = (user.addresses || []).find(addr => {
              try { return (addr.id || addr._id || '').toString() === (updatedOrder.addressId || '').toString(); }
              catch { return false; }
            });

            if (userAddress) {
              const PidgeService = require('./Pidge.Service');
              const { getGeolocation } = require('../Utils/map');

              // Resolve coordinates for address
              let lat = parseFloat(userAddress.lat || userAddress.latitude || (userAddress.geoLocation && userAddress.geoLocation.lat));
              let lng = parseFloat(userAddress.lng || userAddress.longitude || (userAddress.geoLocation && userAddress.geoLocation.lng));

              if (isNaN(lat) || isNaN(lng)) {
                // If coordinates are missing, try geocoding
                const fullAddressStr = `${userAddress.addressLine1 || userAddress.line1 || ''}, ${userAddress.city || ''}, ${userAddress.state || ''}, ${userAddress.pincode || ''}`;
                console.log(`Pidge: Address coordinates missing, geocoding address "${fullAddressStr}"`);
                try {
                  const geo = await getGeolocation(fullAddressStr);
                  lat = geo.lat;
                  lng = geo.lng;
                  console.log(`Pidge: Geocoded successfully to lat: ${lat}, lng: ${lng}`);
                } catch (geoErr) {
                  console.error('Pidge: Geocoding failed, using Mysore fallback coords.', geoErr.message);
                  lat = 12.3237008;
                  lng = 76.6022778;
                }
              }

              const resolvedAddress = {
                ...userAddress,
                lat,
                lng
              };

              const username = integration.pidge.username;
              const password = integration.pidge.password;
              const env = integration.pidge.environment || 'sandbox';

              if (username && password) {
                console.log(`Pidge: Authenticating user: ${username}`);
                const token = await PidgeService.authenticate(username, password, env);
                
                console.log(`Pidge: Creating order booking...`);
                const cleanedUser = {
                  ...user,
                  phoneNumber: PidgeService.cleanMobile(user.phoneNumber)
                };
                const pidgeOrderId = await PidgeService.createPidgeOrder(
                  token,
                  env,
                  updatedOrder,
                  cleanedUser,
                  integration,
                  resolvedAddress
                );

                console.log(`Pidge: Fulfilling order booking (pidgeOrderId: ${pidgeOrderId})...`);
                const trackingUrl = await PidgeService.fulfillPidgeOrder(token, env, pidgeOrderId);

                updates.pidgeOrderId = pidgeOrderId;
                updates.trackingUrl = trackingUrl;
                console.log(`Pidge: Dispatch flow completed successfully. pidgeOrderId: ${pidgeOrderId}, trackingUrl: ${trackingUrl}`);
              } else {
                console.warn('Pidge: Credentials missing in Integration settings.');
              }
            } else {
              console.warn('Pidge: Order dropoff address not found.');
            }
          } else {
            console.warn('Pidge: User not found for Order.');
          }
        }
      } catch (pidgeErr) {
        console.error('Pidge: Non-blocking error in dispatch hook:', pidgeErr.message);
      }
    }
  }
  if (newStatus === 'delivered') {
    updates.deliveredAt = now;
    updates.paymentStatus = 'paid'; // Automatically mark as paid upon delivery
    try {
      const { getOrCreateWallet } = require('../Controllers/Wallet.controller');
      const { LoyaltyTransaction } = require('../Utils/Postgres');
      const wallet = await getOrCreateWallet(updatedOrder.userId);
      const pointsToAward = Math.floor((updatedOrder.totalPrice || 0) / 10);
      if (pointsToAward > 0) {
        wallet.points += pointsToAward;
        await wallet.save();
        await LoyaltyTransaction.create({
          walletId: wallet.id,
          type: 'earn',
          points: pointsToAward,
          orderId: updatedOrder.id,
          description: `Earned ${pointsToAward} points on order #${updatedOrder.id.substring(0, 8)}`,
        });
      }
    } catch (walletErr) {
      console.error("Error awarding loyalty points:", walletErr);
    }
  }

  // Append to visual log array
  const currentLogs = updatedOrder.statusLogs || [];
  updates.statusLogs = [
    ...currentLogs,
    { 
      status: newStatus, 
      timestamp: now, 
      message: (newStatus === 'canceled' && reason) ? `Order canceled: ${reason}` : `Order ${newStatus}` 
    }
  ];

  if (newStatus === 'canceled' && updatedOrder.status !== 'canceled') {
    const wasStockDeducted = ['accepted', 'packing', 'dispatched'].includes(updatedOrder.status) || 
                             (updatedOrder.status === 'waiting' && ['cod', 'upi'].includes(updatedOrder.paymentMethod));
    if (wasStockDeducted) {
      for (const item of updatedOrder.orderItems) {
        await Product.increment('quantity', {
          by: item.quantity,
          where: { 
            id: item.productId.toString(), 
            integrationId: updatedOrder.integrationId 
          }
        });
      }
    }

    // ── WALLET REFUND: return wallet cash used on this order ──
    const walletRefundAmount = parseFloat(updatedOrder.walletDiscount) || 0;
    if (walletRefundAmount > 0) {
      try {
        const { getOrCreateWallet } = require('../Controllers/Wallet.controller');
        const { LoyaltyTransaction } = require('../Utils/Postgres');
        const wallet = await getOrCreateWallet(updatedOrder.userId);
        wallet.cashBalance = parseFloat((parseFloat(wallet.cashBalance) + walletRefundAmount).toFixed(2));
        await wallet.save();
        await LoyaltyTransaction.create({
          walletId: wallet.id,
          type: 'refund',
          points: 0,
          orderId: updatedOrder.id,
          description: `Wallet refund ₹${walletRefundAmount.toFixed(2)} for cancelled order #${updatedOrder.id.substring(0, 8)}`,
        });
        console.log(`✅ Wallet refunded ₹${walletRefundAmount} for cancelled order ${updatedOrder.id}, new balance: ${wallet.cashBalance}`);
      } catch (walletErr) {
        console.error('⚠️ Wallet refund failed:', walletErr.message);
      }
    }
  }

  // Update order atomically
  await updatedOrder.update(updates);

  //  Find chat room for this user + integration
  const chatRoom = await ChatRoom.findOne({
    where: {
        integrationId: updatedOrder.integrationId,
        userId: updatedOrder.userId
    }
  });

  if (chatRoom) {
    await sendUpdateOrderStatusMessage({
      chatRoomId: chatRoom.id,
      integrationId: updatedOrder.integrationId,
      userId: updatedOrder.userId,
      order: updatedOrder.get({ plain: true }),
    });
  }

  //  Send SSE update to Vendor Portal
  try {
    sendOrderUpdate({
      type: "ORDER_STATUS_UPDATE",
      orderId: updatedOrder.id,
      status: newStatus,
      paymentStatus: updatedOrder.paymentStatus
    });
  } catch (err) {
    console.error("Error sending SSE ORDER_STATUS_UPDATE:", err);
  }

  // Send SSE update to Customer's mobile app (user-scoped stream)
  try {
    sendUserOrderUpdate(updatedOrder.userId, {
      type: "ORDER_STATUS_UPDATE",
      orderId: updatedOrder.id,
      status: newStatus,
      paymentStatus: updatedOrder.paymentStatus
    });
  } catch (err) {
    console.error("Error sending user SSE ORDER_STATUS_UPDATE:", err);
  }

  //  Send push notifications
  const userDevice = await UserDevice.findOne({ where: { userId: updatedOrder.userId } });
  if (userDevice?.fcmToken?.length) {
    const fcmTokens = userDevice.fcmToken;
    const data = {
      orderId: updatedOrder.id.toString(),
      status: newStatus,
      eventType: "ORDER_STATUS_UPDATE",
      chatRoomId: chatRoom ? chatRoom.id.toString() : null

    };
    const notification = {
      title: "Order Status Updated",
      body: `Your order is now ${newStatus}`,
    };

    const notificationPromises = fcmTokens.map(token =>
      sendPushNotification(token, data, notification)
        .then(() => console.log(`Notification sent to token: ${token}`))
        .catch(err => console.error(`Failed to send notification to token: ${token}`, err))
    );

    await Promise.all(notificationPromises);
  }

  return updatedOrder;
};

const getUserOrdersService = async (userId) => {
  const orders = await Order.findAll({
    where: { userId },
    include: [{ model: Integration, attributes: ['integrationName', 'logo'] }],
    order: [['createdAt', 'DESC']]
  });
  return orders;
};



const getOrderDetailsService = async (orderId, userId) => {
  try {
    const order = await Order.findOne({ 
        where: { id: orderId, userId },
        include: [{ model: User, attributes: ['firstName', 'lastName', 'phoneNumber', 'cc', 'addresses'] }]
    });


    if (!order) {
      throw new Error("Order not found for this user");
    }

    const cart = await Cart.findOne({ where: { id: order.cartId, userId } });
    if (!cart) {
      throw new Error("Cart not found for this user/order");
    }

    const integration = await Integration.findByPk(order.integrationId);
    if (!integration) {
      throw new Error("Integration not found for this order");
    }

    const catalogue = (integration.catalogues || []).find(
      (cat) =>
        (cat.id || cat._id).toString() === order.catalogueId.toString() &&
        !cat.isDeleted
    );

    const productMap = {};
    if (catalogue && Array.isArray(catalogue.products)) {
      catalogue.products.forEach((product) => {
        productMap[(product.id || product._id).toString()] = product;
      });
    }

    // Preload customizations used in this cart
    const customizationIds = [
      ...new Set(
        (cart.items || [])
          .filter((item) => item.customizationId)
          .map((item) => item.customizationId.toString())
      ),
    ];

    const { Op } = require('sequelize');
    const customizationDocs = customizationIds.length
      ? await Customization.findAll({
        where: {
            id: { [Op.in]: customizationIds },
            isActive: true,
            isDeleted: false
        }
      })
      : [];



    const customizationMap = {};
    customizationDocs.forEach((doc) => {
      customizationMap[doc.id.toString()] = doc;
    });



    const productDetails = (order.orderItems || []).map((orderItem, index) => {
      const cartItem = (cart.items || [])[index];
      const product = productMap[orderItem.productId.toString()];

      const customizations = [];

      if (
        cartItem &&
        cartItem.customizationId &&
        Array.isArray(cartItem.selectedOptions) &&
        cartItem.selectedOptions.length
      ) {
        const customizationDoc =
          customizationMap[cartItem.customizationId.toString()];

        if (customizationDoc && Array.isArray(customizationDoc.options)) {
          cartItem.selectedOptions.forEach((selectedOption) => {
            const option = customizationDoc.options.find(
              (opt) =>
                (opt.id || opt._id).toString() === selectedOption.optionId.toString()
            );
            if (!option || !Array.isArray(option.choices)) return;

            (selectedOption.selectedChoices || []).forEach((choiceId) => {
              const choice = option.choices.find(
                (c) => (c.id || c._id).toString() === choiceId.toString()
              );
              if (!choice) return;

              const price = Number(choice.priceAdjustment || 0);
              const discountPercent = Number(product?.discountPercentage || 0);
              const discountedPrice =
                discountPercent > 0
                  ? Math.round((price - (price * discountPercent) / 100) * 100) / 100
                  : price;

              customizations.push({
                choiceName: choice.name,
                choicePrice: discountedPrice.toFixed(2),
              });
            });
          });
        }
      }

      return {
        productName: orderItem.name,
        productQuantity: orderItem.quantity,
        productLogo: product?.imageUrls?.[0] || null,
        productPrice: Number(orderItem.total ?? orderItem.price ?? 0).toFixed(2),
        customizations,
      };
    });


    const subtotal = (order.orderItems || []).reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );

    // Recalculate GST based on current integration product tax config
    let totalCGST = 0;
    let totalSGST = 0;
    let totalOtherTaxes = 0;

    (order.orderItems || []).forEach((item) => {
      const product = productMap[item.productId.toString()];
      if (!product) return;

      const taxable = item.total || 0;

      totalCGST += (taxable * (product.cgst || 0)) / 100;
      totalSGST += (taxable * (product.sgst || 0)) / 100;
      totalOtherTaxes += (taxable * (product.otherTaxes || 0)) / 100;
    });

    const taxesRaw = totalCGST + totalSGST + totalOtherTaxes;
    const taxes = Math.round(taxesRaw * 100) / 100;

    // Grand total should be before applying deal savings (subtotal + taxes)
    const grandTotal = Math.round((subtotal + taxes) * 100) / 100;

    // Calculate deal savings using deals applied on the cart
    let totalDealDiscount = 0;
    if (Array.isArray(cart.appliedDeals) && cart.appliedDeals.length) {
      const appliedDealIds = cart.appliedDeals.map((d) => d.dealId);

      const appliedDeals = await Deal.findAll({
        where: {
            id: { [Op.in]: appliedDealIds },
            integrationId: order.integrationId,
            isDeleted: false,
            isActive: true,
        }
      });

      const calculateDealDiscount = (deal, items) => {
        let dealDiscount = 0;

        const applicableItems =
          items?.filter((item) =>
            deal.appliesOnProducts?.some(
              (pid) => pid.toString() === item.productId.toString()
            )
          ) || [];

        if (applicableItems.length === 0) return 0;

        const applicableTotal = applicableItems.reduce(
          (sum, item) => sum + (item.total || 0),
          0
        );

        if (deal.discountType === "percentage") {
          dealDiscount = (applicableTotal * deal.discountValue) / 100;

          if (deal.maxDiscount > 0) {
            dealDiscount = Math.min(dealDiscount, deal.maxDiscount);
          }
        } else if (deal.discountType === "flat") {
          dealDiscount = Number(deal.discountValue || 0);
        } else if (deal.discountType === "bogo") {
          const buyQty = deal.buyQuantity || 0;
          const getQty = deal.getQuantity || 0;

          if (buyQty > 0 && getQty > 0) {
            let perUnitPrices = [];

            for (const item of applicableItems) {
              const unitPrice = (item.total || 0) / (item.quantity || 1);
              for (let i = 0; i < item.quantity; i++) {
                perUnitPrices.push(unitPrice);
              }
            }

            perUnitPrices.sort((a, b) => a - b);

            const purchasedQty = perUnitPrices.length;

            const freeItems = Math.floor(purchasedQty / buyQty) * getQty;

            const freePrices = perUnitPrices.slice(0, freeItems);

            dealDiscount = freePrices.reduce((s, p) => s + p, 0);
          }
        }

        return dealDiscount;
      };

      for (const deal of appliedDeals) {
        totalDealDiscount += calculateDealDiscount(deal, order.orderItems || []);
      }
    }

    // totalSave should reflect only deal-based savings; if no deals, it should be zero
    const totalSaved = totalDealDiscount;
    const toPay = Math.max(grandTotal - totalSaved, 0);

    const orderAddress =
      order.userId?.addresses?.find(
        (addr) => addr._id.toString() === order.addressId.toString()
      ) || {};

    // Format address as a single line: "Name, addressLine1, addressLine2, landmark, city, state, country, pincode"
    const deliveryAddress = (() => {
      const parts = [
        orderAddress.fullName,
        orderAddress.addressLine1,
        orderAddress.addressLine2,
        orderAddress.landmark,
        orderAddress.city,
        orderAddress.state,
        orderAddress.country,
        orderAddress.pincode,
      ].filter(Boolean);
      return parts.join(", ");
    })();

    // Normalize payment method label
    const paymentMethodLabel =
      order.paymentMethod === "razorpay" ? "online" : "offline";

    return {
      orderId: order._id,
      orderStatus: order.status,
      orderDate: order.createdAt,
      paymentMethod: paymentMethodLabel,
      deliveryAddress,
      productDetails,
      subtotal: Number(subtotal).toFixed(2),
      taxes: Number(taxes).toFixed(2),
      totalSaved: Number(totalSaved).toFixed(2),
      grandTotal: Number(grandTotal).toFixed(2),
      toPay: Number(toPay).toFixed(2),
    };
  } catch (error) {
    console.error("Error in getOrderDetailsService:", error);
    throw error;
  }
};





// Services For Verify Payment Function 


const deductStockService = async (order) => {
  for (const item of order.orderItems) {
    const product = await Product.findOne({
      where: {
        id: item.productId.toString(),
        integrationId: order.integrationId,
        catalogueId: order.catalogueId,
        isActive: true,
        isDeleted: false
      }
    });

    if (!product) {
      console.warn(`Product ${item.productId} not found or inactive`);
      continue;
    }

    product.quantity = Math.max(product.quantity - item.quantity, 0);
    await product.save();
  }
};


const checkStockAvailability = async (order) => {
  for (const item of order.orderItems) {
    const product = await Product.findOne({
      where: {
        id: item.productId.toString(),
        integrationId: order.integrationId,
        catalogueId: order.catalogueId,
        isActive: true,
        isDeleted: false
      }
    });

    if (!product) {
      throw new Error(`Product ${item.name || item.productId} not found or inactive`);
    }

    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }
  return { available: true };
};


const updateUsageCount = async (order) => {
  try {
    const { Deal, UserDealUsage } = require('../Utils/Postgres');

    // 1️ Fetch Cart
    const cart = await Cart.findOne({
      where: {
        id: order.cartId,
        integrationId: order.integrationId,
        isActive: true
      }
    });

    if (!cart) {
      console.log("Cart not found for updateUsageCount");
      return;
    }

    // 2️ Check applied deals
    if (!cart.appliedDeals || cart.appliedDeals.length === 0) {
      console.log("No deals applied, skipping usage count update");
      return;
    }

    // 3️ Extract deal IDs
    const dealIds = cart.appliedDeals.map(d => d.dealId);

    // 4️ Fetch deal documents
    const deals = await Deal.findAll({
      where: {
        id: { [Op.in]: dealIds },
        integrationId: order.integrationId,
        isActive: true,
        isDeleted: false
      }
    });

    if (!deals.length) {
      console.log("No matching deals found for usage update");
      return;
    }

    // 5️ Update usage counts sequentially (or via increment)
    for (const deal of deals) {
      await deal.increment('usageCount', { by: 1 });

      // Per-user usage count
      const [userUsage, created] = await UserDealUsage.findOrCreate({
        where: {
          userId: order.userId,
          integrationId: order.integrationId,
          dealId: deal.id
        },
        defaults: { usageCount: 1 }
      });

      if (!created) {
        await userUsage.increment('usageCount', { by: 1 });
      }
    }

    console.log("Deal & user deal usage updated successfully");
  } catch (error) {
    console.error("Error in updateUsageCount:", error);
  }
};
module.exports = { getAllOrdersService, updateOrderStatusService, placeOrderService, deductStockService, checkStockAvailability, updateUsageCount, getOrderDetailsService, getUserOrdersService };










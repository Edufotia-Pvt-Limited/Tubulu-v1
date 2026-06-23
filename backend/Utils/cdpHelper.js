const axios = require("axios");

const { config } = require('../config')

const { CDP_EVENTS_API_URL } = config;


//  Common CDP API base URL
const CDP_BASE_URL = CDP_EVENTS_API_URL;


/**
 * 🔹 CDP "View" Event
 */
const viewCdpEvent = async (cdpAccessToken, ids) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'view' event");
      return null;
    }

    const payload = {
      eventType: "view",

      properties: {
        pageName: "homepage",
        url: "https://mystore.com/home",
      },
    };


    if (ids?.profileId && ids?.sessionId) {
      payload.profileId = ids.profileId;
      payload.sessionId = ids.sessionId;
    }

    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });



    return response.data;
  } catch (error) {
    console.error("Failed to send CDP 'view' event:", error.message);
    return null;
  }
};

/**
 * 🔹 CDP "Signup" Event
 */



const signupCdpEvent = async (cdpAccessToken, { profileId, sessionId, user }) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'signup' event");
      return null;
    }

    if (!profileId || !sessionId) {
      console.warn("Missing profileId/sessionId — skipping 'signup' event");
      return null;
    }

    const defaultDob = new Date();
    defaultDob.setFullYear(defaultDob.getFullYear() - 20);

    const now = new Date().toISOString();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const payload = {
      eventType: "signup",
      profileId,
      sessionId,
      properties: {
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        mobile: user.phoneNumber || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || defaultDob.toISOString().split("T")[0],
        signupDate: now,
        action: "signup",
        url: "http://localhost:8080/",
        consent: [
          {
            typeIdentifier: "visibleToOtherProfessionals",
            status: "GRANTED",
            statusDate: now,
            revokeDate: oneYearLater.toISOString(),
          },
          {
            typeIdentifier: "visibleToContactsOnly",
            status: "GRANTED",
            statusDate: now,
            revokeDate: oneYearLater.toISOString(),
          },
        ],
      },

    };

    console.log("signup payload", payload);


    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });




    console.log("CDP 'signup' event sent successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to send CDP 'signup' event:", error.message);
    return null;
  }
};



/**
 * 🔹 CDP Generic Product View Event
 */
const productViewCdpEvent = async ({
  cdpAccessToken,
  eventType,
  profileId,
  sessionId,
  properties = {},
}) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping event:", eventType);
      return null;
    }

    if (!profileId || !sessionId) {
      console.warn(`Missing profileId/sessionId — skipping CDP event [${eventType}]`);
      return null;
    }

    const payload = {
      eventType,
      profileId,
      sessionId,
      properties,
    };


    // console.log('===', payload)

    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });




    console.log(`CDP Event [${eventType}] sent successfully`);
    return response.data;
  } catch (error) {
    console.error(`Failed to send CDP Event [${eventType}]:`, error.message);
    return null;
  }
};



const addToCartCdpEvent = async (cdpAccessToken, { profileId, sessionId, product }) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'addToCart' event");
      return null;
    }

    if (!profileId || !sessionId) {
      console.warn("Missing profileId/sessionId — skipping 'addToCart' event");
      return null;
    }

    const payload = {
      eventType: "addToCart",
      profileId,
      sessionId,
      properties: {
        properties: {
          productId: product.productId || "",
          productName: product.productName || "",
          price: product.price || 0,
          quantity: product.quantity || 1,
          category: product.category || "",
          brand: product.brand || "",
        },
        url: "https://mystore.com/cart",
      },
    };


    // //  Pretty-print payload for debugging
    // console.log("🛒 CDP Add To Cart Payload:\n", JSON.stringify(payload, null, 2));


    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });


    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });


    console.log(" CDP 'addToCart' event sent successfully");
    return response.data;
  } catch (error) {
    console.error(" Failed to send CDP 'addToCart' event:", error.message);
    return null;
  }
};


const cartViewCdpEvent = async (cdpAccessToken, { profileId, sessionId, cartItems = [] }) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'cartView' event");
      return null;
    }

    if (!profileId || !sessionId) {
      console.warn("Missing profileId/sessionId — skipping 'cartView' event");
      return null;
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.warn("Empty cart — skipping 'cartView' event");
      return null;
    }

    const totalValue = parseFloat(
      cartItems
        .reduce(
          (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
          0
        )
        .toFixed(2)
    );

    const cartItemsCount = cartItems.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );

    const payload = {
      eventType: "cartView",
      profileId,
      sessionId,
      properties: {
        cartItems: cartItems.map((item) => ({
          productId: item.productId || "",
          productName: item.productName || "",
          price: parseFloat((Number(item.price) || 0).toFixed(2)),
          quantity: item.quantity || 1,
          category: item.category || "",
        })),
        totalValue,
        cartItemsCount,
      },
    };

    // // Formatted console log
    // console.log("🛒 Sending CDP 'cartView' event with payload:");
    // console.log(JSON.stringify(payload, null, 2));


    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });


    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });


    console.log("CDP 'cartView' event sent successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to send CDP 'cartView' event:", error.message);
    return null;
  }
};





const purchaseCdpEvent = async (
  cdpAccessToken,
  { profileId, sessionId, order }
) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'purchase' event");
      return null;
    }

    if (!profileId || !sessionId) {
      console.warn("Missing profileId/sessionId — skipping 'purchase' event");
      return null;
    }

    if (!order || !order.items || order.items.length === 0) {
      console.warn("Missing or empty order items — skipping 'purchase' event");
      return null;
    }
    //  Calculate totals and format properly
    const totalAmount = order.totalAmount
      ? parseFloat(Number(order.totalAmount).toFixed(2))
      : parseFloat(
        order.items
          .reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
            0
          )
          .toFixed(2)
      );

    const productsCount =
      order.productsCount ||
      order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const payload = {
      eventType: "purchase",
      profileId,
      sessionId,
      properties: {
        orderId: order.orderId || `ORD-${Date.now()}`,
        productsCount,
        purchaseDate: order.purchaseDate || new Date().toISOString(),
        totalAmount,
        currency: order.currency || "USD",
        paymentMethod: order.paymentMethod || "unknown",
        items: order.items.map((item) => ({
          productId: item.productId || "",
          name: item.name || "",
          price: parseFloat((Number(item.price) || 0).toFixed(2)),
          category: item.category || "",
          quantity: item.quantity || 1,
        })),
      },
    };

    // // Pretty-print payload
    // console.log("Purchase CDP Payload:\n", JSON.stringify(payload, null, 2));


    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });


    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });



    console.log("CDP 'purchase' event sent successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to send CDP 'purchase' event:", error.message);
    return null;
  }
};



const paymentCdpEvent = async (cdpAccessToken, { profileId, sessionId, paymentData }) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'payment' event");
      return null;
    }

    if (!profileId || !sessionId) {
      console.warn("Missing profileId/sessionId — skipping 'payment' event");
      return null;
    }

    if (!paymentData) {
      console.warn("Missing payment data — skipping 'payment' event");
      return null;
    }

    const payload = {
      eventType: "payment",
      profileId,
      sessionId,
      properties: {
        orderId: paymentData.orderId || `ORD-${Date.now()}`,
        payment: [
          {
            paymentMethod: paymentData.paymentMethod || "UPI/NETBANKING/CC",
            Amount: parseFloat((Number(paymentData.amount) || 0).toFixed(2)),
            responseCode: paymentData.responseCode || "SUCCESS",
            description: paymentData.description || "Payment processed successfully",
            status: paymentData.status || "completed",
          },
        ],
      },
    };

    // console.log("Payment CDP Payload:\n", JSON.stringify(payload, null, 2));

    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });


    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });



    console.log("CDP 'payment' event sent successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to send CDP 'payment' event:", error.message);
    return null;
  }
};



const productSearchCdpEvent = async (cdpAccessToken, { profileId, sessionId, searchString }) => {
  try {

    console.log('productSearchCdpEvent', cdpAccessToken)

    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'search' event");
      return null;
    }

    if (!profileId || !sessionId) {
      console.warn("Missing profileId/sessionId — skipping 'search' event");
      return null;
    }

    const payload = {
      profileId,
      sessionId,
      eventType: "search",
      properties: {
        searchString: searchString || "",
      },
    };

    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });


    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });



    console.log("CDP 'product search' event sent successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to send CDP 'product search' event:", error.message);
    return null;
  }
};





const createSessionCdpEvent = async (cdpAccessToken, { profileId, sessionId, userAgent }) => {
  try {
    if (!cdpAccessToken) {
      console.warn("CDP Access Token missing — skipping 'createSession' event");
      return null;
    }

    const payload = {
      eventType: "createSession",
      action: "create",
      profileId: profileId || "",
      sessionId: sessionId || "",
      userAgent: userAgent || "unknown",
    };

    console.log("Create Session Payload:", payload);

    // const response = await axios.post(CDP_BASE_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${cdpAccessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });


    const response = await axios.post(CDP_BASE_URL, payload, {
      headers: {
        "Authorization": `X-App-Token ${cdpAccessToken}`,
        "Content-Type": "application/json",
      },
    });



    console.log("CDP 'createSession' event sent successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to send CDP 'createSession' event:", error.message);
    return null;
  }
};





module.exports = {
  viewCdpEvent,
  signupCdpEvent,
  productViewCdpEvent,
  addToCartCdpEvent,
  cartViewCdpEvent,
  purchaseCdpEvent,
  createSessionCdpEvent,
  paymentCdpEvent,
  productSearchCdpEvent

};

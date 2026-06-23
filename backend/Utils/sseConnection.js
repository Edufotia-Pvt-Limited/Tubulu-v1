const Order = require('../Models/Order.pg');
const User = require('../Models/User.pg.model');

let clients = [];

// ===== USER-SCOPED SSE CLIENTS (mobile app customers) =====
let userClients = []; // { id, userId, res }

const userOrderStream = (req, res) => {
  const userId = req.id; // set by verifyToken middleware

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const clientId = Date.now();
  userClients.push({ id: clientId, userId, res });
  console.log(`🟢 User SSE client ${clientId} (user: ${userId}) connected. Total: ${userClients.length}`);

  res.write(`event: connected\ndata: "User SSE stream active"\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\ndata: "alive"\n\n`);
    } catch (err) {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on("close", () => {
    console.log(`🔴 User SSE client ${clientId} disconnected`);
    clearInterval(heartbeat);
    userClients = userClients.filter(c => c.id !== clientId);
  });
};

// Push an ORDER_STATUS_UPDATE event to a specific user
const sendUserOrderUpdate = (userId, payload) => {
  const targets = userClients.filter(c => c.userId.toString() === userId.toString());
  if (targets.length === 0) return;

  const deadIds = [];
  targets.forEach(client => {
    try {
      client.res.write(`event: orderUpdate\n`);
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      console.error(`Failed to push to user SSE client ${client.id}:`, err.message);
      deadIds.push(client.id);
    }
  });
  if (deadIds.length > 0) {
    userClients = userClients.filter(c => !deadIds.includes(c.id));
  }
};

// ================= SSE STREAM =================
const orderStream = (req, res) => {
  // CORS headers (important if frontend and backend are on different ports)
  const origin = req.headers.origin || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  // Handle preflight
  if (req.method === "OPTIONS") return res.end();
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Prevent buffering in Nginx/proxies
  res.flushHeaders();
  const clientId = Date.now();
  clients.push({ id: clientId, res });
  console.log(`🟢 Client ${clientId} connected. Total: ${clients.length}`);
  // Send initial connection confirmation
  res.write(`event: connected\ndata: "SSE stream active"\n\n`);
  
  // Keep-alive heartbeat every 15 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\ndata: "alive"\n\n`);
    } catch (err) {
      console.error(`Heartbeat failed for client ${clientId}`);
      clearInterval(heartbeat);
    }
  }, 15000);

  // Cleanup on disconnect
  req.on("close", () => {
    console.log(`🔴 Client ${clientId} disconnected`);
    clearInterval(heartbeat);
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) clients.splice(index, 1);
  });
};

// ============ PUSH EVENTS TO FRONTEND =============
const sendOrderUpdate = (payload) => {
  if (clients.length === 0) {
    return;
  }
  
  const deadClients = [];
  
  clients.forEach((client, index) => {
    try {
      client.res.write(`event: orderUpdate\n`);
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      console.error(`Failed to send to client ${client.id}:`, err.message);
      deadClients.push(client.id);
    }
  });

  if (deadClients.length > 0) {
    clients = clients.filter(c => !deadClients.includes(c.id));
    console.log(`🧹 Cleaned up ${deadClients.length} dead SSE clients. Remaining: ${clients.length}`);
  }
};

const getAllCustomerSummary = async (integrationId, query = {}) => {
  const { lastOrderDate = "", page = 1, limit = 1000 } = query;

  const orders = await Order.findAll({
    where: { integrationId },
    include: [{ model: User }],
    order: [['createdAt', 'DESC']]
  });

  const summaryMap = {};

  orders.forEach(order => {
    const user = order.User;
    if (!user) return;

    const userId = user.id.toString();
    const totalSpentAmount = order.totalPrice || 0; // Using totalPrice from pg model

    if (!summaryMap[userId]) {
      const shippingAddress = (user.addresses || []).find(
        a => (a.id || a._id).toString() === order.addressId?.toString()
      );

      summaryMap[userId] = {
        id: userId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        phoneNumber: `${user.cc}${user.phoneNumber}`,
        address: shippingAddress
          ? `${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.pincode}`
          : "N/A",
        lastOrderDate: order.createdAt,
        totalSpent: totalSpentAmount,
        totalOrders: 1,
      };
    } else {
      summaryMap[userId].totalSpent += totalSpentAmount;
      summaryMap[userId].totalOrders += 1;

      if (new Date(order.createdAt) > new Date(summaryMap[userId].lastOrderDate)) {
        summaryMap[userId].lastOrderDate = order.createdAt;
      }
    }
  });

  let summary = Object.values(summaryMap);

  if (lastOrderDate) {
    const searchDate = new Date(lastOrderDate).toDateString();
    summary = summary.filter(u => new Date(u.lastOrderDate).toDateString() === searchDate);
  }

  const totalCustomers = summary.length;
  const skip = (page - 1) * limit;
  summary = summary.slice(skip, skip + parseInt(limit));

  const formattedSummary = summary.map(u => ({
    ...u,
    _id: u.id,
    lastOrderDate: new Date(u.lastOrderDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    totalSpent: `₹${(u.totalSpent || 0).toFixed(2)}`
  }));

  return {
    data: formattedSummary,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalCustomers / limit),
    totalCustomers,
  };
};

module.exports = { orderStream, sendOrderUpdate, getAllCustomerSummary, userOrderStream, sendUserOrderUpdate };

const { Order: OrderModel, User, Integration } = require('../Utils/Postgres');
const { Op } = require('sequelize');

const getCustomerSummaryService = async (integrationId, query) => {
  const { search = "", lastOrderDate = "", page = 1, limit = 5 } = query;

  // Fetch all orders for the integration, including user details
  const orders = await OrderModel.findAll({
    where: { integrationId },
    include: [{
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'cc', 'addresses']
    }],
    order: [['createdAt', 'DESC']]
  });

  const userIds = [...new Set(orders.map(o => o.User?.id).filter(Boolean))];
  const { Wallet } = require('../Utils/Postgres');
  const wallets = await Wallet.findAll({
    where: { userId: userIds }
  });
  const walletMap = {};
  wallets.forEach(w => {
    walletMap[w.userId] = parseFloat(w.cashBalance || 0);
  });

  const summaryMap = {};

  orders.forEach(order => {
    const user = order.User;
    if (!user) return;

    const userId = user.id;
    const spent = order.totalPrice || 0;

    if (!summaryMap[userId]) {
      const shippingAddress = (user.addresses || []).find(
        a => (a.id || a._id || '').toString() === (order.addressId || '').toString()
      );

      summaryMap[userId] = {
        id: userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        phoneNumber: `${user.cc || ''}${user.phoneNumber || ''}`,
        address: shippingAddress
          ? `${shippingAddress.addressLine1 || ''}, ${shippingAddress.city || ''}, ${shippingAddress.pincode || ''}`
          : 'N/A',
        lastOrderDate: order.createdAt,
        totalSpent: spent,
        totalOrders: 1,
        cashBalance: walletMap[userId] || 0.00
      };
    } else {
      summaryMap[userId].totalSpent += spent;
      summaryMap[userId].totalOrders += 1;

      if (new Date(order.createdAt) > new Date(summaryMap[userId].lastOrderDate)) {
        summaryMap[userId].lastOrderDate = order.createdAt;
      }
    }
  });

  // Convert map to array
  let summary = Object.values(summaryMap);

  if (search && search.trim() !== "") {
    const keyword = search.trim().toLowerCase();
    summary = summary.filter(u => {
      const name = u.name.toLowerCase();
      const phone = u.phoneNumber.toLowerCase();
      const addr = u.address.toLowerCase();
      return name.includes(keyword) || phone.includes(keyword) || addr.includes(keyword);
    });
  }

  if (lastOrderDate) {
    const searchDate = new Date(lastOrderDate).toDateString();
    summary = summary.filter(u => {
      return new Date(u.lastOrderDate).toDateString() === searchDate;
    });
  }

  const totalCustomers = summary.length;
  const skip = (page - 1) * limit;
  const paginatedSummary = summary.slice(skip, skip + parseInt(limit));

  const formattedSummary = paginatedSummary.map(u => ({
    ...u,
    _id: u.id, // Compatibility with frontend expecting _id
    lastOrderDate: new Date(u.lastOrderDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    totalSpent: `₹${(u.totalSpent || 0).toFixed(2)}`,
    cashBalance: u.cashBalance,
    formattedCashBalance: `₹${(u.cashBalance || 0).toFixed(2)}`
  }));

  return {
    data: formattedSummary,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalCustomers / limit),
    totalCustomers
  };
};

const getSingleCustomerOrderDetailsService = async (userId, integrationId, query) => {
  const { status = "all", search = "", page = 1, limit = 5 } = query;

  const integration = await Integration.findByPk(integrationId);
  if (!integration) throw new Error("Integration not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const userName = `${user.firstName || "Unknown"} ${user.lastName || ""}`.trim();
  const addresses = Array.isArray(user.addresses) ? user.addresses : [];

  const where = { userId, integrationId };
  if (status !== "all") where.status = status;

  // Filter out pending razorpay orders
  where[Op.not] = {
    [Op.and]: [
      { paymentMethod: "razorpay" },
      { paymentStatus: "pending" }
    ]
  };

  const skip = (page - 1) * limit;
  const { count, rows: orders } = await OrderModel.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['firstName', 'lastName', 'phoneNumber', 'cc', 'addresses'] }],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: skip
  });

  const formattedOrders = orders.map(order => {
    const products = (order.orderItems || []).map(item => ({
      id: item.id || item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      specialRequest: item.specialRequest || "",
      customizationDetails: item.customizationDetails || [],
    }));

    const orderAddress = (order.User?.addresses || []).find(
      addr => (addr.id || addr._id || '').toString() === (order.addressId || '').toString()
    ) || {};

    return {
      orderId: order.id,
      products,
      totalQuantity: order.totalQuantity,
      totalPrice: order.totalPrice,
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus,
        value: order.totalPrice
      },
      customer: {
        name: `${order.User?.firstName || ''} ${order.User?.lastName || ''}`.trim(),
        phone: `${order.User?.cc || ''}${order.User?.phoneNumber || ''}`,
        address: orderAddress
      },
      orderStatus: order.status,
      orderMessage: order.orderMessage,
      deliveryType: order.deliveryType,
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
    totalPages: Math.ceil(count / limit),
    addresses,
    userName
  };
};

module.exports = { getCustomerSummaryService, getSingleCustomerOrderDetailsService };

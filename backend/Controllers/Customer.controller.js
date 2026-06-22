const { getCustomerSummaryService, getSingleCustomerOrderDetailsService } = require("../Services/Customer.Service");

const sendResponse = (res, statusCode, message, data = null, errors = null) => {
    const response = { statusCode, message };
    if (data) response.data = data;
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};



const getCustomerSummaryController = async (req, res) => {
  try {
    const integrationId = req.id; // assuming you attach it via middleware

    if (!integrationId) {
      return sendResponse(res, 400, "integrationId is required");
    }

    // Pass query parameters (search, lastOrderDate, page, limit) to service
    const customerSummary = await getCustomerSummaryService(integrationId, req.query);


  return sendResponse(res, 200, "Customer summary fetched successfully", customerSummary);

  } catch (err) {
    console.error("Error fetching customer summary:", err);
    return sendResponse(
      res,
      500,
      "Server error while fetching customer summary",
      null,
      err.message
    );
  }
};



const getSingleCustomerOrderDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const integrationId = req.id;
        const query = req.query;


        if (!userId) {
            return sendResponse(res, 400, "userId is required");
        }

        const result = await getSingleCustomerOrderDetailsService(userId, integrationId, query);


        return sendResponse(res, 200, "Customer orders fetched successfully", result);

    } catch (err) {
        console.error(err);
        return sendResponse(res, 500, "Internal server error", null, err.message);
    }
};



const updateCustomerController = async (req, res) => {
    try {
        const { userId, firstName, lastName } = req.body;
        if (!userId) {
            return sendResponse(res, 400, "userId is required");
        }
        const { User } = require('../Utils/Postgres');
        const user = await User.findByPk(userId);
        if (!user) {
            return sendResponse(res, 404, "User not found");
        }
        user.firstName = firstName || '';
        user.lastName = lastName || '';
        await user.save();

        return sendResponse(res, 200, "Customer updated successfully", {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            phoneNumber: `${user.cc || ''}${user.phoneNumber || ''}`
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, 500, "Internal server error", null, err.message);
    }
};

const addCreditsController = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (!userId) {
            return sendResponse(res, 400, "userId is required");
        }
        if (amount === undefined || isNaN(Number(amount))) {
            return sendResponse(res, 400, "Valid credit amount is required");
        }

        const { getOrCreateWallet } = require('./Wallet.controller');
        const wallet = await getOrCreateWallet(userId);
        
        wallet.cashBalance = parseFloat((parseFloat(wallet.cashBalance) + parseFloat(amount)).toFixed(2));
        await wallet.save();

        return sendResponse(res, 200, "Credits added successfully", {
            userId,
            cashBalance: wallet.cashBalance
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, 500, "Internal server error", null, err.message);
    }
};

module.exports = { 
  getCustomerSummaryController, 
  getSingleCustomerOrderDetails,
  updateCustomerController,
  addCreditsController
}
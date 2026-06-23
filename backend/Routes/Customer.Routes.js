const express = require('express');
const { 
  getCustomerSummaryController, 
  getSingleCustomerOrderDetails,
  updateCustomerController,
  addCreditsController
} = require('../Controllers/Customer.controller');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const router = express.Router();

router.get('/get-customer', verifyIntegrationToken, getCustomerSummaryController);

// Fetch single customer order details
router.get(
  '/get-customer-orders/:userId', 
  verifyIntegrationToken, 
  getSingleCustomerOrderDetails
);

// Update customer details (name)
router.put('/update-customer', verifyIntegrationToken, updateCustomerController);

// Add wallet credits to customer
router.post('/add-credits', verifyIntegrationToken, addCreditsController);

module.exports = router;
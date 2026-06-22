const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  listUserTickets, 
  getTicketDetails, 
  replyTicket, 
  closeTicket,
  listAllTickets,
  updateTicketStatus
} = require('../Controllers/Support.controller');
const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');

// Customer Ticket endpoints
router.post('/ticket', verifyToken, createTicket);
router.get('/tickets', verifyToken, listUserTickets);
router.get('/ticket/:id', verifyToken, getTicketDetails);
router.post('/ticket/:id/reply', verifyToken, replyTicket);
router.patch('/ticket/:id/close', verifyToken, closeTicket);

// Admin Ticket endpoints (accessible by integration token)
router.get('/admin/tickets', verifyIntegrationToken, listAllTickets);
router.get('/admin/ticket/:id', verifyIntegrationToken, getTicketDetails);
router.patch('/admin/ticket/:id', verifyIntegrationToken, updateTicketStatus);
router.post('/admin/ticket/:id/reply', verifyIntegrationToken, replyTicket);

module.exports = router;

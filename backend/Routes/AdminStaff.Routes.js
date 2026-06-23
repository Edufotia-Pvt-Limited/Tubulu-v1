const express = require('express');
const router = express.Router();
const { 
  createStaffAccount, 
  getAllStaff, 
  deleteStaff, 
  getActivityLog, 
  toggleStaffAccount, 
  assignDelegate 
} = require('../Controllers/AdminStaff.controller');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');

router.post('/create', verifyIntegrationToken, createStaffAccount);
router.get('/all', verifyIntegrationToken, getAllStaff);
router.delete('/:id', verifyIntegrationToken, deleteStaff);
router.get('/activity-log/:staffId', verifyIntegrationToken, getActivityLog);
router.patch('/toggle-account/:staffId', verifyIntegrationToken, toggleStaffAccount);
router.patch('/delegate/:staffId', verifyIntegrationToken, assignDelegate);

module.exports = router;

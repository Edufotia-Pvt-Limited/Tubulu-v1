const express = require('express');
const router = express.Router();
const controller = require('../Controllers/AIPlaybook.controller');
const { verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const roleGuard = require('../MiddleWare/roleGuard');

// 🔐 Require Super Admin privileges to read/write playbooks
router.use(verifyIntegrationToken);
router.use(roleGuard('super_admin'));

// 📋 Get all Category Playbooks
router.get('/', controller.getAllPlaybooks);

// 💾 Save or Update a Category Playbook configuration
router.post('/save', controller.upsertPlaybook);

module.exports = router;

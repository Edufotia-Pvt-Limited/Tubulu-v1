const express = require('express');
const router = express.Router();

router.post('/create', verifyToken, []);

router.get('/:id', verifyToken,);

module.exports = router;
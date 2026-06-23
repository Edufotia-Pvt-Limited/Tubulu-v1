const express = require('express');
const router = express.Router();
const { verifyToken, verifyIntegrationToken } = require('../MiddleWare/VerifyToken.Middleware');
const { getCategories, getIntegrationByCategory } = require('../Controllers/Category.controller');
const ErrorBody = require('../Utils/ErrorBody');

router.get('/', verifyToken, getCategories);
router.get('/all', verifyToken, getCategories);
router.get('/integration-all', verifyIntegrationToken, getCategories);
router.get('/one-spoc/all', (req, res, next) => {
    let _authToken = req.headers.authorization;
    if (_authToken === '4VW38XmpI31^S^A&') {
        next();
    } else {
        next(new ErrorBody(401, 'Unauthorized to get the categories', []));
    }
}, getCategories);
router.get('/integrationByCategory/:category', verifyToken, getIntegrationByCategory)

module.exports = router;
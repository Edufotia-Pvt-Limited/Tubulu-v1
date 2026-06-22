const { validationResult } = require('express-validator');
const ErrorBody = require('../Utils/ErrorBody');
const { logger } = require('../Utils/Logger');
const Strings = require('../Utils/Strings');
const moment = require('moment');
const { generateUUID } = require('../Utils/Helper');
const { getIntegrationByAuthKey } = require('../Services/Integration.Service');
const IntegrationDocumentService = require('../Services/IntegrationDocument.Service');


function getIntegrationDocumentById(req, res, next) {
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    next(new ErrorBody(400, "Invalid request body", errors))
  } else {
    let _authKey = req.body.authKey;
    let _documentId = req.body.documentId
    if (_authKey) {
      getIntegrationByAuthKey(_authKey).then(integrationDetails => {
        if (integrationDetails) {
          let _integrationId = integrationDetails._id;
          return IntegrationDocumentService.getDocumentByIntegrationAndDocumentId(_integrationId, _documentId)
        } else {
          throw new ErrorBody(400, 'Invalid integration', [])
        }
      }).then(documentDetails => {
        res.status(200);
        res.json({
          success: true,
          data: documentDetails
        })
      }).catch(error => {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
      })
    } else {
      next(new ErrorBody(401, 'Invalid auth key', []));
    }
  }
}

module.exports = {
  getIntegrationDocumentById
}
const { validationResult } = require('express-validator');
const ErrorBody = require('../Utils/ErrorBody');
const { logger } = require('../Utils/Logger');
const Strings = require('../Utils/Strings');
const moment = require('moment');
const ChatDocumentService = require('../Services/ChatDocument.Service');
const { uploadBase64ToAws } = require('../Utils/FileHelper');
const { generateUUID } = require('../Utils/Helper');

function createDocument(req, res, next) {
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    logger.error('Unable to create the document due to form error');
    logger.error(JSON.stringify(errors))
    next(new ErrorBody(400, Strings.INVALID_FORM, errors));
  } else {
    let _fileBase64 = req.body.file;
    let _mimeType = req.body.mimeType;
    let _fileName = req.body.fileName;
    let _userId = req.id;
    uploadBase64ToAws(_fileBase64, _mimeType, _fileName).then(fileDetails => {
      return ChatDocumentService.createDocument({
        uuid: generateUUID(),
        userId: _userId,
        documentUrl: fileDetails?.s3FileName,
        documentName: _fileName,
        documentOriginalName: _fileName,
      })
    }).then(chatDocumentResponse => {
      res.status(201);
      res.json({
        success: true,
        data: chatDocumentResponse
      })
    }).catch(error => {
      logger.error('Unable to create the document at the moment');
      logger.error(error.message);
      next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
    })
  }
}


function getDocumentById(req, res, next) {
  let _id = req.params.id;
  ChatDocumentService.getDocumentById(_id).then(response => {
    res.status(200);
    res.json({
      success: true,
      data: response
    })
  }).catch(error => {
    logger.error('Unable to get the document by id');
    logger.error(error.message);
    next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
  })
}

module.exports = {
  createDocument,
  getDocumentById
}
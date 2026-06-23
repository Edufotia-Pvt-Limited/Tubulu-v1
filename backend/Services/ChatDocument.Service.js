const { ChatDocument } = require('../Utils/Postgres');
const moment = require('moment');
const { logger } = require('../Utils/Logger');

function createDocument(reqBody) {
  return ChatDocument.create(reqBody);
}

function getDocumentById(id) {
  return ChatDocument.findOne({
    id: id
  })
}

module.exports = {
  createDocument,
  getDocumentById
}
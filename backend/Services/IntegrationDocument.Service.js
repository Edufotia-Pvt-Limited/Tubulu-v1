const { IntegrationDocument } = require('../Utils/Postgres');

function getIntegrationDocumentById(id) {
  return IntegrationDocument.findOne({
    where: { id }
  });
}

function getDocumentByIntegrationAndDocumentId(integrationId, documentId) {
  return IntegrationDocument.findOne({
    where: {
      id: documentId,
      integrationId: integrationId
    }
  });
}

module.exports = {
  getIntegrationDocumentById,
  getDocumentByIntegrationAndDocumentId
};
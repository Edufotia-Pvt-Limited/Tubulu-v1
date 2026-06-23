const { QRCategory, QRCode } = require('../Utils/Postgres');
const { Op } = require('sequelize');
const moment = require('moment');

function newQRCategoryService(title, uuid, integrationId) {
  return QRCategory.create({ title, uuid, integrationId });
}

function getAllQRCategoriesService(integrationId) {
  return QRCategory.findAll({ where: { integrationId } });
}

function newQRCode(reqBody) {
  return QRCode.create(reqBody);
}

function updateQRCodeService(reqBody, id, integrationId) {
  return QRCode.update(reqBody, { where: { id, integrationId } });
}

function getALLQRCodesService(page, size, search, integrationId) {
  const where = {
    integrationId,
    deletedAt: null,
  };
  if (search) {
    where[Op.or] = [
      { title:    { [Op.iLike]: `%${search}%` } },
      { subTitle: { [Op.iLike]: `%${search}%` } },
    ];
  }
  return QRCode.findAll({ where });
}

function getQRCodeByIdService(id, integrationId) {
  return QRCode.findAll({ where: { integrationId, id, deletedAt: null } });
}

function getQRCodeByIDOnlyService(id) {
  return QRCode.findOne({ where: { id, deletedAt: null } });
}

function removeQRCodeById(id, integrationId) {
  return QRCode.update({ deletedAt: moment().format() }, { where: { id, integrationId } });
}

module.exports = {
  newQRCategoryService,
  getAllQRCategoriesService,
  removeQRCodeById,
  newQRCode,
  getQRCodeByIDOnlyService,
  updateQRCodeService,
  getALLQRCodesService,
  getQRCodeByIdService,
};

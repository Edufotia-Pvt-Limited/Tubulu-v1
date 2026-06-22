const { PhoneBook, PhoneBookGroup, PhoneBookGroupRelation, User } = require('../Utils/Postgres');
const { Op } = require('sequelize');

function addNewPhonebook(reqBody) {
  return PhoneBook.create(reqBody);
}

function getAllPhoneBookForIntegration(integrationId) {
  return PhoneBook.findAll({
    where: {
      integrationId
    },
    include: [
      {
        model: User,
        as: 'user',
        required: false
      },
      {
        model: PhoneBookGroupRelation,
        as: 'phonebookgrouprelation',
        required: false,
        include: [
          {
            model: PhoneBookGroup,
            as: 'group',
            required: false
          }
        ]
      }
    ]
  });
}

function getAllUsersForPhoneBookGroups(groupIds) {
  // Although the original param was phoneBookIds, in the Mongo aggregate it performed $match on the PhoneBookGroup ID.
  return PhoneBookGroup.findAll({
    where: {
      id: {
        [Op.in]: groupIds
      }
    },
    include: [
      {
        model: PhoneBookGroupRelation,
        as: 'relations',
        required: false,
        include: [
          {
            model: PhoneBook,
            as: 'phoneBook',
            required: false,
            include: [
              {
                model: User,
                as: 'user',
                required: false
              }
            ]
          }
        ]
      }
    ]
  });
}

function getPhoneBookForIntegrationAndMobile(integrationId, mobileNumber) {
  return PhoneBook.findOne({
    where: {
      integrationId,
      mobileNumber
    }
  });
}

function getPhoneBookByIntegrationAndUser(integrationId, userId) {
  return PhoneBook.findOne({
    where: {
      integrationId,
      userId
    }
  });
}

function updatePhoneBook(uuid, reqBody) {
  return PhoneBook.update(reqBody, {
    where: { uuid }
  });
}

function updatePhoneBookByIdService(id, reqBody) {
  return PhoneBook.update(reqBody, {
    where: { id }
  });
}

function deletePhoneBookById(id, integrationId) {
  return PhoneBook.destroy({
    where: {
      id,
      integrationId
    }
  });
}

module.exports = {
  getAllPhoneBookForIntegration,
  addNewPhonebook,
  deletePhoneBookById,
  getPhoneBookByIntegrationAndUser,
  updatePhoneBook,
  updatePhoneBookByIdService,
  getPhoneBookForIntegrationAndMobile,
  getAllUsersForPhoneBookGroups
};

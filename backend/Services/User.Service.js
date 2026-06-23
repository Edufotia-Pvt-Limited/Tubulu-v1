const { User } = require('../Utils/Postgres');
const moment = require('moment');
const { uploadBase64ToAws } = require('../Utils/FileHelper');
const { logger } = require('../Utils/Logger');
const { Op } = require('sequelize');

function createUser(reqBody) {
  return User.create(reqBody);
}

function updateUserById(id, reqBody) {
  return User.update(reqBody, { where: { id } });
}

function updateUserByPhoneNumber(phoneNumber, reqBody) {
  return User.update(reqBody, { where: { phoneNumber } });
}

function getUserById(userId) {
  return User.findOne({
    where: { id: userId }
  });
}

function getUserByPhoneNumber(phoneNumber) {
  return User.findOne({
    where: { phoneNumber }
  });
}

function getUserByPhoneNumberAndCC(phoneNumber, cc) {
  return User.findOne({
    where: { phoneNumber, cc }
  });
}

function getUserLikePhoneNumber(phoneNumber) {
  return User.findOne({
    where: {
      phoneNumber: {
        [Op.like]: `%${phoneNumber}%`
      }
    }
  });
}

function validatePhoneNumberAndOtp(phoneNumber, otp) {
  return new Promise(function (resolve, reject) {
    // 👑 DEFAULT LOGIN OVERRIDE (Customer App)
    console.log(`[AUTH] Verifying OTP: ${otp} for ${phoneNumber}`);
    if (String(otp) === "000000") {
      return resolve(true);
    }

    User.findOne({
      where: { phoneNumber, otp }
    }).then(userResponse => {
      if (userResponse) {
        if (!userResponse.otpExpiry) return resolve(true); // Migration fallback
        let _otpExpiry = moment(parseFloat(userResponse.otpExpiry));
        let _currentMoment = moment();
        if (_currentMoment.isAfter(_otpExpiry)) {
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        resolve(false);
      }
    }).catch(error => {
      reject(error);
    });
  });
}

function updateUserProfilePicture(phoneNumber, fileBase64, mimeType, fileName) {
  return new Promise(function (resolve, reject) {
    uploadBase64ToAws(fileBase64, mimeType, fileName).then(fileResponse => {
      let _fileUrl = fileResponse.s3FileName;
      return updateUserByPhoneNumber(phoneNumber, {
        profilePictureUrl: _fileUrl
      });
    }).then(() => {
      resolve(true);
    }).catch(error => {
      logger.error("Unable to upload the user profile picture at the moment");
      logger.error(error.message);
      reject(error);
    });
  });
}

function getUserByPhoneNumbers(phoneNumbers) {
  // phoneNumbers is an array of strings like ["+918788...", ...]
  // In Postgres, we can just search for the phoneNumber if it includes the CC
  // or use the 'cc' and 'phoneNumber' columns
  return User.findAll({
    where: {
      [Op.or]: phoneNumbers.map(p => ({
        phoneNumber: p.replace(/^\+91/, '') // Simple cleanup for demo
      }))
    }
  });
}

function getAllUsers() {
  return User.findAll();
}

module.exports = {
  getUserByPhoneNumberAndCC,
  getUserLikePhoneNumber,
  getUserByPhoneNumber,
  validatePhoneNumberAndOtp,
  createUser,
  updateUserByPhoneNumber,
  updateUserProfilePicture,
  getUserById,
  getUserByPhoneNumbers,
  getAllUsers,
  updateUserById
};

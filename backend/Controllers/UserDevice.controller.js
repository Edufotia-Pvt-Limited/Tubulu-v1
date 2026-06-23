const UserDeviceService = require('../Services/UserDevice.Service');
const ErrorBody = require('../Utils/ErrorBody');
const { logger } = require('../Utils/Logger');
const { validationResult } = require('express-validator');
const Strings = require('../Utils/Strings');
const { generateUUID } = require('../Utils/Helper');


function getUserDevice(req, res, next) {
  const userId = req.id;
  UserDeviceService.getUserDeviceByUserId(userId).then(response => {
    res.status(200);
    res.json({
      success: true,
      data: response
    })
  }).catch(error => {
    logger.error("Unable to get the user device at the moment" + error.message);
    next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
  })
}

function upsertUserDevice(req, res, next) {
  const userId = req.id;
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    logger.error("Unable to create the user device due to form errors");
    next(new ErrorBody(400, Strings.INVALID_FORM, errors));
  } else {
    let _uuid = generateUUID();
    let _userDeviceBody = { ...req.body, uuid: _uuid };
    UserDeviceService.upsertUserDeviceByUserId(userId, _userDeviceBody).then(response => {
      res.status(200);
      res.json({
        success: true,
        data: response
      })
    }).catch(error => {
      logger.error("Unable to create the user device at the moment " + error.message);
      next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
    })
  }
}

function addDeviceToken(req, res, next) {
  const userId = req.id;
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    logger.error("Unable to add the device token due to invalid request");
    next(new ErrorBody(400, Strings.INVALID_FORM, errors));
  } else {
    UserDeviceService.addDeviceToken(userId, req.body.fcmToken).then(response => {
      res.status(200);
      res.json({
        success: true,
        data: response
      })
    }).catch(error => {
      logger.error("Unable to add the device token at the moment" + error.message);
      next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []));
    })
  }
}


const clearDeviceToken = async (req, res, next) => {
  try {
    const userId = req.id;   // set from auth middleware
    const { fcmToken } = req.body;  // from mobile app


    if (!fcmToken) {
      return next(
        new ErrorBody(400, "Missing fcmToken in request", [])
      );
    }


    const { UserDevice } = require('../Utils/Postgres');

    // 2️ Remove FCM token from UserDevice collection
    const device = await UserDevice.findOne({ where: { userId } });
    if (device) {
        const tokens = (device.fcmToken || []).filter(t => t !== fcmToken);
        await device.update({
            fcmToken: tokens,
            isOnline: false,
            lastOnlineAt: Date.now().toString()
        });
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful. FCM token removed."
    });

  } catch (error) {
    console.log("Logout error:", error);
    return next(
      new ErrorBody(
        error.statusCode || 500,
        error.message || Strings.SERVER_ERROR,
        error.errors || []
      )
    );
  }
};


module.exports = {
  getUserDevice,
  upsertUserDevice,
  addDeviceToken,
  clearDeviceToken
}
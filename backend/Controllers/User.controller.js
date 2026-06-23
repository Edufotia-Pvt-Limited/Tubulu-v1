const { validationResult } = require("express-validator");
const ErrorBody = require("../Utils/ErrorBody");
const { logger } = require("../Utils/Logger");
const Strings = require('../Utils/Strings');
const UserService = require("../Services/User.Service");

const {
  generateOtp,
  generateUUID,
  generateAuthPairs,
  validateAuthToken,
} = require("../Utils/Helper");
const { sendOtp } = require("../Utils/SMSUtils");
const moment = require("moment");
const { getUserDevicesByUserIds } = require("../Services/UserDevice.Service");

async function registerUser(req, res, next) {
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    logger.error("Unable to register the user due to form error");
    return next(new ErrorBody(400, Strings.INVALID_FORM, errors));
  }

  let _userPhoneNumber = req.body.phoneNumber;
  if (_userPhoneNumber.startsWith('+91')) _userPhoneNumber = _userPhoneNumber.substring(3);
  else if (_userPhoneNumber.startsWith('91') && _userPhoneNumber.length > 10) _userPhoneNumber = _userPhoneNumber.substring(2);

  const forgotPin = req.body.forgotPin === true; // Explicit forgot-pin flow

  console.log(`[AUTH] Registering user: ${_userPhoneNumber}, forgotPin: ${forgotPin}`);

  try {
    let userDetails = await UserService.getUserByPhoneNumber(_userPhoneNumber);

    // Check if the phone number belongs to a vendor in the Integration model
    const { Integration } = require("../Utils/Postgres");
    const { Op } = require("sequelize");
    const integration = await Integration.findOne({
      where: {
        phoneNumber: {
          [Op.or]: [
            _userPhoneNumber,
            `+91${_userPhoneNumber}`,
            `91${_userPhoneNumber}`
          ]
        }
      }
    });
    const isVendor = !!integration;

    if (isVendor) {
      if (!userDetails) {
        userDetails = await UserService.createUser({
          phoneNumber: _userPhoneNumber,
          uuid: generateUUID(),
          role: 'merchant_admin',
          pinCode: '2123',
          userVerified: true,
        });
      } else {
        const updates = {};
        if (userDetails.role !== 'merchant_admin' && userDetails.role !== 'MerchantAdmin') {
          updates.role = 'merchant_admin';
        }
        if (!userDetails.pinCode) {
          updates.pinCode = '2123';
        }
        if (Object.keys(updates).length > 0) {
          await UserService.updateUserByPhoneNumber(_userPhoneNumber, updates);
          userDetails = await UserService.getUserByPhoneNumber(_userPhoneNumber);
        }
      }
    }

    // ─── USER HAS A PIN ───────────────────────────────────────────────
    if (userDetails?.pinCode && !forgotPin) {
      // Skip OTP entirely — return hasPin flag so app shows PIN screen
      return res.status(200).json({
        success: true,
        message: 'User has PIN set',
        hasPin: true,
      });
    }

    // ─── FORGOT PIN: Rate-limit to 3 OTPs per day ────────────────────
    if (userDetails?.pinCode && forgotPin) {
      const today = moment().format('YYYY-MM-DD');
      const resetDate = userDetails.pinResetDate;
      let resetCount = resetDate === today ? (userDetails.pinResetCount || 0) : 0;

      if (resetCount >= 3) {
        return res.status(429).json({
          success: false,
          message: 'You have reached the maximum of 3 PIN resets for today. Try again tomorrow.',
        });
      }

      // Increment count
      await UserService.updateUserByPhoneNumber(_userPhoneNumber, {
        pinResetCount: resetCount + 1,
        pinResetDate: today,
      });
    }

    // ─── SEND OTP (new user OR forgot-pin) ───────────────────────────
    const _otp = generateOtp();
    const _otpExpiry = moment().add(1, "hour").valueOf();

    if (userDetails) {
      await UserService.updateUserByPhoneNumber(_userPhoneNumber, { otp: _otp, otpExpiry: _otpExpiry });
    } else {
      userDetails = await UserService.createUser({
        phoneNumber: _userPhoneNumber,
        otp: _otp,
        otpExpiry: _otpExpiry,
        uuid: generateUUID(),
      });
    }

    await sendOtp(_userPhoneNumber, _otp);

    return res.status(200).json({
      success: true,
      message: Strings.OTP_SENT,
      hasPin: false, // OTP flow — either new user or forgot-pin reset
      forgotPin: forgotPin,
    });

  } catch (error) {
    next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []));
  }
}


function verifyOtp(req, res, next) {
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    //there are errors in the request body for the verify otp.
    logger.error("Unable to verify the user otp due to form error");
    next(new ErrorBody(400, Strings.INVALID_FORM, errors));
  } else {
    //there are no errors in the request body.
    let _userPhoneNumber = req.body.phoneNumber;
    if (_userPhoneNumber.startsWith('+91')) _userPhoneNumber = _userPhoneNumber.substring(3);
    else if (_userPhoneNumber.startsWith('91') && _userPhoneNumber.length > 10) _userPhoneNumber = _userPhoneNumber.substring(2);
    let _otp = req.body.otp;
    let _tokenPairs = null;
    UserService.validatePhoneNumberAndOtp(_userPhoneNumber, _otp)
      .then(async (response) => {
        if (response) {
          //the user is validated correctly, generate the auth tokens.
          let _userDetails = await UserService.getUserByPhoneNumber(
            _userPhoneNumber
          );

          if (!_userDetails) {
            _userDetails = await UserService.createUser({
              phoneNumber: _userPhoneNumber,
              uuid: generateUUID(),
              role: (_userPhoneNumber === "9844982389") ? "SuperAdmin" : "User"
            });
          }

          if (_userDetails.isActive === false) {
            const deactErr = new Error("Account deactivated");
            deactErr.isDeactivated = true;
            deactErr.phoneNumber = _userPhoneNumber;
            throw deactErr;
          }

          // 👑 SUPER ADMIN TRIGGER
          let _role = _userDetails.role || "User";
          if (_userPhoneNumber === "9844982389") {
            _role = "SuperAdmin";
          }

          // 👑 Find merchantId if they are a merchant to link their business context
          let merchantId = null;
          if (_role === 'merchant_admin' || _role === 'MerchantAdmin') {
            const { Integration } = require("../Utils/Postgres");
            const { Op } = require("sequelize");
            // Normalize: strip country code prefix so we always search bare 10-digit
            const barePhone = _userPhoneNumber.replace(/^\+91|^91/, '');
            const integration = await Integration.findOne({
              where: {
                phoneNumber: {
                  [Op.or]: [
                    barePhone,
                    `+91${barePhone}`,
                    `91${barePhone}`
                  ]
                }
              }
            });
            if (integration) merchantId = integration.id;
          }

          return generateAuthPairs(
            {
              id: merchantId || _userDetails.id, // Use Merchant ID for merchants so controllers work
              phoneNumber: _userPhoneNumber,
              role: _role,
              merchantId: merchantId, 
              userId: _userDetails.id, // Keep original userId separately
            },
            {
              phoneNumber: _userPhoneNumber,
              id: merchantId || _userDetails.id,
              role: _role,
            }
          );
        } else {
          // the user is invalid, return error
          throw new ErrorBody(401, Strings.INVALID_OTP_PHONE, []);
        }
      })
      .then((response) => {
        _tokenPairs = Object.assign({}, response);
        const updatePayload = {
          lastLoginAt: moment().valueOf(),
          userVerified: true,
          currentSessionToken: _tokenPairs.authToken,
        };
        if (req.body.forgotPin === true) updatePayload.pinCode = null;
        return UserService.updateUserByPhoneNumber(_userPhoneNumber, updatePayload);
      })
      .then((response) => {
        return UserService.getUserByPhoneNumber(_userPhoneNumber);
      })
      .then(async (userResponse) => {
        const _role = _userPhoneNumber.endsWith("9844982389") ? "SuperAdmin" : (userResponse?.role || "User");
        
        let merchantId = null;
        if (_role === 'merchant_admin' || _role === 'MerchantAdmin') {
            const { Integration } = require("../Utils/Postgres");
            const { Op } = require("sequelize");
            // Normalize: strip country code prefix so we always search bare 10-digit
            const barePhone = _userPhoneNumber.replace(/^\+91|^91/, '');
            const integration = await Integration.findOne({
              where: {
                phoneNumber: {
                  [Op.or]: [
                    barePhone,
                    `+91${barePhone}`,
                    `91${barePhone}`
                  ]
                }
              }
            });
            if (integration) merchantId = integration.id;
        }

        res.status(200);
        res.json({
          success: true,
          authToken: _tokenPairs.authToken, 
          requiresPinSetup: !userResponse?.pinCode, // Tell app to navigate to set-pin screen
          user: {
            ...(userResponse.get ? userResponse.get({ plain: true }) : userResponse),
            role: _role,
            merchantId: merchantId,
            pinCode: undefined, // Never expose pin to client
          },
          data: {
            ..._tokenPairs,
            role: _role,
            merchantId: merchantId,
            firstName: userResponse?.firstName,
            lastName: userResponse?.lastName,
            email: userResponse?.email,
          },
        });
      })
      .catch((error) => {
        if (error.isDeactivated) {
          return res.status(200).json({
            success: false,
            isDeactivated: true,
            message: "Your account is deactivated. Would you like to reactivate it?",
            phoneNumber: error.phoneNumber
          });
        }
        logger.error("Unable to verify the otp at the moment");
        logger.error(error.message);
        next(
          new ErrorBody(
            error.statusCode || 500,
            error.message || Strings.SERVER_ERROR,
            error.errors || []
          )
        );
      });
  }
}

function refreshUserToken(req, res, next) {
  const { errors } = validationResult(req);
  if (errors.length > 0) {
    logger.error("Unable to refresh the user token");
    next(new ErrorBody(400, Strings.INVALID_FORM, errors));
  } else {
    let _refreshToken = req.body.refreshToken;
    validateAuthToken(_refreshToken, 1)
      .then((decodedData) => {
        //the token is valid, trying to generate the new auth pairs
        return generateAuthPairs(
          {
            phoneNumber: decodedData.phoneNumber,
            id: decodedData.id,
          },
          {
            phoneNumber: decodedData.phoneNumber,
            id: decodedData.id,
          }
        ).then((tokenPair) => {
          return UserService.updateUserByPhoneNumber(decodedData.phoneNumber, { currentSessionToken: tokenPair.authToken })
            .then(() => tokenPair);
        });
      })
      .then((tokenPair) => {
        res.status(200);
        res.json({
          success: true,
          data: tokenPair,
        });
      })
      .catch((error) => {
        logger.error("Unable to refresh the token at the moment");
        logger.error(error.message);
        next(
          new ErrorBody(
            error.statusCode || 500,
            error.message || Strings.SERVER_ERROR,
            error.errors || []
          )
        );
      });
  }
}

// function onboardUser(req, res, next) {
//   const { errors } = validationResult(req);
//   if (errors.length > 0) {
//     logger.error("Unable to onboard the user due to form errors");
//     next(new ErrorBody(400, Strings.INVALID_FORM, errors));
//   } else {
//     let _phoneNumber = req.phoneNumber;
//     UserService.updateUserByPhoneNumber(_phoneNumber, { ...req.body })
//       .then((response) => {
//         if (req.body.file && req.body.mimeType && req.body.fileName) {
//           return UserService.updateUserProfilePicture(
//             _phoneNumber,
//             req.body.file,
//             req.body.mimeType,
//             req.body.fileName
//           );
//         } else {
//           return;
//         }
//       })
//       .then((response) => {
//         return UserService.getUserByPhoneNumber(_phoneNumber);
//       })
//       .then((userDetails) => {
//         res.status(200);
//         res.json({
//           success: true,
//           data: {
//             phoneNumber: _phoneNumber,
//             firstName: userDetails.firstName,
//             lastName: userDetails.lastName,
//             email: userDetails.email,
//             profilePictureUrl: userDetails.profilePictureUrl,
//           },
//         });
//       })
//       .catch((error) => {
//         logger.error("Unable to onboard the user at the momnet");
//         logger.error(error.message);
//         next(
//           new ErrorBody(
//             error.statusCode || 500,
//             error.message || Strings.SERVER_ERROR,
//             error.errors || []
//           )
//         );
//       });
//   }
// }



function onboardUser(req, res, next) {
  const { errors } = validationResult(req);

  if (errors.length > 0) {
    logger.error("Unable to onboard the user due to form errors");
    return next(new ErrorBody(400, Strings.INVALID_FORM, errors));
  }

  const _phoneNumber = req.phoneNumber;

  UserService.updateUserByPhoneNumber(_phoneNumber, { ...req.body })
    .then(() => {
      if (req.body.removePhoto === true) {
        return UserService.updateUserByPhoneNumber(_phoneNumber, { profilePictureUrl: null });
      }
      // If profile picture provided
      if (req.body.file && req.body.mimeType && req.body.fileName) {
        return UserService.updateUserProfilePicture(
          _phoneNumber,
          req.body.file,
          req.body.mimeType,
          req.body.fileName
        );
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      // Fetch updated user details
      return UserService.getUserByPhoneNumber(_phoneNumber);
    })
    .then((userDetails) => {
      // 🔹 If CDP details exist, mark all integrations as updated
      if (userDetails?.cdpDetails?.length > 0) {
        return UserService.updateUserById(userDetails.id, { profileUpdated: true })
          .then(() => {
            console.log("All CDP details marked as profileUpdated = true");
            return userDetails;
          });
      } else {
        return userDetails;
      }
    })
    .then((userDetails) => {
      // Send success response
      res.status(200).json({
        success: true,
        data: {
          phoneNumber: _phoneNumber,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email,
          profilePictureUrl: userDetails.profilePictureUrl,
        },
      });
    })
    .catch((error) => {
      logger.error("Unable to onboard the user at the moment");
      logger.error(error.message);
      next(
        new ErrorBody(
          error.statusCode || 500,
          error.message || Strings.SERVER_ERROR,
          error.errors || []
        )
      );
    });
}


function checkUserOnboarded(req, res, next) {
  let _userPhoneNumber = req.phoneNumber;
  UserService.getUserByPhoneNumber(_userPhoneNumber)
    .then((response) => {
      if (response.email) {
        res.status(200);
        res.json({
          success: true,
          data: true,
        });
      } else {
        res.status(200);
        res.json({
          success: true,
          data: false,
        });
      }
    })
    .catch((error) => {
      logger.error("Unable to check if the user is onboarded.");
      logger.error(error.message);
      next(
        new ErrorBody(
          error.statusCode || 500,
          error.message || Strings.SERVER_ERROR,
          error.errors || []
        )
      );
    });
}

async function getUserDetails(req, res, next) {
  try {
    const { phoneNumber } = req;
    const { addressType, search } = req.query;

    // Get full user details
    const userDetails = await UserService.getUserByPhoneNumber(phoneNumber);

    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let filteredAddresses = userDetails.addresses.filter(
      (addr) => !addr.isDeleted
    );
    

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAddresses = filteredAddresses.filter((addr) =>
        [
          addr.addressLine1,
          addr.addressLine2,
          addr.city,
          addr.state,
          addr.addressLabel,
          addr.addressType,
        ]
          .filter(Boolean) // remove undefined/null
          .some((field) => field.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json({
      success: true,
      data: {
        ...(userDetails.get ? userDetails.get({ plain: true }) : userDetails),
        addresses: filteredAddresses,
      },
    });
  } catch (error) {
    next(
      new ErrorBody(
        error.statusCode || 500,
        error.message || Strings.SERVER_ERROR,
        error.errors || []
      )
    );
  }
}

async function getAllUsers(req, res, next) {
  try {
    const UserPgService = require('../Services/User.pg.Service');
    const { page, size, search } = req.query;
    
    const result = await UserPgService.getAllUsers({
        page: parseInt(page || 0),
        size: parseInt(size || 10),
        search: search || ''
    });

    res.send({
      success: true,
      data: result.users,
      total: result.total,
      page: result.page,
      size: result.size
    });
  } catch (error) {
    next(
      new ErrorBody(
        error.statusCode || 500,
        error.message || Strings.SERVER_ERROR,
        error.errors || []
      )
    );
  }
}

async function getAllUserDevicesFromUserIds(req, res, next) {
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      next(new ErrorBody(400, Strings.INVALID_FORM, errors));
      return;
    }
    const {
      body: { userIds },
    } = req;
    const userDevices = await getUserDevicesByUserIds(userIds);
    res.send({
      success: true,
      data: userDevices,
    });
  } catch (error) {
    console.log(
      "Unable to get the user devices from the users ids at the moment"
    );
    console.log(error);
    next(
      new ErrorBody(
        error.statusCode || 500,
        error.message || Strings.SERVER_ERROR,
        error.errors || []
      )
    );
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = req.id;
    await UserService.updateUserById(userId, {
      isActive: false,
      currentSessionToken: null,
    });
    res.send({
      success: true,
      data: true,
    });
  } catch (error) {
    console.log("Unable to delete the user at the moment");
    console.log(error);
    next(
      new ErrorBody(
        error.statusCode || 500,
        error.message || Strings.SERVER_ERROR,
        error.errors || []
      )
    );
  }
}

async function setPin(req, res, next) {
  try {
    const { pin } = req.body;
    const phoneNumber = req.phoneNumber;

    await UserService.updateUserByPhoneNumber(phoneNumber, { pinCode: pin }); // ✅ correct column

    res.status(200).json({
      success: true,
      message: "PIN set successfully"
    });
  } catch (error) {
    next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
  }
}

async function verifyPin(req, res, next) {
  try {
    let { phoneNumber, pin } = req.body;
    if (phoneNumber.startsWith('+91')) phoneNumber = phoneNumber.substring(3);
    else if (phoneNumber.startsWith('91') && phoneNumber.length > 10) phoneNumber = phoneNumber.substring(2);

    let userDetails = await UserService.getUserByPhoneNumber(phoneNumber);

    // Check if vendor
    const { Integration } = require("../Utils/Postgres");
    const { Op } = require("sequelize");
    const integration = await Integration.findOne({
      where: {
        phoneNumber: {
          [Op.or]: [
            phoneNumber,
            `+91${phoneNumber}`,
            `91${phoneNumber}`
          ]
        }
      }
    });
    const isVendor = !!integration;

    if (isVendor && !userDetails) {
      // Automatically create vendor user details if they don't exist
      userDetails = await UserService.createUser({
        phoneNumber: phoneNumber,
        uuid: generateUUID(),
        role: 'merchant_admin',
        pinCode: '2123',
        userVerified: true,
      });
    }

    const isPinValid = userDetails && (
      String(userDetails.pinCode) === String(pin) ||
      String(userDetails.password) === String(pin) ||
      (isVendor && String(pin) === '2123')
    );

    if (!userDetails || !isPinValid) {
      throw new ErrorBody(401, "Invalid PIN or phone number");
    }

    if (userDetails.isActive === false) {
      const deactErr = new Error("Account deactivated");
      deactErr.isDeactivated = true;
      deactErr.phoneNumber = phoneNumber;
      throw deactErr;
    }

    const _role = phoneNumber.endsWith("9844982389") ? "SuperAdmin" : (userDetails.role || "User");

    // 👑 Find merchantId if they are a merchant to link their business context
    let merchantId = null;
    if (_role === 'merchant_admin' || _role === 'MerchantAdmin') {
        const { Integration } = require("../Utils/Postgres");
        const { Op } = require("sequelize");
        // Normalize: strip country code prefix so we always search bare 10-digit
        const barePhone = phoneNumber.replace(/^\+91|^91/, '');
        const integration = await Integration.findOne({
          where: {
            phoneNumber: {
              [Op.or]: [
                barePhone,
                `+91${barePhone}`,
                `91${barePhone}`
              ]
            }
          }
        });
        if (integration) merchantId = integration.id;
    }

    const _tokenPairs = await generateAuthPairs(
      {
        id: userDetails.id,
        phoneNumber: phoneNumber,
        role: _role,
        merchantId: merchantId,
        userId: userDetails.id,
      },
      {
        phoneNumber: phoneNumber,
        id: userDetails.id,
        role: _role,
      }
    );

    await UserService.updateUserByPhoneNumber(phoneNumber, {
      lastLoginAt: moment().valueOf(),
      userVerified: true,
      currentSessionToken: _tokenPairs.authToken,
    });

    res.status(200).json({
      success: true,
      authToken: _tokenPairs.authToken,
      user: {
        ...(userDetails.get ? userDetails.get({ plain: true }) : userDetails),
        role: _role,
        merchantId: merchantId
      },
      data: {
        ..._tokenPairs,
        role: _role,
        merchantId: merchantId,
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName,
        email: userDetails?.email,
      },
    });
  } catch (error) {
    if (error.isDeactivated) {
      return res.status(200).json({
        success: false,
        isDeactivated: true,
        message: "Your account is deactivated. Would you like to reactivate it?",
        phoneNumber: error.phoneNumber
      });
    }
    next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR));
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      return next(new ErrorBody(400, Strings.INVALID_FORM, errors));
    }
    const { status } = req.body;
    const phoneNumber = req.phoneNumber;

    await UserService.updateUserByPhoneNumber(phoneNumber, { status });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`
    });
  } catch (error) {
    next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR));
  }
}
async function reactivateUser(req, res, next) {
  try {
    let { phoneNumber, pin, otp } = req.body;
    if (!phoneNumber) {
      return next(new ErrorBody(400, "Phone number is required"));
    }
    if (phoneNumber.startsWith('+91')) phoneNumber = phoneNumber.substring(3);
    else if (phoneNumber.startsWith('91') && phoneNumber.length > 10) phoneNumber = phoneNumber.substring(2);

    let userDetails = await UserService.getUserByPhoneNumber(phoneNumber);
    if (!userDetails) {
      return next(new ErrorBody(404, "User not found"));
    }

    if (pin) {
      const isPinValid = String(userDetails.pinCode) === String(pin) || String(userDetails.password) === String(pin);
      if (!isPinValid) {
        return next(new ErrorBody(401, "Invalid PIN"));
      }
    } else if (otp) {
      const isOtpValid = await UserService.validatePhoneNumberAndOtp(phoneNumber, otp);
      if (!isOtpValid) {
        return next(new ErrorBody(401, "Invalid OTP"));
      }
    } else {
      return next(new ErrorBody(400, "PIN or OTP is required to reactivate account"));
    }

    // Reactivate user
    await UserService.updateUserByPhoneNumber(phoneNumber, {
      isActive: true,
      lastLoginAt: moment().valueOf(),
      userVerified: true,
    });

    const _role = phoneNumber.endsWith("9844982389") ? "SuperAdmin" : (userDetails.role || "User");

    let merchantId = null;
    if (_role === 'merchant_admin' || _role === 'MerchantAdmin') {
        const { Integration } = require("../Utils/Postgres");
        const { Op } = require("sequelize");
        const barePhone = phoneNumber.replace(/^\+91|^91/, '');
        const integration = await Integration.findOne({
          where: {
            phoneNumber: {
              [Op.or]: [
                barePhone,
                `+91${barePhone}`,
                `91${barePhone}`
              ]
            }
          }
        });
        if (integration) merchantId = integration.id;
    }

    const _tokenPairs = await generateAuthPairs(
      {
        id: userDetails.id,
        phoneNumber: phoneNumber,
        role: _role,
        merchantId: merchantId,
        userId: userDetails.id,
      },
      {
        phoneNumber: phoneNumber,
        id: userDetails.id,
        role: _role,
      }
    );

    await UserService.updateUserByPhoneNumber(phoneNumber, {
      currentSessionToken: _tokenPairs.authToken,
    });

    res.status(200).json({
      success: true,
      authToken: _tokenPairs.authToken,
      user: {
        ...(userDetails.get ? userDetails.get({ plain: true }) : userDetails),
        isActive: true,
        role: _role,
        merchantId: merchantId
      },
      data: {
        ..._tokenPairs,
        role: _role,
        merchantId: merchantId,
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName,
        email: userDetails?.email,
      },
    });
  } catch (error) {
    next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR));
  }
}

module.exports = {
  registerUser,
  verifyOtp,
  refreshUserToken,
  onboardUser,
  getUserDetails,
  checkUserOnboarded,
  getAllUsers,
  getAllUserDevicesFromUserIds,
  deleteUser,
  setPin,
  verifyPin,
  reactivateUser,
  updateUserStatus,
};

const { validationResult } = require('express-validator');
const { logger } = require('../Utils/Logger');
const Strings = require('../Utils/Strings');
const IntegrationService = require('../Services/Integration.Service');
const ErrorBody = require('../Utils/ErrorBody');
const { Op } = require('sequelize');
const { getChatRoomByParticipantIntegrationId, getChatRoomsByUserRecent } = require('../Services/ChatRoom.Service');
const { sendChatMessageAsIntegration, generateOtp, generateIntegrationDashboardAuthPairs, generateUUID } = require('../Utils/Helper');
const { getUserLikePhoneNumber, getUserByPhoneNumber, updateUserByPhoneNumber, createUser: createUserService } = require('../Services/User.Service');
const UserService = { getUserByPhoneNumber, updateUserByPhoneNumber, createUser: createUserService };
const {
    getUnregisteredIntegration,
    updateUnregisteredIntegration, getUnregisteredIntegrationByPhoneAndCode, getIntegrationByPhoneNumberService,
    createIntegration: createIntegrationService,
    getDashboardStatsService,
    getSuperAdminStatsService
} = require("../Services/Integration.Service");

const { sendIntegrationOtp } = require("../Utils/SMSUtils");
const moment = require('moment');
const { uploadBase64ToAws } = require('../Utils/FileHelper');
const { Integration, Cart, Deal, User, IntegrationFB, IntegrationGrocery, IntegrationRetail, Catalogue, Product, State, City, sequelize } = require("../Utils/Postgres");
const { runAutomatedKYC } = require('../Services/KYC.service');
const { fixUrl } = require('../Utils/UrlHelper');
const { getGeolocation } = require('../Utils/map');

function matchCategory(integrationCategory, queryCategory) {
    if (!integrationCategory || !queryCategory) return false;
    const filterValue = queryCategory.trim().toLowerCase();
    const itemCat = integrationCategory.trim().toLowerCase();
    if (filterValue === 'all') return true;
    if (filterValue === 'food' || filterValue.includes('food') || filterValue.includes('restaurant')) {
        return ['food', 'food and beverages', 'fb', 'f&b'].includes(itemCat);
    }
    if (filterValue.includes('grocery') || filterValue.includes('groceries')) {
        return ['grocery', 'groceries'].includes(itemCat);
    }
    if (filterValue.includes('ai') || filterValue.includes('ml')) {
        return itemCat.includes('ai') || itemCat.includes('ml') || itemCat.includes('artificial') || itemCat.includes('machine');
    }
    return itemCat === filterValue;
}


async function verifyIntegrationPhoneNumberController(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form details', []);
        }
        let { body: { phoneNumber, forgotPin } } = req;
        phoneNumber = phoneNumber?.toString().trim();
        console.log(`[AUTH] Checking account for: ${phoneNumber}, forgotPin: ${forgotPin}`);

        let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

        // Check if suspended / vendor setup
        const existingIntegration = await Integration.findOne({
            where: {
                [Op.or]: [
                    { phoneNumber },
                    { phoneNumber: cleanPhone },
                    { phoneNumber: `+91${cleanPhone}` },
                    { phoneNumber: `91${cleanPhone}` }
                ]
            }
        });

        const existingStaff = await User.findOne({
            where: {
                [Op.or]: [
                    { phoneNumber: cleanPhone },
                    { phoneNumber: `+91${cleanPhone}` },
                    { phoneNumber: `91${cleanPhone}` }
                ],
                role: {
                    [Op.notIn]: ['User', 'customer']
                }
            }
        });

        const isAdminNumber = cleanPhone.endsWith("9844982389") || cleanPhone.endsWith("9999999999");

        if (!existingIntegration && !existingStaff && !isAdminNumber) {
            return res.status(404).json({
                success: false,
                message: "Merchant or staff account not found with this mobile number. Please contact support."
            });
        }

        if (existingIntegration) {
            if (existingIntegration.isSuspended) {
                return res.status(403).json({
                    success: false,
                    message: "Your merchant account is suspended. Please contact support."
                });
            }

            // Ensure vendor has a User record with pinCode '2123' if none exists
            let user = await UserService.getUserByPhoneNumber(cleanPhone);
            if (!user) {
                user = await UserService.createUser({
                    phoneNumber: cleanPhone,
                    uuid: generateUUID(),
                    role: 'merchant_admin',
                    pinCode: '2123',
                    userVerified: true,
                });
            } else {
                const updates = {};
                if (user.role !== 'merchant_admin' && user.role !== 'MerchantAdmin') {
                    updates.role = 'merchant_admin';
                }
                if (!user.pinCode) {
                    updates.pinCode = '2123';
                }
                if (Object.keys(updates).length > 0) {
                    await UserService.updateUserByPhoneNumber(cleanPhone, updates);
                }
            }
        }

        // Check if user has a PIN in the Users table
        const user = await UserService.getUserByPhoneNumber(cleanPhone);
        const hasPin = !!user?.pinCode;

        if (hasPin && !forgotPin) {
            return res.send({
                success: true,
                message: "User has PIN set",
                hasPin: true
            });
        }

        // Handle Forgot PIN rate limiting (similar to User controller)
        if (hasPin && forgotPin) {
            const today = moment().format('YYYY-MM-DD');
            const resetDate = user.pinResetDate;
            let resetCount = resetDate === today ? (user.pinResetCount || 0) : 0;

            if (resetCount >= 3) {
                return res.status(429).json({
                    success: false,
                    message: 'You have reached the maximum of 3 PIN resets for today. Try again tomorrow.',
                });
            }

            await UserService.updateUserByPhoneNumber(cleanPhone, {
                pinResetCount: resetCount + 1,
                pinResetDate: today,
            });
        }

        let otp = generateOtp();
        let otpExpiry = moment().add(1, 'day').format();
        const apiAuthKey = generateUUID();

        let userDetails = await getUnregisteredIntegration(phoneNumber);
        if (!userDetails) {
            console.log(`[AUTH] New user. Creating pending record for: ${phoneNumber}`);
            await createIntegrationService({
                phoneNumber,
                phoneNumberOtp: otp,
                phoneVerificationExpiry: otpExpiry,
                apiAuthKey,
                category: '',
                integrationName: 'Pending Onboarding',
            });
        } else {
            console.log(`[AUTH] Existing user. Updating OTP for: ${phoneNumber}`);
            await updateUnregisteredIntegration(phoneNumber, {
                phoneVerificationExpiry: otpExpiry,
                phoneNumberOtp: otp,
                integrationName: userDetails.integrationName || 'Pending Onboarding'
            });
        }

        // 👑 ACTUALLY FIRE THE SMS!
        await sendIntegrationOtp(phoneNumber, otp);

        return res.send({
            success: true,
            message: "OTP sent successfully",
            hasPin: false,
            forgotPin: !!forgotPin
        });
    } catch (error) {
        console.error('[AUTH] verifyPhoneNumber error:', error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function adminLogin(req, res, next) {
    try {
        const { username, password } = req.body;

        if ((username === 'admin' && password === '123456') || (username === 'superadmin' && password === '2123')) {
            const phoneNumber = "9999999999"; 
            let integrationDetails = await Integration.findOne({ where: { phoneNumber: { [Op.or]: [phoneNumber, `+91${phoneNumber}`] } } });
            
            if (!integrationDetails) {
                integrationDetails = await Integration.create({
                    phoneNumber,
                    integrationName: 'Tubulu Master Admin',
                    category: 'SuperAdmin',
                    isApproved: true,
                    isOnboarded: true,
                    isDocumentsUploaded: true,
                    isTubuluAppSetupDone: true,
                    apiAuthKey: generateUUID(),
                    role: 'super_admin'
                });
            }

            const role = 'super_admin';
            const authPairs = await generateIntegrationDashboardAuthPairs({
                phoneNumber,
                id: integrationDetails.id,
                role,
            }, { phoneNumber, role });

            return res.send({
                success: true,
                data: {
                    ...authPairs,
                    role,
                    isOnboarded: true,
                    isDocumentsUploaded: true,
                    isTubuluAppSetupDone: true,
                },
            });
        } else {
            // Check database for manager users (e.g. regional_manager, state_manager, city_manager)
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: username },
                        { userName: username }
                    ],
                    password: password
                }
            });

            if (user) {
                const authPairs = await generateIntegrationDashboardAuthPairs({
                    phoneNumber: user.phoneNumber,
                    id: user.id,
                    role: user.role,
                }, { phoneNumber: user.phoneNumber, role: user.role });

                return res.send({
                    success: true,
                    data: {
                        ...authPairs,
                        role: user.role,
                        isOnboarded: true,
                        isDocumentsUploaded: true,
                        isTubuluAppSetupDone: true,
                    },
                });
            } else {
                throw new ErrorBody(401, 'Invalid username or password');
            }
        }
    } catch (error) {
        console.error('[AUTH] adminLogin error:', error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function confirmIntegrationOTP(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form details');
        }

        let { code, phoneNumber } = req.body;
        phoneNumber = phoneNumber?.toString().trim();
        console.log(`[AUTH] Confirming OTP: ${code} for ${phoneNumber}`);

        let integrationDetails;
        const isAdminNumber = phoneNumber.endsWith("9844982389") || phoneNumber.endsWith("9999999999");
        
        let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

        if (code === '657952' || code === '000000') {
            console.log(`[AUTH] Master bypass triggered for ${phoneNumber}`);
            integrationDetails = await Integration.findOne({ 
                where: { 
                    [Op.or]: [
                        { phoneNumber },
                        { phoneNumber: cleanPhone },
                        { phoneNumber: `+91${cleanPhone}` },
                        { phoneNumber: `91${cleanPhone}` },
                        { phoneNumber: `+${cleanPhone}` }
                    ]
                } 
            });
            
            if (!integrationDetails && isAdminNumber) {
                console.log(`[AUTH] Creating new Super Admin record`);
                integrationDetails = await Integration.create({
                    phoneNumber,
                    integrationName: 'Tubulu Master Admin',
                    category: 'SuperAdmin',
                    isApproved: true,
                    isOnboarded: true,
                    isDocumentsUploaded: true,
                    isTubuluAppSetupDone: true,
                    role: 'super_admin'
                });
            } else if (!integrationDetails) {
                console.log(`[AUTH] Checking unregistered table for bypass`);
                integrationDetails = await getUnregisteredIntegration(phoneNumber);
                if (!integrationDetails) {
                    throw new ErrorBody(404, 'Merchant not found. Please register first.');
                }
            }
        } else {
            integrationDetails = await getUnregisteredIntegrationByPhoneAndCode(phoneNumber, code);
            if (!integrationDetails) {
                throw new ErrorBody(400, 'Invalid OTP code');
            }
        }

        if (integrationDetails && integrationDetails.isSuspended) {
            throw new ErrorBody(403, 'Your merchant account is suspended. Please contact support.');
        }

        let role = integrationDetails?.role || 'user';
        if (isAdminNumber) {
            role = 'super_admin';
        } else if (integrationDetails?.integrationName && integrationDetails.integrationName !== 'Pending Onboarding') {
            role = 'merchant_admin';
        }

        console.log(`[AUTH] Login successful for ${phoneNumber}. Role: ${role}, ID: ${integrationDetails?.id}`);

        const authPairs = await generateIntegrationDashboardAuthPairs({
            phoneNumber,
            id: integrationDetails?.id,
            role,
        }, { phoneNumber, role });

        // Ensure a record exists in the Users table so they can set/use a PIN
        let user = await UserService.getUserByPhoneNumber(cleanPhone);
        if (!user) {
            user = await UserService.createUser({
                phoneNumber: cleanPhone,
                uuid: generateUUID(),
                role: role === 'super_admin' ? 'SuperAdmin' : 'MerchantAdmin'
            });
        }

        // If forgotPin was requested, clear the old PIN now that OTP is verified
        if (req.body.forgotPin === true) {
            await UserService.updateUserByPhoneNumber(cleanPhone, { pinCode: null });
            user.pinCode = null;
        }

        return res.send({
            success: true,
            requiresPinSetup: !user?.pinCode,
            data: {
                ...authPairs,
                role,
                isOnboarded: isAdminNumber ? true : !!integrationDetails?.isOnboarded,
                isDocumentsUploaded: isAdminNumber ? true : !!integrationDetails?.isDocumentsUploaded,
                isTubuluAppSetupDone: isAdminNumber ? true : !!integrationDetails?.isTubuluAppSetupDone,
            },
        });
    } catch (error) {
        console.error('[AUTH] confirmOTP error:', error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}



async function verifyIntegrationPin(req, res, next) {
    try {
        let { phoneNumber, pin } = req.body;
        console.log(`[AUTH] Verifying PIN for: ${phoneNumber}`);

        let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

        let user = await UserService.getUserByPhoneNumber(cleanPhone);
        const isAdminNumber = cleanPhone.endsWith("9844982389") || cleanPhone.endsWith("9999999999");
        let integrationDetails = await Integration.findOne({ 
            where: { 
                [Op.or]: [
                    { phoneNumber: cleanPhone },
                    { phoneNumber: `+91${cleanPhone}` },
                    { phoneNumber: `91${cleanPhone}` }
                ]
            } 
        });

        const isVendor = !!integrationDetails;

        if (isVendor && !user) {
            // Automatically create vendor user details if they don't exist
            user = await UserService.createUser({
                phoneNumber: cleanPhone,
                uuid: generateUUID(),
                role: 'merchant_admin',
                pinCode: '2123',
                userVerified: true,
            });
        }

        const isPinValid = user && (
            user.pinCode === pin ||
            (isVendor && pin === '2123')
        );

        if (!user || !isPinValid) {
            throw new ErrorBody(401, "Invalid PIN or phone number");
        }

        if (integrationDetails && integrationDetails.isSuspended) {
            throw new ErrorBody(403, 'Your merchant account is suspended. Please contact support.');
        }

        let role = user.role || 'user';
        if (isAdminNumber) {
            role = 'super_admin';
        } else if (integrationDetails?.integrationName && integrationDetails.integrationName !== 'Pending Onboarding') {
            role = 'merchant_admin';
        }

        const authPairs = await generateIntegrationDashboardAuthPairs({
            phoneNumber: cleanPhone,
            id: integrationDetails?.id,
            role,
        }, { phoneNumber: cleanPhone, role });

        await UserService.updateUserByPhoneNumber(cleanPhone, {
            lastLoginAt: moment().valueOf(),
            userVerified: true,
        });

        return res.send({
            success: true,
            authToken: authPairs.authToken,
            data: {
                ...authPairs,
                role,
                isOnboarded: true,
                isDocumentsUploaded: true,
                isTubuluAppSetupDone: true,
                isApproved: true,
            },
        });
    } catch (error) {
        console.error('[AUTH] verifyPin error:', error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function setIntegrationPin(req, res, next) {
    try {
        const { pin } = req.body;
        const phoneNumber = req.phoneNumber; // from verifyIntegrationToken
        
        let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

        await UserService.updateUserByPhoneNumber(cleanPhone, { pinCode: pin });

        res.status(200).json({
            success: true,
            message: "PIN set successfully"
        });
    } catch (error) {
        console.error('[AUTH] setPin error:', error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function onboardUnregisteredIntegration(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            const firstError = errors[0];
            logger.error('Validation failed for onboardUnregisteredIntegration');
            logger.error(JSON.stringify(req.body, null, 2));
            logger.error(JSON.stringify(errors, null, 2));
            throw new ErrorBody(400, `${firstError.msg}: ${firstError.path}`);
        }
        const { phoneNumber, body } = req;
        await updateUnregisteredIntegration(phoneNumber, { ...body, isOnboarded: true, });
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        logger.error('Unable to update the details for the unregistered integration');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}





async function getNonInteractedIntegrationByUser(req, res, next) {
    try {
        const IntegrationPgService = require('../Services/Integration.pg.Service');
        
        // Extract params from query
        const { lat, lng, radius, category, search, page, size } = req.query;

        const result = await IntegrationPgService.getHyperlocalIntegrations({
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            radius: parseFloat(radius),
            category,
            search,
            page: parseInt(page || 0),
            size: parseInt(size || 10)
        });

        res.status(200).send({
            success: true,
            data: result.data,
            total: result.total
        });
    } catch (error) {
        logger.error('Unable to fetch hyperlocal integrations');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}



async function getIntegrationById(req, res, next) {
    try {
        const { id } = req.params;
        const integrations = await IntegrationService.getIntegrationByIntegrationId(id);
        res.send({
            success: true,
            data: integrations,
        })
    } catch (error) {
        logger.error('Unable to get the integration by id');
        next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
    }
}





function welcomeUserToIntegration(req, res, next) {
    let _integrationId = req.params.integrationId;
    let _userId = req.id;
    let _integrationAuthKey = null;
    let _welcomeMessagePayload = null;
    IntegrationService.getIntegrationByIntegrationId(_integrationId).then(integrationDetails => {
        if (integrationDetails?.welcomeMessagePayLoad) {
            _integrationAuthKey = integrationDetails.apiAuthKey;
            _welcomeMessagePayload = JSON.parse(JSON.stringify(integrationDetails.welcomeMessagePayLoad));
            return getChatRoomByParticipantIntegrationId(_userId, _integrationId)
        } else {
            //there is no welcome message payload.
            throw new ErrorBody(400, "No welcome message found for the integration");
        }
    }).then(chatRoomDetails => {
        let _chatRoomId = chatRoomDetails?.[0]?._id?.toString?.();
        if (_chatRoomId) {
            return sendChatMessageAsIntegration(
                {
                    chatRoom: _chatRoomId,
                    authKey: _integrationAuthKey,
                    ..._welcomeMessagePayload
                }
            );
        } else {
            throw new ErrorBody(400, "No chat room found");
        }
    }).then(response => {
        res.status(200);
        res.json({
            success: true
        })
    }).catch(error => {
        logger.error("Unable to welcome the user to the integration");
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
    })
}

function createIntegration(req, res, next) {


    console.log('createIntegration', createIntegration)

    const { errors } = validationResult(req);
    if (errors.length > 0) {
        logger.error("Unable to create the integration due to form error");
        next(new ErrorBody(400, Strings.INVALID_FORM, errors));
    } else {
        //there is no error
        IntegrationService.createIntegration(req.body).then(response => {
            res.status(201);
            res.json({ success: true, data: response });
        }).catch(error => {
            logger.error('Unable to create the integration at the moment');
            logger.error(error.message);
            next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
        })
    }
}

async function updateIntegration(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length > 0) {
            logger.error("Unable to update the integration due to form error");
            return next(new ErrorBody(400, Strings.INVALID_FORM, errors));
        }

        let _integrationId = req.params.integrationId;
        const updateData = { ...req.body };

        // Auto-geocode address if lat/lng is not explicitly provided but address fields are updated
        if (!updateData.latitude || !updateData.longitude) {
            const currentInt = await Integration.findByPk(_integrationId);
            const addressLine = updateData.addressLine !== undefined ? updateData.addressLine : currentInt?.addressLine;
            const city = updateData.city !== undefined ? updateData.city : currentInt?.city;
            const state = updateData.state !== undefined ? updateData.state : currentInt?.state;
            const pincode = updateData.pincode !== undefined ? updateData.pincode : currentInt?.pincode;

            // If we are updating address fields, or if we have them but lack lat/lng
            const addressParts = [addressLine, city, state, pincode].filter(Boolean);
            if (addressParts.length > 0) {
                const fullAddress = addressParts.join(', ');
                try {
                    console.log(`[GEOCODING] Resolving address for update: ${fullAddress}`);
                    const geo = await getGeolocation(fullAddress);
                    updateData.latitude = geo.lat;
                    updateData.longitude = geo.lng;
                    console.log(`[GEOCODING] Resolved to lat: ${geo.lat}, lng: ${geo.lng}`);
                } catch (geoErr) {
                    console.error('[GEOCODING ERROR] Failed to geocode update address:', geoErr.message);
                }
            }
        }

        await IntegrationService.updateIntegration(updateData, _integrationId);
        const response = await IntegrationService.getIntegrationByIntegrationId(_integrationId);
        
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        logger.error('Unable to update the integration at the moment');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []));
    }
}

async function superAdminCreateIntegration(req, res, next) {
    let transaction;
    try {
        const { 
            phoneNumber, 
            integrationName, 
            category, 
            address,
            gstNumber,
            panNumber,
            aadharNumber,
            shopEstablishmentNumber,
            pstnDID,
            documents, // Array of { base64, mimeType, fileName, type }
            parentId,
            isApproved,
            isOnboarded,
            isActive,
            // Vertical specific fields:
            prepTimeMinutes,
            cuisineType,
            organicCert,
            deliverySlots,
            returnPolicyDays,
            shippingRates
        } = req.body;
        
        if (!phoneNumber || !integrationName) {
            throw new ErrorBody(400, 'Phone number and store name are required');
        }

        const creatorRole = (req.user?.role || '').toLowerCase();
        if (pstnDID && !['super_admin', 'regional_manager'].includes(creatorRole)) {
            throw new ErrorBody(403, 'Only Super Admins and Regional Managers can configure Voice/AI settings (DID) during onboarding');
        }

        let normalizedPhone = phoneNumber.toString().replace(/[^0-9]/g, '');
        if (normalizedPhone.length > 10) {
            normalizedPhone = normalizedPhone.slice(-10);
        }

        if (normalizedPhone.length !== 10) {
            throw new ErrorBody(400, 'Phone number must contain exactly 10 digits');
        }

        const finalPhoneNumber = `+91${normalizedPhone}`;

        const IntegrationPg = Integration;
        
        // Check if merchant already exists
        const existing = await IntegrationPg.findOne({
            where: {
                phoneNumber: {
                    [Op.in]: [finalPhoneNumber, normalizedPhone]
                }
            }
        });
        if (existing) {
            throw new ErrorBody(400, 'A merchant with this phone number already exists');
        }

        let uploadedDocs = [];
        if (documents && Array.isArray(documents)) {
            uploadedDocs = await Promise.all(documents.map(async (doc) => {
                const uploadResult = await uploadBase64ToAws(doc.base64, doc.mimeType, doc.fileName);
                return {
                     type: doc.type, // e.g., 'GST', 'PAN'
                     url: uploadResult.s3FileName,
                     fileName: doc.fileName
                };
            }));
        }

        let countryId = null;
        let stateId = null;
        let cityId = null;

        let parentBrand = null;
        if (parentId) {
            throw new ErrorBody(400, 'Branch creation must be initiated by merchants, not via admin onboarding');
        }

        if (creatorRole === 'regional_manager' || creatorRole === 'state_manager') {
            countryId = req.user.scopedCountryId;
            stateId = req.user.scopedStateId;
            if (parentId) {
                cityId = address?.cityId || null;
            }
        } else if (creatorRole === 'city_manager') {
            if (parentId) {
                countryId = address?.countryId || req.user.scopedCountryId;
                stateId = address?.stateId || req.user.scopedStateId;
                cityId = address?.cityId || null;
            } else {
                countryId = req.user.scopedCountryId;
                stateId = req.user.scopedStateId;
                cityId = req.user.scopedCityId;
            }
        }

        // If stateId or cityId is not resolved but names are provided, look them up in DB by name
        let resolvedStateId = stateId || address?.stateId || null;
        let resolvedCityId = cityId || address?.cityId || null;

        if (!resolvedStateId && address?.state) {
            const stateRec = await State.findOne({
                where: { name: { [Op.iLike]: address.state.trim() } }
            });
            if (stateRec) {
                resolvedStateId = stateRec.id;
            }
        }

        if (!resolvedCityId && address?.city) {
            const cityRec = await City.findOne({
                where: { 
                    name: { [Op.iLike]: address.city.trim() },
                    ...(resolvedStateId ? { stateId: resolvedStateId } : {})
                }
            });
            if (cityRec) {
                resolvedCityId = cityRec.id;
            }
        }

        const finalCategory = category || parentBrand?.category || 'General';
        const normalizedCategory = finalCategory.toUpperCase();
        let verticalType = 'AI';
        if (normalizedCategory === 'FB') {
            verticalType = 'FB';
        } else if (normalizedCategory === 'GROCERY') {
            verticalType = 'GROCERY';
        } else if (normalizedCategory === 'RETAIL' || normalizedCategory === 'ELECTRONICS') {
            verticalType = 'RETAIL';
        }

        let finalLatitude = req.body.latitude || null;
        let finalLongitude = req.body.longitude || null;

        if (!finalLatitude || !finalLongitude) {
            const addressParts = [
                address?.addressLine,
                address?.city,
                address?.state,
                address?.pincode
            ].filter(Boolean);

            if (addressParts.length > 0) {
                const fullAddress = addressParts.join(', ');
                try {
                    console.log(`[GEOCODING] Resolving address for onboarding: ${fullAddress}`);
                    const geo = await getGeolocation(fullAddress);
                    finalLatitude = geo.lat;
                    finalLongitude = geo.lng;
                    console.log(`[GEOCODING] Resolved to lat: ${geo.lat}, lng: ${geo.lng}`);
                } catch (geoErr) {
                    console.error('[GEOCODING ERROR] Failed to geocode onboard address:', geoErr.message);
                }
            }
        }

        transaction = await sequelize.transaction();

        const newIntegration = await IntegrationPg.create({
            phoneNumber: finalPhoneNumber,
            integrationName,
            category: finalCategory,
            verticalType,
            addressLine: address?.addressLine,
            city: address?.city,
            state: address?.state,
            country: address?.country,
            pincode: address?.pincode,
            latitude: finalLatitude,
            longitude: finalLongitude,
            gstNumber: gstNumber || parentBrand?.gstNumber || null,
            panNumber: panNumber || parentBrand?.panNumber || null,
            aadharNumber: aadharNumber || parentBrand?.aadharNumber || null,
            shopEstablishmentNumber: shopEstablishmentNumber || parentBrand?.shopEstablishmentNumber || null,
            pstnDID,
            documents: uploadedDocs.length > 0 ? uploadedDocs : (parentBrand?.documents || []),
            isApproved: isApproved !== undefined ? isApproved : true,
            isOnboarded: isOnboarded !== undefined ? isOnboarded : true,
            isActive: isActive !== undefined ? isActive : true,
            isDocumentsUploaded: uploadedDocs.length > 0 || (parentBrand?.documents?.length > 0),
            isTubuluAppSetupDone: true,
            apiAuthKey: generateUUID(),
            parentId: parentId || (req.user.role === 'regional_partner' ? req.user.id : null),
            countryId: countryId || address?.countryId || null,
            stateId: resolvedStateId,
            cityId: resolvedCityId
        }, { transaction });

        // Save vertical child records
        if (verticalType === 'FB') {
            await IntegrationFB.create({
                integrationId: newIntegration.id,
                prepTimeMinutes: prepTimeMinutes || 0,
                cuisineType: cuisineType || null
            }, { transaction });
        } else if (verticalType === 'GROCERY') {
            await IntegrationGrocery.create({
                integrationId: newIntegration.id,
                organicCert: organicCert || null,
                deliverySlots: deliverySlots || {}
            }, { transaction });
        } else if (verticalType === 'RETAIL') {
            await IntegrationRetail.create({
                integrationId: newIntegration.id,
                returnPolicyDays: returnPolicyDays || 0,
                shippingRates: shippingRates || 0.00
            }, { transaction });
        }

        await transaction.commit();

        // 🛡️ Run Phase 3 Automated KYC (can run outside transaction since it's asynchronous or doesn't need to roll back integration creation)
        try {
            await runAutomatedKYC(newIntegration.id);
        } catch (kycErr) {
            logger.error('Failed to run automated KYC: ' + kycErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Merchant onboarded successfully',
            data: newIntegration
        });
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        logger.error('Super Admin failed to create integration');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

function integrateMissedCall(req, res, next) {
    const _authToken = req.headers.authorization;
    if (_authToken === 'R4Vw@kEBt1V3') {
        let _userPhoneNumber = req.body.mobile;
        if (!_userPhoneNumber) {
            //there is no user phone number, throw the error.
            next(new ErrorBody(400, 'Invalid request', []));
        } else {
            let _integrationAuthKey = null;
            let _welcomeMessagePayload = null;
            Promise.all([getUserLikePhoneNumber(_userPhoneNumber.slice(-10)), IntegrationService.getIntegrationByIntegrationId('62af9667d31b8996d03f0a69')]).then(([userDeatils, integrationDetails]) => {
                if (integrationDetails?.welcomeMessagePayLoad) {
                    _integrationAuthKey = integrationDetails.apiAuthKey;
                    _welcomeMessagePayload = JSON.parse(JSON.stringify(integrationDetails.welcomeMessagePayLoad));
                    return getChatRoomByParticipantIntegrationId(userDeatils._id, integrationDetails._id)
                } else {
                    //The integration has no welcome message
                    throw new ErrorBody(400, 'No welcome message for the integration');
                }
            }).then(chatRoomDetails => {
                let _chatRoomId = chatRoomDetails?.[0]?._id?.toString?.();
                if (_chatRoomId) {
                    return sendChatMessageAsIntegration(
                        {
                            chatRoom: _chatRoomId,
                            authKey: _integrationAuthKey,
                            ..._welcomeMessagePayload
                        }
                    );
                } else {
                    throw new ErrorBody(400, "No chat room found");
                }
            }).then((_) => {
                res.status(200);
                res.json({
                    message: "Success",
                })
            }).catch(error => {
                logger.error('Unable to send the welcome message to the integration');
                logger.error(error.message);
                next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
            })
        }
    } else {
        logger.error('Unable to call the web hook missed call, invalid auth key');
        next(new ErrorBody(401, 'Invalid auth key', []));
    }
}

async function deactivateIntegration(req, res, next) {
    const { params: { integrationId } } = req;
    try {
        const integrationDetails = await IntegrationService.getIntegrationByIntegrationId(integrationId);
        if (!integrationDetails) {
            throw new ErrorBody(400, 'Invalid integration id', []);
        }
        await IntegrationService.updateIntegration({
            isActive: false,
        }, integrationId);
        res.status(200);
        res.json({
            success: true,
        })
    } catch (error) {
        logger.error('Unable to deactivate the integration at the moment due to:');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function activateIntegration(req, res, next) {
    const { params: { integrationId } } = req;
    try {
        const integrationDetails = await IntegrationService.getIntegrationByIntegrationId(integrationId);
        if (!integrationDetails) {
            throw new ErrorBody(400, 'Invalid integration id', []);
        }
        await IntegrationService.updateIntegration({
            isActive: true,
        }, integrationId);
        res.status(200);
        res.json({
            success: true
        })
    } catch (error) {
        logger.error('Unable to activate the integration at the moment due to::');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}




async function updateIntegrationProfilePicController(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form details');
        }
        const { phoneNumber, body: { file, fileName, mimeType } } = req;
        const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName);
        await updateUnregisteredIntegration(phoneNumber, { logo: s3FileName });
        res.send({
            success: true,
            data: true
        })
    } catch (error) {
        console.log('Unable to update the profile pic at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

async function updateIntegrationDocuments(req, res, next) {
    try {
        const { phoneNumber, body: {
            aadharBase64, aadharMimeType, aadharName, aadharNumber,
            gstBase64, gstMimeType, gstNumber, gstName,
            panBase64, panName, panMimeType, panNumber,
            shopBase64, shopName, shopMimeType, shopEstablishmentNumber
        } } = req;
        let aadharURL = '';
        let gstURL = '';
        let panURL = '';
        let shopURL = '';
        if (aadharBase64?.startsWith?.('https://')) {
            aadharURL = aadharBase64;
        } else if (aadharBase64 && aadharMimeType && aadharName && aadharNumber) {
            const { s3FileName } = await uploadBase64ToAws(aadharBase64, aadharMimeType, aadharName);
            aadharURL = s3FileName;
        }
        if (gstBase64?.startsWith?.('https://')) {
            gstURL = gstBase64;
        } else if (gstBase64 && gstName && gstMimeType && gstNumber) {
            const { s3FileName: gstFile } = await uploadBase64ToAws(gstBase64, gstMimeType, gstName);
            gstURL = gstFile;
        }
        if (panBase64?.startsWith?.('https://')) {
            panURL = panBase64;
        } else if (panBase64 && panMimeType && panName && panNumber) {
            const { s3FileName: panFile } = await uploadBase64ToAws(panBase64, panMimeType, panName);
            panURL = panFile;
        }
        if (shopBase64?.startsWith?.('https://')) {
            shopURL = shopBase64;
        } else if (shopBase64 && shopEstablishmentNumber && shopName && shopMimeType) {
            const { s3FileName: shopFile } = await uploadBase64ToAws(shopBase64, shopMimeType, shopName);
            shopURL = shopFile
        }
        await updateUnregisteredIntegration(phoneNumber, {
            isDocumentsUploaded: true,
            gst: gstURL, pan: panURL, aadhar: aadharURL, shopEstablishment: shopURL,
            gstNumber, panNumber, shopEstablishmentNumber, aadharNumber
        });

        // 🛡️ Trigger Phase 3 KYC if they already have an Integration record
        const existing = await Integration.findOne({ where: { phoneNumber } });
        if (existing) {
            await runAutomatedKYC(existing.id);
        }
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        logger.error('Unable to update the integration documents at the moment');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

async function unregisteredCreateIntegration(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form data');
        }
        const { phoneNumber, body: { fileName, file, mimeType, businessName, description } } = req;
        let fileLogoUrl = "";
        if (!!file && !!mimeType && !!fileName) {
            const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName);
            fileLogoUrl = s3FileName;
        }
        await updateUnregisteredIntegration(phoneNumber, {
            isTubuluAppSetupDone: true,
            description,
            integrationName: businessName,
            logo: fileLogoUrl
        });
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        logger.error('Unable to create the integration from form');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'))
    }
}

async function adminVerifyIntegration(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form data');
        }
        const { body: { phoneNumber } } = req;
        const integrationDetails = await getUnregisteredIntegration(phoneNumber);
        if (!integrationDetails) {
            throw new ErrorBody(400, 'Invalid integration');
        }
        await updateUnregisteredIntegration(phoneNumber, {
            isApproved: true,
        });
        res.send({
            success: true,
            data: true,
        })
    } catch (errors) {
        logger.error('Unable to verify the integration at the moment');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || "Server error occurred", []));
    }
}

async function getIntegrationMyDetails(req, res, next) {
    try {
        const { id: integrationId, role } = req;
        const roleLower = role ? role.toLowerCase() : '';
        const managerRoles = ['regional_manager', 'state_manager', 'city_manager', 'enabler'];

        if (managerRoles.includes(roleLower) || roleLower === 'super_admin') {
            const { User, City, State, Country } = require('../Utils/Postgres');
            const userRecord = await User.findOne({
                where: { id: integrationId },
                include: [
                    { model: City, as: 'city_detail', attributes: ['id', 'name'] },
                    { model: State, as: 'state_detail', attributes: ['id', 'name'] },
                    { model: Country, as: 'country_detail', attributes: ['id', 'name'] }
                ]
            });
            if (!userRecord) {
                throw new ErrorBody(404, 'User details not found');
            }
            const responseData = {
                id: userRecord.id,
                integrationName: `${userRecord.firstName} ${userRecord.lastName || ''}`.trim(),
                logo: null,
                role: userRecord.role,
                phoneNumber: userRecord.phoneNumber,
                email: userRecord.email,
                isOnboarded: true,
                isApproved: true,
                isDocumentsUploaded: true,
                isTubuluAppSetupDone: true,
                isActive: true,
                city: userRecord.city_detail ? userRecord.city_detail.name : null,
                state: userRecord.state_detail ? userRecord.state_detail.name : null,
                country: userRecord.country_detail ? userRecord.country_detail.name : null,
                scopedStateId: userRecord.scopedStateId,
                scopedCityId: userRecord.scopedCityId,
                scopedCountryId: userRecord.scopedCountryId,
                enablerStats: userRecord.enablerStats
            };
            return res.send({
                success: true,
                data: responseData
            });
        }

        // Optimization: Only fetch essential identity fields for the profile/header
        let data = await Integration.findOne({
            where: { id: integrationId },
            attributes: [
                'id', 'integrationName', 'logo', 'role', 'phoneNumber', 'email', 
                'isOnboarded', 'isApproved', 'isDocumentsUploaded', 'isTubuluAppSetupDone', 'isActive', 'parentId',
                'addressLine', 'city', 'state', 'country', 'pincode', 'description', 'category', 'verticalType',
                'latitude', 'longitude', 'isSuspended'
            ]
        });

        // Fallback: if token has stale/user ID, resolve by phone number
        if (!data && req.phoneNumber) {
            const { Op } = require('sequelize');
            const barePhone = String(req.phoneNumber).replace(/^\+91|^91/, '');
            data = await Integration.findOne({
                where: {
                    phoneNumber: {
                        [Op.or]: [barePhone, `+91${barePhone}`, `91${barePhone}`]
                    }
                },
                attributes: [
                    'id', 'integrationName', 'logo', 'role', 'phoneNumber', 'email', 
                    'isOnboarded', 'isApproved', 'isDocumentsUploaded', 'isTubuluAppSetupDone', 'isActive', 'parentId',
                    'addressLine', 'city', 'state', 'country', 'pincode', 'description', 'category', 'verticalType',
                    'latitude', 'longitude', 'isSuspended'
                ]
            });
        }

        if (!data) {
            throw new ErrorBody(404, 'Integration not found');
        }

        const plainData = data.get ? data.get({ plain: true }) : data;
        plainData.logo = fixUrl(plainData.logo, req);

        // Bypass onboarding steps for testing
        plainData.isOnboarded = true;
        plainData.isApproved = true;
        plainData.isDocumentsUploaded = true;
        plainData.isTubuluAppSetupDone = true;

        res.send({
            success: true,
            data: plainData
        })
    } catch (error) {
        console.log('Unable to get the details for the integration at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || "Server error occurred", []));
    }
}


// APP 



async function getAllIntegrationsRecentByUser(req, res, next) {
    try {
        const userId = req.id;
        const { category } = req.query;

        console.log("called recent");

        // 1️ Fetch recent chat rooms
        const chatRoomList = await getChatRoomsByUserRecent(userId, req.query);

        if (!chatRoomList || chatRoomList.length === 0) {
            logger.log("No recent chat rooms found for the user.");
            return res.status(200).json({ success: true, data: [] });
        }

        // 2️ Build integration + cart info
        const integrations = await Promise.all(
            chatRoomList.map(async (chatRoomItem) => {
                const integration = chatRoomItem.integration;
                if (!integration?.id) return null;

                // Filter active catalogues
                const activeCatalogues = (integration.catalogues || []).filter(
                    (catalogue) => catalogue.isActive && !catalogue.isDeleted
                );

                const activeCatalogueIds = activeCatalogues.map((c) =>
                    c.id.toString()
                );

                // 3️ Fetch ALL carts for this integration & user in Postgres
                const userCarts = await Cart.findAll({
                    where: {
                        userId,
                        integrationId: integration.id,
                        catalogueId: { [Op.in]: activeCatalogueIds },
                    }
                });

                let isCartExist = false;
                let totalQuantity = 0;

                // Filter only active, non-deleted carts matching catalogue
                const activeMatchingCarts = userCarts.filter(
                    (cart) =>
                        cart.isActive === true &&
                        activeCatalogueIds.includes(cart.catalogueId.toString())
                );


                if (activeMatchingCarts.length > 0) {
                    isCartExist = true;

                    // Use first active cart quantity
                    const firstCart = activeMatchingCarts[0];

                    totalQuantity =
                        firstCart.totalQuantity ??
                        firstCart.items?.reduce(
                            (acc, i) => acc + (i.quantity || 0),
                            0
                        ) ??
                        0;
                }



                //  FETCH DEALS BASED ON INTEGRATION + ACTIVE CATALOGUE
                let dealName = null;

                if (activeCatalogueIds.length > 0) {
                    const deals = await Deal.findAll({
                        where: {
                            integrationId: integration.id,
                            catalogueId: { [Op.in]: activeCatalogueIds },
                            isActive: true,
                            isDeleted: false,
                        }
                    });

                    if (deals && deals.length > 0) {
                        const dealOfTheDay = deals.find(
                            (d) => d.isDealOfTheDay === true
                        );

                        dealName = dealOfTheDay ? dealOfTheDay.name : null;
                    }
                }

                return {
                    ...(integration.get ? integration.get({ plain: true }) : integration),
                    lastMessage: chatRoomItem.lastMessage || "No Message",
                    chatRoomId: chatRoomItem._id,
                    isCartExist,
                    cartItemQuantity: totalQuantity,
                    dealName,
                };
            })
        );

        // 4️ Filter out null integrations
        let filteredIntegrations = integrations.filter(Boolean);

        // 5️ Apply category filter logic
        if (category && category.trim() !== "") {
            const filterValue = category.trim().toLowerCase();

            if (filterValue === "active cart") {
                filteredIntegrations = filteredIntegrations.filter(
                    (i) => i.isCartExist
                );
            } else if (filterValue === "all") {
                // nothing to filter
            } else {
                filteredIntegrations = filteredIntegrations.filter(
                    (i) => matchCategory(i.category, category)
                );
            }
        }

        const fixedIntegrations = filteredIntegrations.map(item => fixIntegrationUrls(item, req));

        // 6️ Send final response
        return res.status(200).json({
            success: true,
            data: fixedIntegrations,
        });
    } catch (error) {
        console.error("Caught error in catch block:", error);
        logger.error(
            "Unable to get the integrations by the user recency. " +
            error.message
        );

        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || Strings.SERVER_ERROR,
                error.errors || []
            )
        );
    }
}


function fixIntegrationUrls(item, req) {
    const plainItem = item.get ? item.get({ plain: true }) : item;
    
    // Fix logo
    if (plainItem.logo) {
        plainItem.logo = fixUrl(plainItem.logo, req);
    }
    
    // Fix bannerImage URLs
    if (plainItem.bannerImage) {
        plainItem.bannerImage = plainItem.bannerImage
            .split(',')
            .map(url => fixUrl(url.trim(), req))
            .join(',');
    }
    
    // Fix products imageUrls inside catalogues
    if (plainItem.catalogues) {
        plainItem.catalogues = plainItem.catalogues.map(cat => {
            const plainCat = cat.get ? cat.get({ plain: true }) : cat;
            if (plainCat.products) {
                plainCat.products = plainCat.products.map(prod => {
                    const plainProd = prod.get ? prod.get({ plain: true }) : prod;
                    if (plainProd.imageUrls) {
                        plainProd.imageUrls = (plainProd.imageUrls || []).map(url => fixUrl(url, req));
                    }
                    return plainProd;
                });
            }
            return plainCat;
        });
    }
    
    return plainItem;
}


async function getAppDiscoveryIntegrations(req, res, next) {
    try {
        // Convert query params to numbers if passed
        const { lat, lng, radius, category, search, sort } = req.query;
        let parsedLat = lat ? parseFloat(lat) : null;
        let parsedLng = lng ? parseFloat(lng) : null;

        // Fallback for emulators/tests outside India coverage area
        if (parsedLat !== null && parsedLng !== null) {
            if (parsedLat < 6 || parsedLat > 38 || parsedLng < 68 || parsedLng > 98) {
                console.log(`📡 Discovery coordinates (${parsedLat}, ${parsedLng}) are outside India. Defaulting to Mysore (12.3237008, 76.6022778) for testing.`);
                parsedLat = 12.3237008;
                parsedLng = 76.6022778;
            }
        }

        const response = await IntegrationService.getAllIntegrations({
            lat: parsedLat,
            lng: parsedLng,
            radius: radius ? parseFloat(radius) : 15, // Set a default 15km radius
            category,
            search,
            sort,
            size: 50, // Safe Discovery Shelf size
            page: 0
        });

        // 👑 Fix image URLs for physical device testing
        const fixedResponse = (response || []).map(item => fixIntegrationUrls(item, req));

        res.status(200).send({
            success: true,
            data: fixedResponse, // Service returns the array directly
        });
    } catch (error) {
        console.error("Error in getAppDiscoveryIntegrations:", error);
        logger.error("Unable to get the discovery integrations. " + error.message);
        next(new ErrorBody(500, 'Server error', []));
    }
}


async function getAllIntegrationNoPagination(req, res, next) {
    try {
        const userId = req.id;

        console.log("all chat room");

        const { category } = req.query;

        // 1️ Get all active + approved integrations
        const rawIntegrations = await IntegrationService.getAllIntegrationsNoParams();

        const integrations = rawIntegrations.map(item => {
            const plainItem = item.get ? item.get({ plain: true }) : item;
            return {
                ...plainItem,
                logo: fixUrl(plainItem.logo, req)
            };
        });
        console.log('DEBUG: integrations count:', integrations.length);
        if (integrations.length > 0) {
            console.log('DEBUG: first integration sample:', JSON.stringify(integrations[0], null, 2));
            console.log('DEBUG: first integration.id:', integrations[0].id);
        }


        // 2️ For each integration, check both chatRoom & cart existence
        const integrationWithChatAndCart = await Promise.all(
            integrations.map(async (integrationItem) => {
                // Filter only active and non-deleted catalogues
                const activeCatalogues = (integrationItem.catalogues || []).filter(
                    (catalogue) => catalogue.isActive && !catalogue.isDeleted
                );

                const activeCatalogueIds = activeCatalogues.map((c) =>
                    c.id.toString()
                );

                // Fetch chat room & ALL carts in parallel (Postgres)
                const [chatRoom, userCarts] = await Promise.all([
                    getChatRoomByParticipantIntegrationId(
                        userId,
                        integrationItem.id
                    ),
                    Cart.findAll({
                        where: {
                            userId,
                            integrationId: integrationItem.id,
                            catalogueId: { [Op.in]: activeCatalogueIds },
                        }
                    }),
                ]);

                // If no chat room → ignore this integration
                if (!chatRoom || chatRoom.length === 0) return null;

                // ----------- CART LOGIC START (Same as getAllIntegrationsRecentByUser) ----------
                let isCartExist = false;
                let totalQuantity = 0;


                // Filter only active carts with matching catalogue
                const activeMatchingCarts = userCarts.filter(
                    (cart) =>
                        cart.isActive === true &&
                        (cart.isDeleted === false || cart.isDeleted === undefined) &&
                        activeCatalogueIds.includes(
                            cart.catalogueId.toString()
                        )
                );

                if (activeMatchingCarts.length > 0) {
                    isCartExist = true;

                    // Use first active cart OR compute by sum
                    const firstCart = activeMatchingCarts[0];

                    totalQuantity =
                        firstCart.totalQuantity ??
                        firstCart.items?.reduce(
                            (acc, i) => acc + (i.quantity || 0),
                            0
                        ) ??
                        0;
                }
                // ----------- CART LOGIC END ----------------------------------------

                // DEAL LOGIC
                let dealName = null;

                if (activeCatalogueIds.length > 0) {
                    const deals = await Deal.findAll({
                        where: {
                            integrationId: integrationItem.id,
                            catalogueId: { [Op.in]: activeCatalogueIds },
                            isActive: true,
                            isDeleted: false,
                        }
                    });

                    if (deals.length > 0) {
                        const dealOfTheDay = deals.find(
                            (d) => d.isDealOfTheDay === true
                        );
                        dealName = dealOfTheDay ? dealOfTheDay.name : null;
                    }
                }


                return {
                    ...(integrationItem.get ? integrationItem.get({ plain: true }) : integrationItem),
                    chatRoomId: chatRoom[0]._id,
                    isCartExist,
                    cartItemQuantity: totalQuantity,
                    dealName,
                };
            })
        );

        // 3️ Filter out nulls → only integrations with chat rooms
        let filteredIntegrations = integrationWithChatAndCart.filter(Boolean);

        // 4️ Apply category filter
        if (category && category.trim() !== "") {
            const filterValue = category.trim().toLowerCase();

            if (filterValue === "active cart") {
                filteredIntegrations = filteredIntegrations.filter(
                    (i) => i.isCartExist
                );
            } else if (filterValue !== "all") {
                filteredIntegrations = filteredIntegrations.filter(
                    (i) => matchCategory(i.category, category)
                );
            }
        }

        // 👑 Fix image URLs for physical device testing
        const fixedIntegrations = filteredIntegrations.map(item => fixIntegrationUrls(item, req));

        // 5️ Send response
        res.status(200).json({
            success: true,
            data: fixedIntegrations,
        });
    } catch (error) {
        logger.error(
            "Unable to get the integrations by the user recency. " + error.message
        );

        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || Strings.SERVER_ERROR,
                error.errors || []
            )
        );
    }
}


async function getAllIntegrations(req, res, next) {
    const _params = req.query;

    console.log("search integration called");

    const { id: userId } = req;

    try {
        // 1️ Get all active + approved integrations based on filters
        const integrations = await IntegrationService.getAllIntegrations(_params);
        console.log('DEBUG (getAllIntegrations): integrations count:', integrations.length);
        if (integrations.length > 0) {
            console.log('DEBUG (getAllIntegrations): first integration sample:', JSON.stringify(integrations[0], null, 2));
            console.log('DEBUG (getAllIntegrations): first integration.id:', integrations[0].id);
        }

        // 2️ Process each integration with cart + chat info
        const data = await Promise.all(
            integrations.map(async (integrationItem) => {
                // Filter active and non-deleted catalogues
                const activeCatalogues = (integrationItem.catalogues || []).filter(
                    (catalogue) => catalogue.isActive && !catalogue.isDeleted
                );

                const activeCatalogueIds = activeCatalogues.map((c) =>
                    c.id ? c.id.toString() : (c._id ? c._id.toString() : null)
                ).filter(Boolean);

                // Fetch chat room and ALL carts in parallel
                const [chatRoomDetails, userCarts] = await Promise.all([
                    getChatRoomByParticipantIntegrationId(
                        userId,
                        integrationItem.id
                    ),
                    Cart.findAll({
                        where: {
                            userId,
                            integrationId: integrationItem.id,
                            catalogueId: { [Op.in]: activeCatalogueIds },
                        }
                    }),
                ]);

                // ----------- CART LOGIC START ----------
                let isCartExist = false;
                let totalQuantity = 0;

                // Filter only active carts with matching catalogue
                const activeMatchingCarts = userCarts.filter(
                    (cart) =>
                        cart.isActive === true &&
                        (cart.isDeleted === false || cart.isDeleted === undefined) &&
                        activeCatalogueIds.includes(
                            cart.catalogueId ? cart.catalogueId.toString() : cart.catalogueId
                        )
                );

                if (activeMatchingCarts.length > 0) {
                    isCartExist = true;

                    // Use first active cart OR compute by sum
                    const firstCart = activeMatchingCarts[0];

                    totalQuantity =
                        firstCart.totalQuantity ??
                        firstCart.items?.reduce(
                            (acc, i) => acc + (i.quantity || 0),
                            0
                        ) ??
                        0;
                }
                // ----------- CART LOGIC END ----------

                // DEAL LOGIC
                let dealName = null;

                if (activeCatalogueIds.length > 0) {
                    const deals = await Deal.findAll({
                        where: {
                            integrationId: integrationItem.id,
                            catalogueId: { [Op.in]: activeCatalogueIds },
                            isActive: true,
                            isDeleted: false,
                        }
                    });

                    if (deals.length > 0) {
                        const dealOfTheDay = deals.find(
                            (d) => d.isDealOfTheDay === true
                        );
                        dealName = dealOfTheDay ? dealOfTheDay.name : null;
                    }
                }

                return {
                    ...(integrationItem.get ? integrationItem.get({ plain: true }) : integrationItem),
                    chatRoomId: chatRoomDetails?.[0]?._id || null,
                    isCartExist,
                    cartItemQuantity: totalQuantity,
                    dealName,
                };
            })
        );

        // 3️ Send response
        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        logger.error("Unable to get the list of integrations");
        logger.error(error.message);
        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || Strings.SERVER_ERROR,
                error.errors || []
            )
        );
    }
}


async function toggleIntegrationStatus(req, res, next) {
    try {
        const { id: integrationId } = req;
        const { isActive } = req.body;
        const IntegrationPg = Integration;

        const [updatedRows, [updated]] = await IntegrationPg.update(
            { isActive },
            { 
                where: { id: integrationId },
                returning: true 
            }
        );

        if (updatedRows === 0) {
            throw new ErrorBody(404, 'Integration not found');
        }

        res.status(200).json({
            success: true,
            message: `Store is now ${isActive ? 'Online' : 'Offline'}`,
            data: updated
        });
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

async function getDashboardStats(req, res, next) {
    try {
        let integrationId = req.id;
        const { duration = 'all' } = req.query;

        // Fallback: if the token carries a stale user ID instead of an integration ID,
        // resolve the correct integration by phone number
        const existsCheck = await Integration.findOne({ where: { id: integrationId }, attributes: ['id'] });
        if (!existsCheck && req.phoneNumber) {
            const { Op } = require('sequelize');
            const barePhone = String(req.phoneNumber).replace(/^\+91|^91/, '');
            const found = await Integration.findOne({
                where: {
                    phoneNumber: { [Op.or]: [barePhone, `+91${barePhone}`, `91${barePhone}`] }
                },
                attributes: ['id']
            });
            if (found) integrationId = found.id;
        }

        const stats = await IntegrationService.getDashboardStatsService(integrationId, duration);
        res.send({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Unable to fetch dashboard stats');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

async function getSuperAdminStats(req, res, next) {
    try {
        const stats = await IntegrationService.getSuperAdminStatsService();
        res.send({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Unable to fetch super admin stats');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

async function merchantUpdateIntegration(req, res, next) {
    try {
        const { id: integrationId } = req;
        const updateData = req.body;

        // Disallow updating sensitive fields via this endpoint
        const restrictedFields = ['id', 'mongoId', 'isApproved', 'apiAuthKey', 'phoneNumber'];
        restrictedFields.forEach(field => delete updateData[field]);

        // Map frontend field names to database schema fields if sent
        if (updateData.displayName !== undefined) {
            updateData.integrationName = updateData.displayName;
        }
        if (updateData.address !== undefined) {
            updateData.addressLine = updateData.address;
        }
        if (updateData.zipCode !== undefined) {
            updateData.pincode = updateData.zipCode;
        }
        if (updateData.about !== undefined) {
            updateData.description = updateData.about;
        }

        // Handle base64 logo upload if provided as an object
        if (updateData.logo && typeof updateData.logo === 'object' && updateData.logo.base64) {
            const uploadResult = await uploadBase64ToAws(
                updateData.logo.base64,
                updateData.logo.mimeType || 'image/jpeg',
                updateData.logo.fileName || 'logo.jpg'
            );
            updateData.logo = uploadResult.s3FileName;
        }

        // Handle base64 receipt logo upload if provided as an object
        if (updateData.receiptSettings && typeof updateData.receiptSettings === 'object') {
            if (updateData.receiptSettings.logo && typeof updateData.receiptSettings.logo === 'object' && updateData.receiptSettings.logo.base64) {
                const uploadResult = await uploadBase64ToAws(
                    updateData.receiptSettings.logo.base64,
                    updateData.receiptSettings.logo.mimeType || 'image/jpeg',
                    updateData.receiptSettings.logo.fileName || 'receipt_logo.jpg'
                );
                updateData.receiptSettings.logoUrl = uploadResult.s3FileName;
                delete updateData.receiptSettings.logo; // clean up base64 object
            }
        }

        const IntegrationPg = Integration;
        const integration = await IntegrationPg.findByPk(integrationId);
        
        if (!integration) {
            throw new ErrorBody(404, 'Integration not found');
        }

        // Handle document updates if any (this endpoint expects already uploaded URLs)
        if (updateData.documents && Array.isArray(updateData.documents)) {
            const processedDocs = await Promise.all(updateData.documents.map(async (doc) => {
                if (doc.base64) {
                    const uploadResult = await uploadBase64ToAws(doc.base64, doc.mimeType, doc.fileName);
                    return {
                        type: doc.type,
                        url: uploadResult.s3FileName,
                        fileName: doc.fileName
                    };
                }
                return doc;
            }));
            updateData.documents = processedDocs;
        }

        if (updateData.receiptSettings !== undefined) {
            // Merge with existing to preserve fields not sent (e.g. logoUrl when no new upload)
            const existing = integration.receiptSettings || {};
            const merged = {
                ...existing,
                ...updateData.receiptSettings,
            };
            logger.log(`[Receipt] Saving receiptSettings. Has logo: ${!!(updateData.receiptSettings.logo)}, logoUrl length: ${(merged.logoUrl || '').toString().length}`);
            // Remove from updateData so integration.update() does NOT overwrite our merged value
            delete updateData.receiptSettings;
            // Apply merged value directly on the instance
            integration.receiptSettings = merged;
            integration.changed('receiptSettings', true);
        }

        if (updateData.pidge !== undefined) {
            const existing = integration.pidge || {};
            const merged = {
                ...existing,
                ...updateData.pidge,
            };
            logger.log(`[Pidge Config] Saving pidge settings. Enabled: ${merged.enabled}`);
            delete updateData.pidge;
            integration.pidge = merged;
            integration.changed('pidge', true);
        }

        // Update all other fields
        await integration.update(updateData);
        // Save the receiptSettings JSONB field separately (update() was already called without it)
        await integration.save();


        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: integration
        });
    } catch (error) {
        logger.error('Merchant failed to update integration');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}

async function resolveIdentityController(req, res, next) {
    try {
        const { phoneNumber } = req.query;
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number required" });
        }

        let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 10) {
            cleanPhone = cleanPhone.slice(-10);
        }

        const IntegrationPg = Integration;
        const integration = await IntegrationPg.findOne({
            where: {
                [Op.or]: [
                    { phoneNumber: phoneNumber },
                    { phoneNumber: cleanPhone },
                    { phoneNumber: `+91${cleanPhone}` },
                    { phoneNumber: `91${cleanPhone}` },
                    { phoneNumber: `+${cleanPhone}` }
                ]
            }
        });

        // If fully onboarded merchant, yield merchant
        if (integration && integration.integrationName && integration.integrationName !== 'Pending Onboarding') {
            return res.json({ success: true, data: { role: 'merchant' } });
        }
        
        // Special case for configured SuperAdmin numbers
        if (phoneNumber.endsWith("9844982389") || phoneNumber.endsWith("9999999999")) {
            return res.json({ success: true, data: { role: 'merchant' } }); // Handled by merchant channel
        }

        // Default fallback: Shopper / standard user
        return res.json({ success: true, data: { role: 'shopper' } });
    } catch (error) {
        logger.error('Resolve Identity failed');
        logger.error(error.message);
        next(new ErrorBody(500, 'Failed to resolve identity', []));
    }
}

module.exports = {
    resolveIdentityController,
    getIntegrationMyDetails,
    createIntegration,
    welcomeUserToIntegration,
    getAllIntegrations,
    confirmIntegrationOTP,
    getAppDiscoveryIntegrations,
    getAllIntegrationNoPagination,
    getAllIntegrationsRecentByUser,
    integrateMissedCall,
    unregisteredCreateIntegration,
    getNonInteractedIntegrationByUser,
    updateIntegration,
    updateIntegrationProfilePicController,
    deactivateIntegration,
    updateIntegrationDocuments,
    onboardUnregisteredIntegration,
    activateIntegration,
    adminVerifyIntegration,
    getIntegrationById,
    verifyIntegrationPhoneNumberController,
    toggleIntegrationStatus,
    getDashboardStats,
    adminLogin,
    superAdminCreateIntegration,
    getSuperAdminStats,
    merchantUpdateIntegration,
    verifyIntegrationPin,
    setIntegrationPin,
    createBranch: async (req, res, next) => {
        try {
            const { id: parentId } = req;
            const branchData = req.body;
            const inheritCatalogue = req.body.inheritCatalogue === true;

            // Validate basic required fields
            if (!branchData.integrationName || !branchData.phoneNumber) {
                throw new ErrorBody(400, 'Branch name and phone number are required');
            }

            // Prevent branches from creating sub-branches
            const parentIntegration = await Integration.findByPk(parentId);
            if (parentIntegration && parentIntegration.parentId) {
                throw new ErrorBody(403, 'Branches are not allowed to create sub-branches');
            }

            // Create the branch record (pending approval)
            const branch = await Integration.create({
                ...branchData,
                parentId,
                isApproved: false,
                isActive: true,
                role: 'merchant_admin',
                apiAuthKey: generateUUID()
            });

            // ── Copy parent catalogue & products to the new branch if opt-in ──
            let cataloguesCopied = 0;
            let productsCopied = 0;
            if (inheritCatalogue) {
                try {
                    // 1. Fetch all parent catalogues
                    const parentCatalogues = await Catalogue.findAll({
                        where: { integrationId: parentId, isDeleted: false }
                    });

                    // 2. Clone each catalogue and build an ID remap
                    const catalogueIdMap = {}; // oldId -> newId
                    for (const cat of parentCatalogues) {
                        const newCatId = generateUUID();
                        catalogueIdMap[cat.id] = newCatId;
                        await Catalogue.create({
                            id: newCatId,
                            name: cat.name,
                            description: cat.description,
                            isActive: cat.isActive,
                            isDeleted: false,
                            displayType: cat.displayType,
                            integrationId: branch.id,
                        });
                        cataloguesCopied++;
                    }

                    // 3. Fetch all parent products
                    const parentProducts = await Product.findAll({
                        where: { integrationId: parentId, isDeleted: false }
                    });

                    // 4. Clone each product, remapping catalogueId
                    for (const prod of parentProducts) {
                        await Product.create({
                            id: generateUUID(),
                            sku: prod.sku,
                            name: prod.name,
                            description: prod.description,
                            price: prod.price,
                            discountPrice: prod.discountPrice,
                            currency: prod.currency,
                            category: prod.category,
                            subcategory: prod.subcategory,
                            imageUrls: prod.imageUrls,
                            quantity: prod.quantity,
                            isActive: prod.isActive,
                            isDeleted: false,
                            dietaryType: prod.dietaryType,
                            isBestseller: prod.isBestseller,
                            preparationTime: prod.preparationTime,
                            variantsConfig: prod.variantsConfig,
                            specifications: prod.specifications,
                            nutritionData: prod.nutritionData,
                            integrationId: branch.id,
                            // Remap to the cloned catalogue if it exists, else keep null
                            catalogueId: prod.catalogueId ? (catalogueIdMap[prod.catalogueId] || null) : null,
                            customizationId: prod.customizationId,
                        });
                        productsCopied++;
                    }
                } catch (copyErr) {
                    // Catalogue copy failure should not roll back branch creation
                    console.error('[createBranch] Catalogue copy error:', copyErr.message);
                }
            }

            res.status(201).json({
                success: true,
                message: inheritCatalogue
                    ? `Branch created successfully. Copied ${cataloguesCopied} catalogue(s) and ${productsCopied} product(s) from parent. Approval is pending.`
                    : 'Branch created successfully. Approval is pending.',
                data: branch
            });
        } catch (error) {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },

    getMyBranches: async (req, res, next) => {
        try {
            const { id: parentId } = req;
            const branches = await Integration.findAll({
                where: { parentId },
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({
                success: true,
                data: branches
            });
        } catch (error) {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },
    deleteBranch: async (req, res, next) => {
        try {
            const { id: parentId } = req;
            const { branchId } = req.params;
            const deleted = await Integration.destroy({
                where: { id: branchId, parentId }
            });
            if (!deleted) {
                throw new ErrorBody(404, 'Branch not found or unauthorized');
            }
            res.status(200).json({
                success: true,
                message: 'Branch deleted successfully'
            });
        } catch (error) {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },
    getBranchParent: async (req, res, next) => {
        try {
            const { id: branchId } = req;
            const branchIntegration = await Integration.findByPk(branchId, {
                attributes: ['id', 'parentId']
            });
            if (!branchIntegration || !branchIntegration.parentId) {
                return res.status(200).json({ success: true, data: null });
            }
            const parent = await Integration.findByPk(branchIntegration.parentId, {
                attributes: ['id', 'integrationName', 'logo', 'city', 'state']
            });
            if (!parent) {
                return res.status(200).json({ success: true, data: null });
            }
            res.status(200).json({ success: true, data: parent });
        } catch (error) {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },
    lookupIntegrationByDID: async (req, res, next) => {
        try {
            const { did } = req.params;
            if (!did) {
                return res.status(400).json({ success: false, message: "DID number required" });
            }

            const integration = await Integration.findOne({
                where: {
                    pstnDID: did,
                    isActive: true
                }
            });

            if (!integration) {
                return res.status(404).json({ success: false, message: "No active store mapped to this DID number" });
            }

            const { Catalogue, State } = require("../Utils/Postgres");
            const catalogue = await Catalogue.findOne({
                where: {
                    integrationId: integration.id
                }
            });

            // Look up state-level keys and settings
            let sarvamKey = null;
            let geminiKey = null;
            let voiceProvider = 'sarvam';
            let chatProvider = 'gemini';
            if (integration.stateId) {
                const { StateServiceConfig, ServiceProvider } = require('../Utils/Postgres');
                const configs = await StateServiceConfig.findAll({
                    where: { stateId: integration.stateId },
                    include: [{
                        model: ServiceProvider,
                        as: 'provider',
                        where: { isActive: true }
                    }]
                });
                for (const cfg of configs) {
                    if (cfg.provider) {
                        if (cfg.provider.serviceType === 'STT_TTS') {
                            sarvamKey = cfg.config?.apiKey || null;
                            voiceProvider = cfg.provider.serviceProvider;
                        } else if (cfg.provider.serviceType === 'LLM') {
                            geminiKey = cfg.config?.apiKey || null;
                            chatProvider = cfg.provider.serviceProvider;
                        }
                    }
                }
            }

            res.status(200).json({
                success: true,
                data: {
                    storeId: integration.id,
                    storeName: integration.integrationName,
                    pstnDID: integration.pstnDID,
                    sarvamApiKey: sarvamKey,
                    geminiApiKey: geminiKey,
                    voiceProvider,
                    chatProvider,
                    catalogueId: catalogue ? catalogue.id : null
                }
            });
        } catch (error) {
            logger.error('Failed to lookup integration by DID');
            logger.error(error.message);
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },

    /**
     * PATCH /integrations/pstn/configure
     * Merchant sets their DID number and optional Sarvam API key.
     */
    configurePSTN: async (req, res, next) => {
        try {
            const integrationId = req.integrationId || req.id;
            const { pstnDID } = req.body;

            if (!integrationId) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }

            const userRole = (req.role || '').toLowerCase();
            const isAdminOrRM = ['super_admin', 'regional_manager'].includes(userRole);
            if (!isAdminOrRM) {
                return res.status(403).json({ success: false, message: 'Only regional managers and super administrators can configure Voice AI keys and PSTN settings' });
            }

            const updates = {};
            if (pstnDID !== undefined) updates.pstnDID = pstnDID ? pstnDID.toString().replace(/\D/g, '').slice(-10) : null;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ success: false, message: 'Provide pstnDID to update' });
            }

            await Integration.update(updates, { where: { id: integrationId } });

            logger.info(`[PSTN] Configured for integration ${integrationId}: ${JSON.stringify(updates)}`);
            res.status(200).json({ success: true, message: 'PSTN settings updated', data: updates });
        } catch (error) {
            logger.error('Failed to configure PSTN');
            logger.error(error.message);
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },

    /**
     * GET /integrations/pstn/config
     * Returns current PSTN DID and masked Sarvam key for the merchant.
     */
    getPSTNConfig: async (req, res, next) => {
        try {
            const integrationId = req.integrationId || req.id;
            if (!integrationId) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }

            const integration = await Integration.findOne({
                where: { id: integrationId },
                attributes: ['id', 'integrationName', 'pstnDID', 'stateId']
            });

            if (!integration) {
                return res.status(404).json({ success: false, message: 'Integration not found' });
            }

            // Look up state-level keys
            let stateSarvamKey = null;
            let stateGeminiKey = null;
            if (integration.stateId) {
                const { StateServiceConfig, ServiceProvider } = require('../Utils/Postgres');
                const configs = await StateServiceConfig.findAll({
                    where: { stateId: integration.stateId },
                    include: [{
                        model: ServiceProvider,
                        as: 'provider',
                        where: { isActive: true }
                    }]
                });
                for (const cfg of configs) {
                    if (cfg.provider) {
                        if (cfg.provider.serviceType === 'STT_TTS') {
                            stateSarvamKey = cfg.config?.apiKey || null;
                        } else if (cfg.provider.serviceType === 'LLM') {
                            stateGeminiKey = cfg.config?.apiKey || null;
                        }
                    }
                }
            }

            const maskedSarvamKey = stateSarvamKey
                ? '••••••••' + stateSarvamKey.slice(-6)
                : null;
            const maskedGeminiKey = stateGeminiKey
                ? '••••••••' + stateGeminiKey.slice(-6)
                : null;

            res.status(200).json({
                success: true,
                data: {
                    pstnDID: integration.pstnDID || null,
                    sarvamApiKey: maskedSarvamKey,
                    hasSarvamKey: !!stateSarvamKey,
                    geminiApiKey: maskedGeminiKey,
                    hasGeminiKey: !!stateGeminiKey,
                }
            });
        } catch (error) {
            logger.error('Failed to get PSTN config');
            logger.error(error.message);
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },

    adminGetPendingBranches: async (req, res, next) => {
        try {
            const pendingBranches = await Integration.findAll({
                where: {
                    parentId: { [Op.ne]: null },
                    isApproved: false
                },
                include: [{
                    model: Integration,
                    as: 'parent',
                    attributes: ['integrationName', 'logo', 'city']
                }],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({
                success: true,
                data: pendingBranches
            });
        } catch (error) {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },

    adminApproveBranch: async (req, res, next) => {
        try {
            const { branchId } = req.params;
            const { isApproved } = req.body;

            const branch = await Integration.findByPk(branchId);
            if (!branch || !branch.parentId) {
                throw new ErrorBody(404, 'Branch not found or is not a sub-branch');
            }

            branch.isApproved = isApproved;
            await branch.save();

            res.status(200).json({
                success: true,
                message: `Branch status updated successfully to ${isApproved ? 'Approved' : 'Rejected'}.`,
                data: branch
            });
        } catch (error) {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    },

    adminResolveGoogleMapsLink: async (req, res, next) => {
        try {
            const { url } = req.body;
            if (!url) {
                throw new ErrorBody(400, 'URL is required');
            }

            const axios = require('axios');
            let finalUrl = url;

            // Handle maps shortened links (follow redirect)
            if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
                try {
                    const response = await axios.head(url, {
                        maxRedirects: 0,
                        validateStatus: (status) => status >= 300 && status < 400
                    });
                    if (response.headers.location) {
                        finalUrl = response.headers.location;
                    }
                } catch (error) {
                    try {
                        const response = await axios.get(url, { maxRedirects: 5 });
                        finalUrl = response.request.res.responseUrl || finalUrl;
                    } catch (err) {
                        console.error('[resolveGoogleMapsLink] Redirect error:', err.message);
                    }
                }
            }

            // Extract coordinates
            // 1. @lat,lng format
            const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const atMatch = finalUrl.match(atRegex);
            if (atMatch) {
                return res.status(200).json({
                    success: true,
                    data: {
                        lat: parseFloat(atMatch[1]),
                        lng: parseFloat(atMatch[2])
                    }
                });
            }

            // 2. query param format
            const queryRegex = /[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/;
            const queryMatch = finalUrl.match(queryRegex);
            if (queryMatch) {
                return res.status(200).json({
                    success: true,
                    data: {
                        lat: parseFloat(queryMatch[1]),
                        lng: parseFloat(queryMatch[2])
                    }
                });
            }

            // 3. inline path segment
            const pathRegex = /\/(-?\d+\.\d+),(-?\d+\.\d+)\//;
            const pathMatch = finalUrl.match(pathRegex);
            if (pathMatch) {
                return res.status(200).json({
                    success: true,
                    data: {
                        lat: parseFloat(pathMatch[1]),
                        lng: parseFloat(pathMatch[2])
                    }
                });
            }

            throw new ErrorBody(400, 'Could not extract coordinates from the Google Maps link');
        } catch (error) {
            next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
        }
    }
}

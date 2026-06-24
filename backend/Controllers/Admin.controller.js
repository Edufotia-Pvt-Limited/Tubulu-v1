const { Op, Sequelize } = require('sequelize');
const { Integration, User, Settlement, Country, State, City } = require('../Utils/Postgres');
const ErrorBody = require('../Utils/ErrorBody');
const Strings = require('../Utils/Strings');
const { runAutomatedKYC, updateTrustScore } = require('../Services/KYC.service');

// 📋 Get all businesses for Super Admin
async function getAllIntegrations(req, res, next) {
    try {
        // Filter out the Super Admin internal entry so only genuine merchants appear here
        const where = {
            isActive: true,
            [Op.and]: [
              {
                [Op.or]: [
                  { role: { [Op.notIn]: ['super_admin'] } },
                  { role: null }
                ]
              },
              {
                [Op.or]: [
                  { category: { [Op.notIn]: ['SuperAdmin', 'super_admin'] } },
                  { category: null }
                ]
              },
              {
                integrationName: { 
                  [Op.and]: [
                    { [Op.notILike]: '%duplicate%' },
                    { [Op.notILike]: '%archived%' }
                  ]
                }
              }
            ]
        };

        // If regional partner, only show their sub-vendors
        if (req.user.role === 'regional_partner') {
            where.parentId = req.user.id;
        }

        const userRoleLower = req.user?.role?.toLowerCase();
        if (userRoleLower === 'regional_manager') {
            where.stateId = req.user.scopedStateId;
        } else if (userRoleLower === 'state_manager') {
            where.stateId = req.user.scopedStateId;
        } else if (userRoleLower === 'city_manager') {
            where.cityId = req.user.scopedCityId;
        }

        const integrations = await Integration.findAll({
            where,
            include: [
                { model: Integration, as: 'parent', attributes: ['id', 'integrationName', 'role'] },
                { model: Integration, as: 'branches', attributes: ['id', 'integrationName'] },
                { model: City, as: 'city_detail', attributes: ['id', 'name'] },
                { model: State, as: 'state_detail', attributes: ['id', 'name'] },
                { model: Country, as: 'country_detail', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        console.log(`DEBUG (AdminController): integrations found for role ${req.user.role}:`, integrations.length);
        res.status(200).json({
            success: true,
            data: integrations
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// ✅ Approve a business
async function approveIntegration(req, res, next) {
    try {
        const { integrationId, isApproved } = req.body;
        
        if (!integrationId) {
            return next(new ErrorBody(400, "integrationId is required"));
        }

        const [updatedRows, [updated]] = await Integration.update(
            { isApproved: isApproved !== undefined ? isApproved : true },
            { 
                where: { id: integrationId },
                returning: true 
            }
        );

        if (updatedRows === 0) {
            return next(new ErrorBody(404, "Integration not found"));
        }

        res.status(200).json({
            success: true,
            message: `Business ${updated.isApproved ? 'approved' : 'unapproved'} successfully`,
            data: updated
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 🔒 Suspend / Unsuspend a business
async function suspendIntegration(req, res, next) {
    try {
        const { integrationId, isSuspended } = req.body;
        
        if (!integrationId) {
            return next(new ErrorBody(400, "integrationId is required"));
        }

        const [updatedRows, [updated]] = await Integration.update(
            { isSuspended: isSuspended !== undefined ? isSuspended : false },
            { 
                where: { id: integrationId },
                returning: true 
            }
        );

        if (updatedRows === 0) {
            return next(new ErrorBody(404, "Integration not found"));
        }

        res.status(200).json({
            success: true,
            message: `Business ${updated.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
            data: updated
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 📝 Update a business details (GST, PAN, Aadhaar, etc.) for Super Admin
async function updateIntegration(req, res, next) {
    try {
        const {
            id,
            integrationName,
            phoneNumber,
            category,
            email,
            city,
            state,
            addressLine,
            pincode,
            gstNumber,
            panNumber,
            aadharNumber,
            pstnDID,
            loginPin,
            cityId,
            stateId,
            countryId,
            deliveryFee,
            minimumOrderValue,
            estimatedDeliveryTime,
            pidge
        } = req.body;

        if (!id) {
            return next(new ErrorBody(400, "Merchant ID is required"));
        }

        const merchant = await Integration.findByPk(id);
        if (!merchant) {
            return next(new ErrorBody(404, "Merchant not found"));
        }

        const userRole = (req.user?.role || '').toLowerCase();
        if (pstnDID !== undefined && pstnDID !== '' && !['super_admin', 'regional_manager'].includes(userRole)) {
            return next(new ErrorBody(403, "Only Super Admins and Regional Managers can configure Voice/AI settings (DID)"));
        }

        // Scope verification
        if (userRole === 'city_manager') {
            if (merchant.cityId !== req.user.scopedCityId) {
                return next(new ErrorBody(403, "Access Denied: You can only edit vendors within your scoped city"));
            }
        } else if (userRole === 'regional_manager' || userRole === 'state_manager') {
            if (merchant.stateId !== req.user.scopedStateId) {
                return next(new ErrorBody(403, "Access Denied: You can only edit vendors within your scoped state"));
            }
        }

        // Build the update payload, only including defined values
        const updatePayload = {
            integrationName,
            phoneNumber,
            category,
            email,
            city,
            state,
            addressLine,
            pincode,
            gstNumber,
            panNumber,
            aadharNumber,
        };

        if (deliveryFee !== undefined) updatePayload.deliveryFee = deliveryFee;
        if (minimumOrderValue !== undefined) updatePayload.minimumOrderValue = minimumOrderValue;
        if (estimatedDeliveryTime !== undefined) updatePayload.estimatedDeliveryTime = estimatedDeliveryTime;

        if (pidge !== undefined) {
            const existing = merchant.pidge || {};
            updatePayload.pidge = {
                ...existing,
                ...pidge
            };
        }

        // Only update DID if a real non-empty value is provided by an authorized role
        if (pstnDID !== undefined && pstnDID !== null && pstnDID !== '') {
            updatePayload.pstnDID = pstnDID;
        }

        // Only update location IDs if they were explicitly sent
        if (cityId !== undefined) updatePayload.cityId = cityId || null;
        if (stateId !== undefined) updatePayload.stateId = stateId || null;
        if (countryId !== undefined) updatePayload.countryId = countryId || null;

        const [updatedRows, [updated]] = await Integration.update(
            updatePayload,
            {
                where: { id },
                returning: true
            }
        );

        if (updatedRows === 0) {
            return next(new ErrorBody(404, "Merchant not found"));
        }

        // If a loginPin was provided, update the matching user record's pinCode
        if (loginPin) {
            if (updated && updated.phoneNumber) {
                await User.update(
                    { pinCode: loginPin },
                    { where: { phoneNumber: updated.phoneNumber } }
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Merchant updated successfully",
            data: updated
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 👥 Get all Users in system for Admin list
async function getAllSystemUsers(req, res, next) {
    try {
        const { page = 0, size = 10, search = '' } = req.query;
        console.log("getAllSystemUsers called: req.user =", JSON.stringify(req.user, null, 2), "query =", req.query);
        const limit = parseInt(size);
        const offset = parseInt(page) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { phoneNumber: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const userRoleLower = req.user?.role?.toLowerCase();
        if (userRoleLower === 'super_admin') {
            where.role = 'regional_manager';
        } else if (userRoleLower === 'regional_manager' || userRoleLower === 'state_manager') {
            where.scopedStateId = req.user.scopedStateId;
            where.role = 'city_manager';
        } else if (userRoleLower === 'city_manager') {
            where.scopedCityId = req.user.scopedCityId;
            where.role = 'city_manager'; // placeholder
        }

        console.log("getAllSystemUsers executing findAndCountAll with where:", JSON.stringify(where, null, 2));
        const { count, rows } = await User.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: rows,
            total: count
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 🆕 Create/Provision new System User directly
async function adminCreateUser(req, res, next) {
    try {
        const { v4: uuidv4 } = require('uuid');
        const creatorRole = req.user?.role?.toLowerCase();
        const { 
            firstName, lastName, phoneNumber, email, role = 'User', portfolioAccess,
            scopedCountryId, scopedStateId, scopedCityId, password
        } = req.body;

        if (!phoneNumber || !firstName) {
            return next(new ErrorBody(400, "Missing required fields: phoneNumber & firstName"));
        }

        const cleanedPhoneNumber = String(phoneNumber).replace(/\D/g, '');
        if (cleanedPhoneNumber.length !== 10) {
            return next(new ErrorBody(400, "Phone number must be exactly 10 digits and contain only numbers"));
        }

        // Hierarchy logic validation
        const targetRoleLower = role.toLowerCase();
        let finalCountryId = scopedCountryId || null;
        let finalStateId = scopedStateId || null;
        let finalCityId = scopedCityId || null;
        let finalCreatedByUserId = null;

        if (creatorRole === 'super_admin' || creatorRole === 'superadmin') {
            if (targetRoleLower !== 'regional_manager') {
                return next(new ErrorBody(403, "Super Admin can only create Regional Managers"));
            }
        } else if (creatorRole === 'regional_manager') {
            if (targetRoleLower !== 'city_manager') {
                return next(new ErrorBody(403, "Regional Managers can only create City Managers"));
            }
            if (!scopedCityId) return next(new ErrorBody(400, "scopedCityId is required for City Manager"));
            const city = await City.findByPk(scopedCityId);
            if (!city || city.stateId !== req.user.scopedStateId) {
                return next(new ErrorBody(403, "Cannot create City Manager outside your scoped state"));
            }
        } else if (creatorRole === 'state_manager') {
            if (targetRoleLower !== 'city_manager') {
                return next(new ErrorBody(403, "State Managers can only create City Managers"));
            }
            if (!scopedCityId) return next(new ErrorBody(400, "scopedCityId is required for City Manager"));
            const city = await City.findByPk(scopedCityId);
            if (!city || city.stateId !== req.user.scopedStateId) {
                return next(new ErrorBody(403, "Cannot create City Manager outside your scoped state"));
            }
        } else if (creatorRole === 'city_manager') {
            if (targetRoleLower !== 'enabler') {
                return next(new ErrorBody(403, "City Managers can only create Enablers"));
            }
            finalCityId = req.user.scopedCityId;
            finalStateId = req.user.scopedStateId;
            finalCountryId = req.user.scopedCountryId;
            finalCreatedByUserId = req.user.id;
        } else {
            return next(new ErrorBody(403, "Access Denied: You do not have permission to create staff"));
        }

        // Check duplicate phone number in Users
        const existing = await User.findOne({ where: { phoneNumber: cleanedPhoneNumber } });
        if (existing) {
            return next(new ErrorBody(409, "User already exists with this phone number"));
        }

        // Check duplicate phone number in Integrations
        const { Integration } = require("../Utils/Postgres");
        const { Op } = require("sequelize");
        const barePhone = cleanedPhoneNumber.replace(/^\+91|^91/, '');
        const existingIntegration = await Integration.findOne({ 
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
        if (existingIntegration) {
            return next(new ErrorBody(409, "This phone number is already registered as a Merchant"));
        }

        // Check duplicate email
        if (email) {
            const normalizedEmail = email.toLowerCase().trim();
            const existingEmail = await User.findOne({ where: { email: normalizedEmail } });
            if (existingEmail) {
                return next(new ErrorBody(409, "User already exists with this email address"));
            }
        }

        const generatedPassword = password || (Math.random().toString(36).substring(2, 10) + 'A1!');
        const normalizedEmail = email ? email.toLowerCase().trim() : null;
        const newUser = await User.create({
            uuid: uuidv4(),
            firstName,
            lastName,
            phoneNumber: cleanedPhoneNumber,
            email: normalizedEmail,
            role,
            userName: normalizedEmail || cleanedPhoneNumber,
            password: generatedPassword,
            pinCode: generatedPassword,
            scopedCountryId: finalCountryId,
            scopedStateId: finalStateId,
            scopedCityId: finalCityId,
            createdByUserId: finalCreatedByUserId,
            userVerified: true, // Auto-verify admin created
            portfolioAccess: portfolioAccess || {
                accessType: 'GLOBAL',
                verticals: [],
                merchants: []
            }
        });

        // Send login credentials via email if email exists
        if (email) {
            const { sendLoginCredentialsEmail } = require('../Utils/Mailer');
            sendLoginCredentialsEmail(email, firstName, role, email, generatedPassword);
        }

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 📝 Update existing User profile
async function adminUpdateUser(req, res, next) {
    try {
        const creatorRole = req.user?.role?.toLowerCase();
        const { 
            id, firstName, lastName, phoneNumber, email, role, portfolioAccess,
            scopedCountryId, scopedStateId, scopedCityId, password
        } = req.body;

        if (!id) {
            return next(new ErrorBody(400, "User ID is required for update"));
        }

        let cleanedPhoneNumber = phoneNumber;
        if (phoneNumber) {
            cleanedPhoneNumber = String(phoneNumber).replace(/\D/g, '');
            if (cleanedPhoneNumber.length !== 10) {
                return next(new ErrorBody(400, "Phone number must be exactly 10 digits and contain only numbers"));
            }
        }

        // Check duplicate phone number
        if (cleanedPhoneNumber) {
            const existingPhone = await User.findOne({ 
                where: { 
                    phoneNumber: cleanedPhoneNumber,
                    id: { [Op.ne]: id }
                } 
            });
            if (existingPhone) {
                return next(new ErrorBody(409, "Another user already exists with this phone number"));
            }
        }

        // Check duplicate email
        if (email) {
            const normalizedEmail = email.toLowerCase().trim();
            const existingEmail = await User.findOne({ 
                where: { 
                    email: normalizedEmail,
                    id: { [Op.ne]: id }
                } 
            });
            if (existingEmail) {
                return next(new ErrorBody(409, "Another user already exists with this email address"));
            }
        }

        if (creatorRole === 'super_admin' || creatorRole === 'superadmin') {
            const targetRoleLower = role ? role.toLowerCase() : '';
            if (targetRoleLower && targetRoleLower !== 'regional_manager') {
                return next(new ErrorBody(403, "Super Admin can only manage Regional Managers"));
            }
        } else if (creatorRole === 'regional_manager') {
            const targetRoleLower = role ? role.toLowerCase() : '';
            if (targetRoleLower && targetRoleLower !== 'city_manager') {
                return next(new ErrorBody(403, "Regional Managers can only update/assign City Managers"));
            }
            if (scopedCityId) {
                const city = await City.findByPk(scopedCityId);
                if (!city || city.stateId !== req.user.scopedStateId) {
                    return next(new ErrorBody(403, "Cannot assign scope outside your state"));
                }
            }
        } else if (creatorRole === 'state_manager') {
            const targetRoleLower = role ? role.toLowerCase() : '';
            if (targetRoleLower && targetRoleLower !== 'city_manager') {
                return next(new ErrorBody(403, "State Managers can only update/assign City Managers"));
            }
            if (scopedCityId) {
                const city = await City.findByPk(scopedCityId);
                if (!city || city.stateId !== req.user.scopedStateId) {
                    return next(new ErrorBody(403, "Cannot assign scope outside your state"));
                }
            }
        } else if (creatorRole === 'city_manager') {
            const targetRoleLower = role ? role.toLowerCase() : '';
            if (targetRoleLower && targetRoleLower !== 'enabler') {
                return next(new ErrorBody(403, "City Managers can only update Enablers"));
            }
        } else {
            return next(new ErrorBody(403, "Access Denied"));
        }

        const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
        const updatePayload = {
            firstName,
            lastName,
            phoneNumber: cleanedPhoneNumber,
            role,
            portfolioAccess,
            scopedCountryId: scopedCountryId !== undefined ? scopedCountryId : undefined,
            scopedStateId: scopedStateId !== undefined ? scopedStateId : undefined,
            scopedCityId: scopedCityId !== undefined ? scopedCityId : undefined,
        };
        if (normalizedEmail !== undefined) {
            updatePayload.email = normalizedEmail;
            updatePayload.userName = normalizedEmail;
        }
        if (password !== undefined && password !== '') {
            updatePayload.password = password;
            updatePayload.pinCode = password;
        }

        const [updatedRows, [updatedUser]] = await User.update(
            updatePayload,
            {
                where: { id },
                returning: true
            }
        );

        if (updatedRows === 0) {
            return next(new ErrorBody(404, "User not found to update"));
        }

        res.status(200).json({
            success: true,
            message: "User details patched successfully",
            data: updatedUser
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 🗑️ Delete User by Super Admin / Regional Manager
async function adminDeleteUser(req, res, next) {
    try {
        console.log("adminDeleteUser invoked for ID:", req.params.id);
        const { id } = req.params;

        if (!id) {
            return next(new ErrorBody(400, "User ID is required for deletion"));
        }

        const requesterRole = req.user?.role?.toLowerCase();
        const requesterStateId = req.user?.scopedStateId;

        // Fetch the user to be deleted first
        const userToDelete = await User.findByPk(id);
        if (!userToDelete) {
            console.log("adminDeleteUser: User not found");
            return next(new ErrorBody(404, "User not found to delete"));
        }

        // Enforce hierarchy deletion guard
        if (requesterRole === 'regional_manager' || requesterRole === 'state_manager') {
            // Managers can only delete users with role 'city_manager'
            if (userToDelete.role !== 'city_manager') {
                return next(new ErrorBody(403, "Access Denied: Managers can only delete City Managers"));
            }
            // Managers can only delete users in their scoped state
            if (userToDelete.scopedStateId !== requesterStateId) {
                return next(new ErrorBody(403, "Access Denied: Cannot delete a user outside your scoped state"));
            }
        } else if (requesterRole === 'city_manager') {
            if (userToDelete.role !== 'enabler') {
                return next(new ErrorBody(403, "Access Denied: City Managers can only delete Enablers"));
            }
            if (userToDelete.scopedCityId !== req.user.scopedCityId) {
                return next(new ErrorBody(403, "Access Denied: Cannot delete an Enabler outside your scoped city"));
            }
        } else if (requesterRole !== 'super_admin') {
            return next(new ErrorBody(403, "Access Denied: You do not have permission to delete users"));
        }

        const [updatedRows] = await User.update(
            { isActive: false, currentSessionToken: null },
            { where: { id } }
        );

        if (updatedRows === 0) {
            console.log("adminDeleteUser: User not found");
            return next(new ErrorBody(404, "User not found to deactivate"));
        }

        console.log("adminDeleteUser: User successfully deactivated");
        res.status(200).json({
            success: true,
            message: "User deactivated successfully"
        });
    } catch (error) {
        console.error("adminDeleteUser ERROR:", error);
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

async function getIntegrationCustomers(req, res, next) {
    try {
        const { id } = req.params;
        const { getMerchantCustomers } = require('../Services/PhoneBook.pg.Service');
        
        const customers = await getMerchantCustomers(id);
        
        res.status(200).json({
            success: true,
            data: customers
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

async function getSystemSettings(req, res, next) {
    try {
        const { SystemSetting } = require('../Utils/Postgres');
        const settings = await SystemSetting.findAll();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

async function updateSystemSetting(req, res, next) {
    try {
        const { SystemSetting } = require('../Utils/Postgres');
        const { key, value, description } = req.body;
        
        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key },
            defaults: { value, description }
        });

        if (!created) {
            await setting.update({ value, description: description || setting.description });
        }

        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

async function getPartnerCommissionStats(req, res, next) {
    try {
        const partnerId = req.id;

        const settlements = await Settlement.findAll({
            where: { 
                integrationId: partnerId,
                type: 'commission'
            },
            order: [['createdAt', 'DESC']]
        });

        const totalEarned = settlements.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                totalEarned,
                settlements
            }
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

async function triggerKYC(req, res, next) {
    try {
        const { id } = req.params;
        const merchant = await Integration.findByPk(id);
        if (!merchant) {
            return next(new ErrorBody(404, 'Merchant not found'));
        }
        const result = await runAutomatedKYC(id);
        res.status(200).json({
            success: true,
            message: `KYC pipeline completed`,
            data: {
                trustScore: result?.score,
                updates: result?.updates,
                isApproved: (await Integration.findByPk(id)).isApproved
            }
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

async function getTrustScore(req, res, next) {
    try {
        const { id } = req.params;
        const score = await updateTrustScore(id);
        const merchant = await Integration.findByPk(id, {
            attributes: ['id', 'integrationName', 'trustScore', 'isGstVerified', 'isPanVerified', 'isAadharVerified', 'isApproved']
        });
        if (!merchant) {
            return next(new ErrorBody(404, 'Merchant not found'));
        }
        res.status(200).json({ success: true, data: merchant });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 🗑️ Delete Integration (vendor) by Super Admin / Regional Manager
async function deleteIntegration(req, res, next) {
    return next(new ErrorBody(403, "Access Denied: Deleting vendors is disabled. Please use deactivation/status toggling instead."));
}


async function getScopedStats(req, res, next) {
    try {
        const { role, scopedStateId, scopedCityId } = req.user;
        const roleLower = role ? role.toLowerCase() : '';

        // Base filter for merchants
        const merchantFilter = {
            isActive: true,
            [Op.and]: [
              {
                [Op.or]: [
                  { role: { [Op.notIn]: ['super_admin'] } },
                  { role: null }
                ]
              },
              {
                [Op.or]: [
                  { category: { [Op.notIn]: ['SuperAdmin', 'super_admin'] } },
                  { category: null }
                ]
              },
              {
                integrationName: { 
                  [Op.and]: [
                    { [Op.notILike]: '%duplicate%' },
                    { [Op.notILike]: '%archived%' }
                  ]
                }
              }
            ]
        };

        const { Product, Order } = require('../Utils/Postgres');

        if (roleLower === 'super_admin' || roleLower === 'ops_admin') {
            const [totalRegionalManagers, activeStores, totalProducts, totalOrders] = await Promise.all([
                User.count({ where: { role: 'regional_manager' } }),
                Integration.count({ where: { ...merchantFilter, isApproved: true } }),
                Product.count({ where: { isDeleted: false } }),
                Order.count()
            ]);

            const categoryDistribution = await Integration.findAll({
                where: merchantFilter,
                attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('category')), 'count']],
                group: ['category'],
                raw: true
            });

            const monthlyGrowth = await Integration.findAll({
                where: merchantFilter,
                attributes: [
                    [Sequelize.fn('DATE_TRUNC', 'day', Sequelize.col('createdAt')), 'month'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                group: ['month'],
                order: [[Sequelize.literal('month'), 'ASC']],
                limit: 30,
                raw: true
            });

            return res.status(200).json({
                success: true,
                data: {
                    totalRegionalManagers,
                    activeStores,
                    totalProducts,
                    totalOrders,
                    categoryDistribution,
                    monthlyGrowth
                }
            });
        } else if (roleLower === 'regional_manager' || roleLower === 'state_manager') {
            const stateFilter = { ...merchantFilter, stateId: scopedStateId };

            const integrations = await Integration.findAll({
                where: stateFilter,
                attributes: ['id']
            });
            const integrationIds = integrations.map(i => i.id);

            const [totalCityManagers, activeStores, totalProducts, totalOrders] = await Promise.all([
                User.count({ where: { role: 'city_manager', scopedStateId } }),
                Integration.count({ where: { ...stateFilter, isApproved: true } }),
                integrationIds.length > 0 ? Product.count({ where: { isDeleted: false, integrationId: { [Op.in]: integrationIds } } }) : 0,
                integrationIds.length > 0 ? Order.count({ where: { integrationId: { [Op.in]: integrationIds } } }) : 0
            ]);

            const categoryDistribution = await Integration.findAll({
                where: stateFilter,
                attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('category')), 'count']],
                group: ['category'],
                raw: true
            });

            const monthlyGrowth = await Integration.findAll({
                where: stateFilter,
                attributes: [
                    [Sequelize.fn('DATE_TRUNC', 'day', Sequelize.col('createdAt')), 'month'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                group: ['month'],
                order: [[Sequelize.literal('month'), 'ASC']],
                limit: 30,
                raw: true
            });

            return res.status(200).json({
                success: true,
                data: {
                    totalCityManagers,
                    activeStores,
                    totalProducts,
                    totalOrders,
                    categoryDistribution,
                    monthlyGrowth
                }
            });
        } else if (roleLower === 'city_manager') {
            const cityFilter = { ...merchantFilter, cityId: scopedCityId };

            const integrations = await Integration.findAll({
                where: cityFilter,
                attributes: ['id']
            });
            const integrationIds = integrations.map(i => i.id);

            const [totalVendors, activeStores, totalProducts, totalOrders] = await Promise.all([
                Integration.count({ where: cityFilter }),
                Integration.count({ where: { ...cityFilter, isApproved: true } }),
                integrationIds.length > 0 ? Product.count({ where: { isDeleted: false, integrationId: { [Op.in]: integrationIds } } }) : 0,
                integrationIds.length > 0 ? Order.count({ where: { integrationId: { [Op.in]: integrationIds } } }) : 0
            ]);

            const categoryDistribution = await Integration.findAll({
                where: cityFilter,
                attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('category')), 'count']],
                group: ['category'],
                raw: true
            });

            const monthlyGrowth = await Integration.findAll({
                where: cityFilter,
                attributes: [
                    [Sequelize.fn('DATE_TRUNC', 'day', Sequelize.col('createdAt')), 'month'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                group: ['month'],
                order: [[Sequelize.literal('month'), 'ASC']],
                limit: 30,
                raw: true
            });

            return res.status(200).json({
                success: true,
                data: {
                    totalVendors,
                    activeStores,
                    totalProducts,
                    totalOrders,
                    categoryDistribution,
                    monthlyGrowth
                }
            });
        } else {
            return next(new ErrorBody(403, "Access denied: Scoped stats not available for this role"));
        }
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}

// 🔍 Get health status of all application modules
async function getModulesHealth(req, res, next) {
    try {
        const { checkAllModulesHealth } = require('../Utils/health-check');
        const healthData = await checkAllModulesHealth();
        res.status(200).json({
            success: true,
            data: healthData
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || Strings.SERVER_ERROR));
    }
}


module.exports = {
    getAllIntegrations,
    approveIntegration,
    suspendIntegration,
    updateIntegration,
    deleteIntegration,
    getAllSystemUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    getIntegrationCustomers,
    getSystemSettings,
    updateSystemSetting,
    getPartnerCommissionStats,
    triggerKYC,
    getTrustScore,
    getScopedStats,
    getModulesHealth
};

const { Op } = require('sequelize');
const { Integration, User, EnablerOnboarding, City, State, Country, AuditLog } = require('../Utils/Postgres');
const ErrorBody = require('../Utils/ErrorBody');

// 1. Submit Merchant (Enabler only)
async function submitMerchant(req, res, next) {
    try {
        const user = req.user;
        const {
            integrationName,
            verticalType,
            phoneNumber,
            email,
            addressLine,
            pincode,
            cityId,
            gpsLatitude,
            gpsLongitude,
            fieldNotes,
            gstNumber,
            panNumber,
            aadharNumber,
            shopEstablishmentNumber,
            upiVpa,
            upiMerchantName,
            documents
        } = req.body;

        if (!integrationName || !verticalType || !phoneNumber || !cityId) {
            return next(new ErrorBody(400, "Missing required fields: integrationName, verticalType, phoneNumber, cityId"));
        }

        // Fetch City to resolve stateId and countryId
        const cityRecord = await City.findByPk(cityId, {
            include: [{ model: State, as: 'state', include: [{ model: Country, as: 'country' }] }]
        });
        if (!cityRecord) {
            return next(new ErrorBody(404, "Target city not found"));
        }

        // Create the Integration in draft/pending state
        const enumMapping = {
            fb: 'FB',
            retail: 'RETAIL',
            ticketing: 'TICKETING',
            services: 'SERVICES',
            grocery: 'GROCERY',
            govt: 'GOVT',
            tech: 'TECH',
            ai: 'AI',
            hotel: 'Hotel',
            'food & beverage': 'FB',
            'electronics': 'TECH',
            'govt sector': 'GOVT',
            'general store': 'RETAIL'
        };
        const mappedVerticalType = verticalType ? (enumMapping[verticalType.toLowerCase()] || verticalType) : verticalType;

        const merchant = await Integration.create({
            integrationName,
            verticalType: mappedVerticalType,
            phoneNumber,
            email,
            addressLine,
            city: cityRecord.name,
            state: cityRecord.state?.name,
            country: cityRecord.state?.country?.name,
            pincode,
            latitude: gpsLatitude,
            longitude: gpsLongitude,
            cityId,
            stateId: cityRecord.stateId,
            countryId: cityRecord.state?.countryId,
            isActive: false,
            isApproved: false,
            isOnboarded: false,
            role: 'merchant_admin',
            gstNumber,
            panNumber,
            aadharNumber: aadharNumber,
            shopEstablishmentNumber,
            upi: {
                connected: !!upiVpa,
                vpa: upiVpa || '',
                merchantName: upiMerchantName || integrationName
            },
            documents: documents || []
        });

        // Create the EnablerOnboarding record
        const onboarding = await EnablerOnboarding.create({
            enablerId: user.id,
            integrationId: merchant.id,
            cityId,
            status: 'submitted',
            submittedAt: new Date(),
            fieldNotes,
            gpsLatitude,
            gpsLongitude
        });

        // Update User performance stats denormalized counters
        const enablerRecord = await User.findByPk(user.id);
        if (enablerRecord) {
            const stats = enablerRecord.enablerStats || { totalSubmitted: 0, totalApproved: 0, totalRejected: 0 };
            stats.totalSubmitted = (stats.totalSubmitted || 0) + 1;
            stats.lastActivityAt = new Date();
            await User.update({ enablerStats: stats }, { where: { id: user.id } });
        }

        // Create Audit Log
        await AuditLog.create({
            staffId: user.id,
            integrationId: merchant.id,
            action: 'ENABLER_SUBMISSION',
            metadata: { onboardingId: onboarding.id, integrationName }
        });

        res.status(201).json({
            success: true,
            message: "Merchant submitted successfully for review",
            data: {
                onboardingId: onboarding.id,
                integrationId: merchant.id
            }
        });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

// 2. Get My Submissions (Enabler / City Manager)
async function getMySubmissions(req, res, next) {
    try {
        const user = req.user;
        let targetEnablerId = user.id;

        // If City Manager, they can query specific enabler submissions in their city, or all submissions in their city
        if (user.role === 'city_manager') {
            if (req.query.enablerId) {
                targetEnablerId = req.query.enablerId;
                // Verify the enabler is indeed in this city manager's city
                const targetEnabler = await User.findByPk(targetEnablerId);
                if (!targetEnabler || targetEnabler.scopedCityId !== user.scopedCityId) {
                    return res.status(403).json({ success: false, message: "Forbidden: Enabler is outside your city scope" });
                }
            } else {
                // Return all submissions in this city
                const submissions = await EnablerOnboarding.findAll({
                    where: { cityId: user.scopedCityId },
                    include: [
                        {
                            model: Integration,
                            as: 'merchant',
                            attributes: ['id', 'integrationName', 'verticalType', 'phoneNumber', 'email', 'documents', 'gstNumber', 'panNumber', 'aadharNumber', 'upi']
                        },
                        {
                            model: City,
                            as: 'city',
                            attributes: ['id', 'name']
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                });
                return res.status(200).json({
                    success: true,
                    data: submissions
                });
            }
        }

        const submissions = await EnablerOnboarding.findAll({
            where: { enablerId: targetEnablerId },
            include: [
                {
                    model: Integration,
                    as: 'merchant',
                    attributes: ['id', 'integrationName', 'verticalType', 'phoneNumber', 'email', 'documents', 'gstNumber', 'panNumber', 'aadharNumber', 'upi']
                },
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: submissions
        });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

// 3. Upload KYC Document (Enabler only)
async function uploadDocument(req, res, next) {
    try {
        const { integrationId, type, url, fileName } = req.body;
        if (!integrationId || !type || !url) {
            return next(new ErrorBody(400, "Missing required parameters: integrationId, type, url"));
        }

        const merchant = await Integration.findByPk(integrationId);
        if (!merchant) {
            return next(new ErrorBody(404, "Merchant integration not found"));
        }

        // Add document to JSONB documents array
        const documents = merchant.documents || [];
        documents.push({ type, url, fileName: fileName || `${type}_doc` });

        await Integration.update(
            { documents, isDocumentsUploaded: true },
            { where: { id: integrationId } }
        );

        res.status(200).json({
            success: true,
            message: "Document uploaded successfully",
            documents
        });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

// 4. Get My Stats (Enabler only)
async function getMyStats(req, res, next) {
    try {
        const userRecord = await User.findByPk(req.user.id, {
            attributes: ['enablerStats']
        });

        res.status(200).json({
            success: true,
            data: userRecord ? userRecord.enablerStats : { totalSubmitted: 0, totalApproved: 0, totalRejected: 0 }
        });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

// 5. Get City Enablers (City Manager only)
async function getCityEnablers(req, res, next) {
    try {
        const cityId = req.user.scopedCityId;
        if (!cityId) {
            return next(new ErrorBody(400, "City Manager is not scoped to any city"));
        }

        const { Op } = require('sequelize');
        const enablers = await User.findAll({
            where: {
                role: {
                    [Op.iLike]: 'enabler'
                },
                scopedCityId: cityId
            },
            attributes: ['id', 'firstName', 'lastName', 'userName', 'email', 'phoneNumber', 'enablerStats', 'createdAt']
        });

        res.status(200).json({
            success: true,
            data: enablers
        });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

// 6. Review Submission (City Manager only)
async function reviewSubmission(req, res, next) {
    try {
        const { submissionId, action, rejectionReason } = req.body;
        if (!submissionId || !action) {
            return next(new ErrorBody(400, "Missing required parameters: submissionId, action"));
        }

        const onboarding = await EnablerOnboarding.findByPk(submissionId, {
            include: [{ model: Integration, as: 'merchant' }]
        });
        if (!onboarding) {
            return next(new ErrorBody(404, "Submission not found"));
        }

        // Verify city manager is scoped to the same city as submission
        if (onboarding.cityId !== req.user.scopedCityId) {
            return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to review submissions for this city" });
        }

        const isApprove = action.toLowerCase() === 'approve';
        const newStatus = isApprove ? 'approved' : 'rejected';

        await EnablerOnboarding.update({
            status: newStatus,
            rejectionReason: isApprove ? null : rejectionReason,
            reviewedAt: new Date(),
            reviewedByUserId: req.user.id
        }, {
            where: { id: submissionId }
        });

        // Update the Integration status
        await Integration.update({
            isApproved: isApprove,
            isActive: isApprove // Activate merchant once approved
        }, {
            where: { id: onboarding.integrationId }
        });

        // Update Enabler stats denormalized counters
        const enablerRecord = await User.findByPk(onboarding.enablerId);
        if (enablerRecord) {
            const stats = enablerRecord.enablerStats || { totalSubmitted: 0, totalApproved: 0, totalRejected: 0 };
            if (isApprove) {
                stats.totalApproved = (stats.totalApproved || 0) + 1;
            } else {
                stats.totalRejected = (stats.totalRejected || 0) + 1;
            }
            await User.update({ enablerStats: stats }, { where: { id: onboarding.enablerId } });
        }

        // Create Audit Log
        await AuditLog.create({
            staffId: req.user.id,
            integrationId: onboarding.integrationId,
            action: isApprove ? 'ENABLER_SUBMISSION_APPROVE' : 'ENABLER_SUBMISSION_REJECT',
            metadata: { submissionId, rejectionReason }
        });

        res.status(200).json({
            success: true,
            message: `Submission successfully ${newStatus}`
        });
    } catch (error) {
        next(new ErrorBody(500, error.message));
    }
}

module.exports = {
    submitMerchant,
    getMySubmissions,
    uploadDocument,
    getMyStats,
    getCityEnablers,
    reviewSubmission
};

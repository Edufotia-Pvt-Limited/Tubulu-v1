const { addNewPhonebook, getAllPhoneBookForIntegration, updatePhoneBookByIdService, deletePhoneBookById } = require('../Services/PhoneBook.Service');
const { validationResult } = require('express-validator');
const { logger } = require('../Utils/Logger');
const { generateUUID } = require('../Utils/Helper');
const { Integration } = require('../Utils/Postgres');
const ErrorBody = require('../Utils/ErrorBody');
const { getIntegrationByPhoneNumberService } = require('../Services/Integration.Service');
const { addNewPhoneGroupBook, getAllGroupsByIntegration, updatePhoneBookByIntegrationId, bulkCreatePhoneBookRelations, deletePhoneBookGroupRelation, deletePhoneBookGroupAndRelationsService } = require('../Services/PhoneBookGroup.service');
const { getUserByPhoneNumber, getUserByPhoneNumberAndCC, createUser } = require('../Services/User.Service');
const { uploadBase64ToAws } = require('../Utils/FileHelper');

// Phone Book 


async function addNewPhoneBookController(req, res, next) {
    try {
        const { errors } = validationResult(req);
        const { phoneNumber } = req;
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form data');
        }
        const { body: { phoneNumber: userPhoneNumber, cc, firstName, lastName, city, state, country, pinCode, gender, email, file, fileName, mimeType, phoneBookGroups } } = req;
        let existingUserDetails = await getUserByPhoneNumberAndCC(userPhoneNumber, cc);
        const integrationDetails = await getIntegrationByPhoneNumberService(phoneNumber);
        const uuid = generateUUID();
        if (!existingUserDetails) {
            //The user does not exists, we need to create the same.
            let userProfilePicURL = '';
            if (file && fileName && mimeType) {
                const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName);
                userProfilePicURL = s3FileName;
            }
            existingUserDetails = await createUser({
                uuid, firstName, lastName, city, state, country, pinCode, gender, email, profilePictureUrl: userProfilePicURL ?? '', phoneNumber: userPhoneNumber
            });
        }
        const createdDetails = await addNewPhonebook({
            userId: existingUserDetails._id,
            integrationId: integrationDetails._id,
            uuid
        });
        if (phoneBookGroups && phoneBookGroups.length) {
            const bulkData = [];
            phoneBookGroups.forEach(groupId => {
                bulkData.push({
                    phoneBookId: createdDetails._id,
                    groupId,
                });
            });
            await bulkCreatePhoneBookRelations(bulkData);
        }
        res.send({
            success: true,
            data: createdDetails
        })
    } catch (error) {
        logger.error('Unable to add new phonebook');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}

async function updatePhoneBook(req, res, next) {
    try {
        const { errors } = validationResult(req);
        const { phoneNumber, params: { id }, id: integrationId } = req;
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form data');
        }
        const { 
            body: { 
                phoneNumber: userPhoneNumber, cc, firstName, lastName, 
                city, state, country, pinCode, gender, email, 
                file, fileName, mimeType, phoneBookGroups 
            } 
        } = req;

        const { PhoneBook, User } = require('../Utils/Postgres');
        const phoneBookRecord = await PhoneBook.findByPk(id);
        if (!phoneBookRecord) {
            return next(new ErrorBody(404, 'PhoneBook entry not found'));
        }

        const contactUserId = phoneBookRecord.userId;

        let userProfilePicURL = undefined;
        if (file && fileName && mimeType) {
            const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName);
            userProfilePicURL = s3FileName;
        }

        const existingUser = await getUserByPhoneNumberAndCC(userPhoneNumber, cc);
        if (existingUser && existingUser.id !== contactUserId) {
            // Link to the existing user
            await phoneBookRecord.update({ userId: existingUser.id });
            // Update the existing user's details
            await existingUser.update({
                firstName,
                lastName,
                city,
                state,
                country,
                pinCode,
                gender,
                email,
                ...(userProfilePicURL ? { profilePictureUrl: userProfilePicURL } : {})
            });
        } else {
            // Update the current user
            await User.update({
                firstName,
                lastName,
                city,
                state,
                country,
                pinCode,
                gender,
                email,
                phoneNumber: userPhoneNumber,
                cc,
                ...(userProfilePicURL ? { profilePictureUrl: userProfilePicURL } : {})
            }, {
                where: { id: contactUserId }
            });
        }

        // Group relations update
        const allGroups = await getAllGroupsByIntegration(integrationId);
        if (allGroups.length) {
            const allPromises = allGroups.map(async (groupItem) => {
                await deletePhoneBookGroupRelation(id, groupItem._id);
            });
            await Promise.all(allPromises);
        }
        if (phoneBookGroups && phoneBookGroups.length) {
            const bulkData = [];
            phoneBookGroups.forEach(groupId => {
                bulkData.push({
                    phoneBookId: id,
                    groupId,
                });
            });
            console.log("🚀 ~ updatePhoneBook ~ bulkData:", bulkData)
            await bulkCreatePhoneBookRelations(bulkData);
        }
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        logger.error('Unable to update the phone book');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}

async function getPhoneBookForIntegration(req, res, next) {
    try {
        const { id } = req;
        const { getMerchantCustomers } = require('../Services/PhoneBook.pg.Service');
        const data = await getMerchantCustomers(id);
        res.send({
            success: true,
            data
        })
    } catch (error) {
        logger.error('Unable to get the phonebooks');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}

async function deletePhoneBookByIdController(req, res, next) {
    try {
        const { id, params: { phoneBookId } } = req;
        await deletePhoneBookById(phoneBookId, id);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        logger.error('Unable to delete the phonebook at the moment');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}


async function getPhoneBookDetailsForIntegration(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form data');
        }
        const { body: {
            cc, phoneNumber
        } } = req;
        const data = await getUserByPhoneNumberAndCC(phoneNumber, cc);
        res.send({
            success: true,
            data,
        })
    } catch (error) {
        logger.error('Unable to get the phone book details at the moment');
        logger.error(error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', error.errors || []));
    }
}




// Phone Book Group 

const updatePhoneBookGroupByIdController = async (req, res, next) => {
    try {
        const { errors } = validationResult(req);
        const groupId = req.params.id;

        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form data');
        }

        // TODO: add a patch to check if the phone book group belongs to the integration
        await updatePhoneBookByIntegrationId(groupId, req.body);

        res.send({
            success: true,
            data: true,
        });
    } catch (error) {
        logger.error('Unable to update the new phone book group');
        logger.error(error.message);
        next(
            new ErrorBody(
                error.code || 500,
                error.message || 'Server error occurred',
                error.errors || []
            )
        );
    }
};




const getNewPhoneBookGroupController = async (req, res, next) => {
    try {
        const integrationId = req.id;

        const integrationDetails = await Integration.findByPk(integrationId);
        const data = await getAllGroupsByIntegration(integrationDetails.id);


        res.send({
            success: true,
            data,
        })
    } catch (error) {
        logger.error('Unable to add new phone book group');
        logger.error(error.message);
        next(new ErrorBody(error.code || 500, error.message || 'Server error occurred', error.errors || []));
    }
}





const addNewPhoneBookGroupController = async (req, res, next) => {
    try {
        const { errors } = validationResult(req);
        const integrationId = req.id;

        if (errors.length) {
            throw new ErrorBody(400, 'Invalid form data');
        }

        const integrationDetails = await Integration.findByPk(integrationId);

        const createdDetails = await addNewPhoneGroupBook({
            ...req.body,
            uuid: generateUUID(),
            integrationId: integrationDetails.id
        });

        res.send({
            success: true,
            data: createdDetails,
        });
    } catch (error) {
        logger.error('Unable to add new phone book group');
        logger.error(error.message);
        next(new ErrorBody(
            error.statusCode || 500,
            error.message || 'Server error occurred',
            error.errors || []
        ));
    }
};



const deletePhoneBookGroupById = async (req, res, next) => {
    try {
        const integrationId = req.id;
        const { groupId } = req.params;

        if (!groupId) {
            throw new ErrorBody(400, 'PhoneBook Group ID is required');
        }

        await deletePhoneBookGroupAndRelationsService(integrationId, groupId);

        res.send({
            success: true,
            data: true,
        });
    } catch (error) {
        logger.error('Unable to delete the phone book group at the moment');
        logger.error(error.message);

        next(
            new ErrorBody(
                error.statusCode || 500,
                error.message || 'Server error occurred',
                error.errors || []
            )
        );
    }
};



module.exports = {
    addNewPhoneBookController,
    getPhoneBookForIntegration,
    updatePhoneBook,
    updatePhoneBookGroupByIdController,
    addNewPhoneBookGroupController,
    getNewPhoneBookGroupController,
    deletePhoneBookByIdController,
    getPhoneBookDetailsForIntegration,
    deletePhoneBookGroupById
}

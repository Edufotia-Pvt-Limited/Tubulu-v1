const { validationResult } = require("express-validator");
const ErrorBody = require("../Utils/ErrorBody");
const { newQRCategoryService, getAllQRCategoriesService, newQRCode, getALLQRCodesService, getQRCodeByIdService, removeQRCodeById, updateQRCodeService } = require("../Services/QRCode.Service");
const { generateUUID } = require("../Utils/Helper");
const { uploadBase64ToAws } = require("../Utils/FileHelper");

async function getAllQRCodeCategories(req, res, next) {
    try {
        const { id: integrationId } = req;
        const data = await getAllQRCategoriesService(integrationId);
        res.send({
            success: true,
            data
        })
    } catch (error) {
        console.log('Unable to get the qr code categories at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function getQRCodeByIdController(req, res, next) {
    try {
        const { id: integrationId, params: { id } } = req;
        const data = await getQRCodeByIdService(id, integrationId);
        res.send({
            success: true,
            data,
        })
    } catch (error) {
        console.log('Unable to get the Qr code by id');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function deleteQRCodeByIdController(req, res, next) {
    try {
        const { id: integrationId, params: { id } } = req;
        await removeQRCodeById(id, integrationId);
        res.send({
            success: true,
            data: true,
        })
    } catch (error) {
        console.log('Unable to delete the QR code at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function getAllQRCodes(req, res, next) {
    try {
        const { id: integrationId, query: { page = 0, size = 10, search = '' } } = req;
        const data = await getALLQRCodesService(page, size, search, integrationId);
        res.send({
            success: true,
            data,
        })
    } catch (error) {
        console.log('Unable to get the QR codes at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function updateQRCodeController(req, res, next) {
    try{
        const { errors } = validationResult(req);
        if (errors.length) {
            next(new ErrorBody(400, 'Invalid request', errors));
            return;
        }
        const { id: integrationId, body: { title, subTitle, categoryId, groupId, welcomeMessage, file, mimeType, fileName, phoneBookGroup }, params: {id} } = req;
        let welcomeMessageDocument = undefined;
        if (!!file && !!mimeType && !!fileName) {
            const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName)
            welcomeMessageDocument = s3FileName;
        }
        const uuid = generateUUID();
        const data = await updateQRCodeService({ title, subTitle, categoryId, groupId, welcomeMessage, uuid, welcomeMessageDocument, integrationId, phoneBookGroups: phoneBookGroup }, id, integrationId);
        res.send({
            success: true,
            data,
        })
    }catch(error){
        console.log('Unable to update the QR code at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function createNewQRCodeController(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            next(new ErrorBody(400, 'Invalid request', errors));
            return;
        }
        const { id: integrationId, body: { title, subTitle, categoryId, groupId, welcomeMessage, file, mimeType, fileName, phoneBookGroup } } = req;
        let welcomeMessageDocument = undefined;
        if (!!file && !!mimeType && !!fileName) {
            const { s3FileName } = await uploadBase64ToAws(file, mimeType, fileName)
            welcomeMessageDocument = s3FileName;
        }
        const uuid = generateUUID();
        const data = await newQRCode({ title, subTitle, categoryId, groupId, welcomeMessage, uuid, welcomeMessageDocument, integrationId, phoneBookGroups: phoneBookGroup });
        res.send({
            success: true,
            data,
        })
    } catch (error) {
        console.log('Unable to create the new QR code at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

async function newQRCodeCategory(req, res, next) {
    try {
        const { errors } = validationResult(req);
        if (errors.length) {
            next(new ErrorBody(400, 'Invalid request', errors));
            return;
        }
        const { id: integrationId, body: { title } } = req;
        const uuid = generateUUID();
        const details = await newQRCategoryService(title, uuid, integrationId);
        res.send({
            success: true,
            data: details
        })
    } catch (error) {
        console.log('Unable to create new category at the moment');
        console.log(error);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred', []));
    }
}

module.exports = {
    newQRCodeCategory,
    getAllQRCodeCategories,
    createNewQRCodeController,
    getAllQRCodes,
    getQRCodeByIdController,
    updateQRCodeController,
    deleteQRCodeByIdController
}
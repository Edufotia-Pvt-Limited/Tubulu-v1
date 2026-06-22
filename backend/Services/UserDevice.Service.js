const { UserDevice } = require('../Utils/Postgres');
const { generateUUID } = require('../Utils/Helper');
const { Op } = require('sequelize');

function createUserDevice(reqBody) {
    return UserDevice.create(reqBody);
}

function getUserDeviceByUserId(userId) {
    return UserDevice.findOne({ where: { userId } });
}

function getUserDevicesByUserIds(userIds) {
    return UserDevice.findAll({ where: { userId: { [Op.in]: userIds } } });
}

function updateUserDeviceByUserId(userId, reqBody) {
    return UserDevice.update(reqBody, { where: { userId } });
}

async function upsertUserDeviceByUserId(userId, reqBody) {
    const existing = await getUserDeviceByUserId(userId);
    if (existing) {
        await updateUserDeviceByUserId(userId, reqBody);
    } else {
        await createUserDevice({ ...reqBody, userId });
    }
    return getUserDeviceByUserId(userId);
}

async function addDeviceToken(userId, fcmToken) {
    const existing = await getUserDeviceByUserId(userId);
    if (existing) {
        // Merge token into existing array (stored as JSONB in PG)
        const tokens = Array.isArray(existing.fcmToken) ? existing.fcmToken : [];
        if (!tokens.includes(fcmToken)) {
            tokens.push(fcmToken);
            await updateUserDeviceByUserId(userId, { fcmToken: tokens });
        }
    } else {
        await createUserDevice({
            uuid: generateUUID(),
            userId,
            fcmToken: [fcmToken],
        });
    }
    return getUserDeviceByUserId(userId);
}

function getDeviceTokensForMultipleUsers(userIds) {
    return UserDevice.findAll({ where: { userId: { [Op.in]: userIds } } });
}

module.exports = {
    createUserDevice,
    getUserDeviceByUserId,
    addDeviceToken,
    updateUserDeviceByUserId,
    upsertUserDeviceByUserId,
    getDeviceTokensForMultipleUsers,
    getUserDevicesByUserIds,
};
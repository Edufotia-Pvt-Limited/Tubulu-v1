const { User } = require('../Utils/Postgres');
const { Op } = require('sequelize');

async function getAllUsers(params = {}) {
    const { page = 0, size = 10, search = '' } = params;
    const offset = page * size;
    const limit = size;

    const where = {};
    if (search) {
        where[Op.or] = [
            { phoneNumber: { [Op.iLike]: `%${search}%` } },
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });

    return {
        total: count,
        users: rows,
        page,
        size
    };
}

async function getUserByPhoneNumber(phoneNumber) {
    return User.findOne({ where: { phoneNumber } });
}

async function createUser(userData) {
    return User.create(userData);
}

async function updateUserByPhoneNumber(phoneNumber, updateData) {
    return User.update(updateData, { where: { phoneNumber } });
}

module.exports = {
    getAllUsers,
    getUserByPhoneNumber,
    createUser,
    updateUserByPhoneNumber
};

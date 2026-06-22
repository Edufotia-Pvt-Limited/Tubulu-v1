const { Settlement } = require('../Utils/Postgres');
const ErrorBody = require('../Utils/ErrorBody');

async function getMerchantSettlements(req, res, next) {
    try {
        const integrationId = req.id;
        const { page = 0, size = 10 } = req.query;

        const { count, rows } = await Settlement.findAndCountAll({
            where: { integrationId },
            limit: parseInt(size),
            offset: parseInt(page) * parseInt(size),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            total: count,
            page: parseInt(page),
            size: parseInt(size)
        });
    } catch (error) {
        next(new ErrorBody(500, error.message || 'Failed to fetch settlements'));
    }
}

module.exports = {
    getMerchantSettlements
};

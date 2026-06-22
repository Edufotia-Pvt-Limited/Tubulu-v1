const { Integration } = require('../Utils/Postgres');
const { Op, Sequelize } = require('sequelize');

/**
 * Get merchants with hyperlocal filtering (5-10km radius)
 * @param {Object} params - { lat, lng, radius, category, search, page, size }
 */
async function getHyperlocalIntegrations(params) {
    const { 
        lat, 
        lng, 
        radius = 10, // Default 10km
        category, 
        search, 
        page = 0, 
        size = 10 
    } = params;

    const offset = page * size;
    const limit = size;

    const whereClause = {
        isActive: true,
        isApproved: true
    };

    if (category) {
        whereClause.category = category;
    }

    if (search) {
        whereClause.integrationName = {
            [Op.iLike]: `%${search}%`
        };
    }

    // 📍 Haversine formula for distance calculation in SQL
    // radius is in KM
    let attributes = { include: [] };
    
    if (lat && lng) {
        const distanceSql = Sequelize.literal(`
            6371 * acos(LEAST(GREATEST(
                cos(radians(${lat})) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(${lng})) + 
                sin(radians(${lat})) * sin(radians(latitude))
            , -1.0), 1.0))
        `);

        whereClause[Op.and] = Sequelize.where(distanceSql, { [Op.lte]: radius });
        
        attributes.include.push([distanceSql, 'distance']);
    }

    const { count, rows } = await Integration.findAndCountAll({
        where: whereClause,
        attributes,
        order: lat && lng ? [[Sequelize.literal('distance'), 'ASC']] : [['integrationName', 'ASC']],
        limit,
        offset,
    });

    return {
        total: count,
        data: rows,
        page,
        size
    };
}

module.exports = {
    getHyperlocalIntegrations
};

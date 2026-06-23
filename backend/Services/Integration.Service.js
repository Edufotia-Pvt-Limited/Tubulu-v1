const { Integration, Catalogue, Product, Order, ChatRoom, City, State, Country, IntegrationFB, IntegrationGrocery, IntegrationRetail } = require("../Utils/Postgres");
const { Op, Sequelize } = require('sequelize');

const getHashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const appendRatingsToIntegrations = async (integrations) => {
  if (!integrations) return integrations;
  const { Review } = require('../Utils/Postgres');
  
  const isArray = Array.isArray(integrations);
  const list = isArray ? integrations : [integrations];
  if (list.length === 0) return integrations;

  const integrationIds = list.map(i => i.id);

  // Group by integrationId and calculate average rating and count
  const stats = await Review.findAll({
    attributes: [
      'integrationId',
      [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
      [Sequelize.fn('COUNT', Sequelize.col('rating')), 'ratingCount']
    ],
    where: { integrationId: { [Op.in]: integrationIds } },
    group: ['integrationId'],
    raw: true
  });

  const statsMap = {};
  stats.forEach(s => {
    statsMap[s.integrationId] = {
      avgRating: parseFloat(s.avgRating || 0),
      ratingCount: parseInt(s.ratingCount || 0)
    };
  });

  list.forEach(i => {
    const stat = statsMap[i.id];
    const hash = getHashCode(i.id.toString());
    const baseMockRating = 4.1 + (hash % 7) * 0.1;
    const baseMockCount = 50 + (hash % 18) * 150;

    if (stat && stat.ratingCount > 0) {
      const totalCount = baseMockCount + stat.ratingCount;
      const mockWeight = 3;
      const totalRatingSum = (baseMockRating * mockWeight) + (stat.avgRating * stat.ratingCount);
      const calculatedRating = totalRatingSum / (mockWeight + stat.ratingCount);
      let finalRating = parseFloat(calculatedRating.toFixed(1));
      
      if (stat.avgRating > baseMockRating && finalRating <= baseMockRating) {
        finalRating = parseFloat((baseMockRating + 0.1).toFixed(1));
      }
      
      i.setDataValue('rating', Math.min(finalRating, 5.0));
      i.setDataValue('ratingCount', totalCount);
    } else {
      i.setDataValue('rating', parseFloat(baseMockRating.toFixed(1)));
      i.setDataValue('ratingCount', baseMockCount);
    }
  });

  return isArray ? list : list[0];
};

function createIntegration(reqBody) {
  return Integration.create(reqBody);
}

function updateIntegration(reqBody, integrationId) {
  return Integration.update(reqBody, {
    where: { id: integrationId }
  });
}

async function getAllIntegrationsNoParams() {
  const integrations = await Integration.findAll({
    where: {
      isActive: true,
      isApproved: true
    },
    include: [
        {
            model: Catalogue,
            as: 'catalogues',
            where: { isDeleted: false },
            required: false,
            include: [
                {
                    model: Product,
                    as: 'products',
                    where: { isDeleted: false },
                    required: false
                }
            ]
        }
    ]
  });
  return appendRatingsToIntegrations(integrations);
}

async function getAllIntegrations(params) {
  const _size = parseInt(params.size || 10);
  const _page = parseInt(params.page || 0);
  const { category, lat, lng, radius = 10 } = params;
  const search = typeof params.search === "string" ? params.search.trim() : "";

  const whereClause = {
    isActive: params.showAll === 'true' ? { [Op.in]: [true, false] } : true,
    role: { [Op.ne]: 'super_admin' } // Don't show super admins in merchant list
  };

  if (params.showAll !== 'true') {
    whereClause.isSuspended = false;
  }

  if (params.isApproved === 'true') {
    whereClause.isApproved = true;
  } else if (params.isApproved === 'false') {
    whereClause.isApproved = false;
  }
  // Default for non-admin discovery is to show only approved
  else if (params.showAll !== 'true') {
    whereClause.isApproved = true;
  }

  if (category && category !== 'all') {
    if (category.toLowerCase() === 'food' || category.toLowerCase().includes('food') || category.toLowerCase().includes('restaurant')) {
      whereClause.category = { [Op.in]: ['Food', 'Food and beverages', 'FB', 'F&B', 'F&b'] };
    } else if (category.toLowerCase().includes('grocery') || category.toLowerCase().includes('groceries')) {
      whereClause.category = { [Op.in]: ['GROCERY', 'Grocery', 'groceries', 'Groceries'] };
    } else if (category.toLowerCase().includes('ai') || category.toLowerCase().includes('ml')) {
      // Match 'AI & ML', 'AI', 'Artificial Intelligence', 'Machine Learning' case-insensitively
      whereClause.category = {
        [Op.or]: [
          { [Op.iLike]: 'AI%' },
          { [Op.iLike]: '%ML%' },
          { [Op.iLike]: '%Artificial%' },
          { [Op.iLike]: '%Machine%' },
        ]
      };
    } else {
      whereClause.category = { [Op.iLike]: category };
    }
  }

  if (search) {
    whereClause.integrationName = {
      [Op.iLike]: `%${search}%`
    };
  }

  let attributes = { include: [] };
  let order = [['integrationName', 'ASC']];

  if (lat && lng) {
    const distanceSql = Sequelize.literal(`
        6371 * acos(LEAST(GREATEST(
            cos(radians(${lat})) * cos(radians("Integration".latitude)) * 
            cos(radians("Integration".longitude) - radians(${lng})) + 
            sin(radians(${lat})) * sin(radians("Integration".latitude))
        , -1.0), 1.0))
    `);

    whereClause[Op.and] = Sequelize.where(
      Sequelize.literal(`
        CASE
          WHEN "Integration".latitude IS NULL OR "Integration".longitude IS NULL THEN 999999
          ELSE 6371 * acos(LEAST(GREATEST(
            cos(radians(${lat})) * cos(radians("Integration".latitude)) * 
            cos(radians("Integration".longitude) - radians(${lng})) + 
            sin(radians(${lat})) * sin(radians("Integration".latitude))
          , -1.0), 1.0))
        END
      `),
      { [Op.lte]: radius }
    );

    // Add distance field — null for merchants without coordinates
    attributes.include.push([
      Sequelize.literal(`
        CASE
          WHEN "Integration".latitude IS NULL OR "Integration".longitude IS NULL THEN NULL
          ELSE ROUND((6371 * acos(LEAST(GREATEST(
            cos(radians(${lat})) * cos(radians("Integration".latitude)) * 
            cos(radians("Integration".longitude) - radians(${lng})) + 
            sin(radians(${lat})) * sin(radians("Integration".latitude))
          , -1.0), 1.0)))::numeric, 2)
        END
      `),
      'distance'
    ]);

    // Sort: merchants with coords by distance, then those without at the end
    order = [
      [Sequelize.literal(`CASE WHEN "Integration".latitude IS NULL OR "Integration".longitude IS NULL THEN 1 ELSE 0 END`), 'ASC'],
      [Sequelize.literal('distance'), 'ASC']
    ];
  }

  const isTopRatedSort = params.sort === 'topRated';
  if (isTopRatedSort) {
    order = [['trustScore', 'DESC']];
  }

  const queryOptions = {
    where: whereClause,
    attributes,
    include: [
        {
            model: Catalogue,
            as: 'catalogues',
            where: { isDeleted: false },
            required: false,
            include: [
                {
                    model: Product,
                    as: 'products',
                    where: { isDeleted: false },
                    required: false
                }
            ]
        }
    ],
    order,
    distinct: true
  };

  if (!isTopRatedSort) {
    queryOptions.limit = _size;
    queryOptions.offset = _page * _size;
  }

  const { count, rows } = await Integration.findAndCountAll(queryOptions);

  let rowsWithRatings = await appendRatingsToIntegrations(rows);

  if (isTopRatedSort) {
    rowsWithRatings.sort((a, b) => {
      const ratingA = a.getDataValue('rating') || 0;
      const ratingB = b.getDataValue('rating') || 0;
      const distA = parseFloat(a.getDataValue('distance') ?? 999);
      const distB = parseFloat(b.getDataValue('distance') ?? 999);
      
      const scoreA = ratingA * 10 - distA;
      const scoreB = ratingB * 10 - distB;
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      const countA = a.getDataValue('ratingCount') || 0;
      const countB = b.getDataValue('ratingCount') || 0;
      return countB - countA;
    });

    const startIndex = _page * _size;
    rowsWithRatings = rowsWithRatings.slice(startIndex, startIndex + _size);
  }

  return rowsWithRatings;
}

function getIntegrationByPhoneNumberService(phoneNumber) {
  let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.length > 10) {
    cleanPhone = cleanPhone.slice(-10);
  }
  return Integration.findOne({
    where: {
      [Op.or]: [
        { phoneNumber },
        { phoneNumber: cleanPhone },
        { phoneNumber: `+91${cleanPhone}` },
        { phoneNumber: `91${cleanPhone}` },
        { phoneNumber: `+${cleanPhone}` }
      ]
    },
    order: [
      ['isApproved', 'DESC'],
      ['isOnboarded', 'DESC']
    ]
  });
}

async function getIntegrationByIntegrationId(integrationId) {
  const where = {};
  // Check if it looks like a Mongo ID (24-char hex)
  if (typeof integrationId === 'string' && /^[0-9a-fA-F]{24}$/.test(integrationId)) {
    where[Op.or] = [{ id: integrationId }, { mongoId: integrationId }];
  } else {
    where.id = integrationId;
  }

  const integration = await Integration.findOne({ 
    where,
    include: [
        {
            model: Catalogue,
            as: 'catalogues',
            where: { isDeleted: false },
            required: false,
            include: [
                {
                    model: Product,
                    as: 'products',
                    where: { isDeleted: false },
                    required: false
                }
            ]
        },
        { model: Integration, as: 'parent', attributes: ['id', 'integrationName', 'role'] },
        { model: City, as: 'city_detail', attributes: ['id', 'name'] },
        { model: State, as: 'state_detail', attributes: ['id', 'name'] },
        { model: Country, as: 'country_detail', attributes: ['id', 'name'] },
        { model: IntegrationFB, as: 'fbDetails', required: false },
        { model: IntegrationGrocery, as: 'groceryDetails', required: false },
        { model: IntegrationRetail, as: 'retailDetails', required: false }
    ]
  });
  if (!integration) {
    throw new Error("Integration not found");
  }
  return appendRatingsToIntegrations(integration);
}

function getIntegrationByAuthKey(authKey) {
  return Integration.findOne({
    where: { apiAuthKey: authKey }
  });
}

function updateRegisteredIntegration(phoneNumber, reqBody) {
  return Integration.update(reqBody, {
    where: { phoneNumber }
  });
}

function getUnregisteredIntegrationByPhoneAndCode(phoneNumber, code) {
  let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.length > 10) {
    cleanPhone = cleanPhone.slice(-10);
  }
  return Integration.findOne({
    where: {
      phoneNumberOtp: code,
      [Op.or]: [
        { phoneNumber },
        { phoneNumber: cleanPhone },
        { phoneNumber: `+91${cleanPhone}` },
        { phoneNumber: `91${cleanPhone}` },
        { phoneNumber: `+${cleanPhone}` }
      ]
    }
  });
}

async function getDashboardStatsService(integrationId, duration = 'all') {
    console.log(`[STATS] Fetching for Merchant ID: ${integrationId}, Duration: ${duration}`);

    let dateFilter = {};
    if (duration && duration !== 'all') {
        const now = new Date();
        let startDate;
        if (duration === 'today') {
            startDate = new Date(now.setUTCHours(0, 0, 0, 0));
        } else if (duration === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (duration === 'month') {
            startDate = new Date(now.setDate(now.getDate() - 30));
        } else if (duration === 'year') {
            startDate = new Date(now.setDate(now.getDate() - 365));
        }
        if (startDate) {
            dateFilter = {
                createdAt: {
                    [Op.gte]: startDate
                }
            };
        }
    }
    
    const [totalProducts, activeOrders, totalSales, totalOrders] = await Promise.all([
        Product.count({ where: { integrationId, isDeleted: false } }),
        Order.count({ where: { integrationId, ...dateFilter, status: { [Op.notIn]: ['delivered', 'canceled'] } } }),
        Order.sum('totalPrice', { 
            where: { 
                integrationId, 
                ...dateFilter,
                [Op.or]: [
                    { paymentStatus: 'paid' },
                    { status: 'delivered' }
                ]
            } 
        }),
        Order.count({ where: { integrationId, ...dateFilter } })
    ]);

    console.log(`[STATS] Results: Products=${totalProducts}, ActiveOrders=${activeOrders}, TotalOrders=${totalOrders}, Sales=${totalSales}`);

    // Simple 7-day order graph data
    const last7Days = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setUTCDate(today.getUTCDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const count = await Order.count({
            where: {
                integrationId,
                createdAt: {
                    [Op.gte]: new Date(dateStr + 'T00:00:00Z'),
                    [Op.lte]: new Date(dateStr + 'T23:59:59Z')
                }
            }
        });
        
        last7Days.push({
            date: dateStr, // Use YYYY-MM-DD for stable parsing
            value: count
        });
    }

    return {
        totalProducts,
        activeOrders,
        totalOrders,
        totalSales: totalSales || 0,
        graphData: last7Days
    };
}

async function getSuperAdminStatsService() {
  const merchantFilter = {
    isActive: true,
    category: { [Op.notIn]: ['SuperAdmin', 'super_admin'] },
    role: { [Op.notIn]: ['super_admin'] },
    integrationName: { 
      [Op.and]: [
        { [Op.notILike]: '%duplicate%' },
        { [Op.notILike]: '%archived%' }
      ]
    }
  };

  const [totalMerchants, activeStores, totalProducts, totalOrders, totalConversations] = await Promise.all([
    Integration.count({ where: merchantFilter }),
    Integration.count({ where: { ...merchantFilter, isApproved: true } }),
    Product.count({ where: { isDeleted: false } }),
    Order.count(),
    ChatRoom.count()
  ]);

  console.log('STATS DEBUG:', { totalMerchants, activeStores });

  // Get category distribution
  const categoryDistribution = await Integration.findAll({
    where: merchantFilter,
    attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('category')), 'count']],
    group: ['category'],
    raw: true
  });

  // Get daily onboarding growth (last 30 days)
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

  return {
    totalMerchants,
    activeStores,
    totalProducts,
    totalOrders,
    totalConversations,
    categoryDistribution,
    monthlyGrowth
  };
}

module.exports = {
  getAllIntegrations,
  createIntegration,
  getIntegrationByIntegrationId,
  getIntegrationByAuthKey,
  updateIntegration,
  getIntegrationByPhoneNumberService,
  getUnregisteredIntegration: getIntegrationByPhoneNumberService, // Alias for compatibility
  updateRegisteredIntegration,
  updateUnregisteredIntegration: updateRegisteredIntegration, // Alias for compatibility
  getUnregisteredIntegrationByPhoneAndCode,
  getAllIntegrationsNoParams,
  getDashboardStatsService,
  getSuperAdminStatsService
};

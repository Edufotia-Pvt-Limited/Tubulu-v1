const { Deal, Integration, Catalogue, Product } = require('../Utils/Postgres');
const { Op } = require('sequelize');

// -------------------------------
// Create Deal Service
// -------------------------------
const createDealService = async (validatedDealData, integrationId) => {
  try {
    const cleanName = validatedDealData.name.trim().replace(/\s+/g, ' ');
    const cleanDescription = Array.isArray(validatedDealData.descriptions)
      ? validatedDealData.descriptions.map(desc => desc.trim().replace(/\s+/g, ' '))
      : [];

    const integration = await Integration.findByPk(integrationId);
    if (!integration) throw new Error('Invalid integrationId');

    const existingDeal = await Deal.findOne({ where: { name: cleanName, integrationId, isDeleted: false } });
    if (existingDeal) throw new Error('Deal with this name already exists');

    if (validatedDealData.discountType === 'percentage' && validatedDealData.discountValue > 100)
      throw new Error('Percentage discount cannot exceed 100%');

    if (new Date(validatedDealData.endDate) <= new Date(validatedDealData.startDate))
      throw new Error('End date must be greater than start date');

    if (validatedDealData.discountType === 'bogo') {
      if (!validatedDealData.buyQuantity || !validatedDealData.getQuantity)
        throw new Error('Buy X Get Y deal requires buyQuantity and getQuantity');
    }

    const dealData = {
      ...validatedDealData,
      name: cleanName,
      descriptions: cleanDescription,
      usageCount: 0,
      integrationId,
    };

    return Deal.create(dealData);
  } catch (err) {
    console.error('Error in createDealService:', err);
    throw err;
  }
};


const getAllDealsService = async (integrationId, page, search) => {
  try {
    const limit = 5;
    const offset = (page - 1) * limit;

    const where = { integrationId, isDeleted: false };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows: deals } = await Deal.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    return {
      data: deals,
      pagination: {
        total: count,
        page: Number(page),
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error('Error in getAllDealsService:', error);
    throw error;
  }
};


const deleteDealService = async (dealId, integrationId) => {
  try {
    const deal = await Deal.findOne({ where: { id: dealId, integrationId } });
    if (!deal) throw new Error('Deal not found for this integration');
    if (deal.isDeleted) throw new Error('Deal is already deleted');

    await deal.update({ isDeleted: true, isActive: false });
    return deal;
  } catch (error) {
    console.error('Error in deleteDealService:', error);
    throw error;
  }
};


const updateDealService = async (dealId, updateData, integrationId) => {
  try {
    if (updateData.name) {
      const cleanName = updateData.name.trim().replace(/\s+/g, ' ');
      updateData.name = cleanName;

      const duplicateDeal = await Deal.findOne({
        where: {
          id: { [Op.ne]: dealId },
          name: cleanName,
          integrationId,
          isDeleted: false,
        },
      });
      if (duplicateDeal) throw new Error('Deal with this name already exists');
    }

    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) > new Date(updateData.endDate))
        throw new Error('Start date cannot be greater than end date');
    }

    if (updateData.discountType) {
      if (updateData.discountType !== 'bogo') {
        updateData.buyQuantity = 0;
        updateData.getQuantity = 0;
      } else {
        if (!updateData.buyQuantity || !updateData.getQuantity)
          throw new Error('buyQuantity and getQuantity are required for BOGO deals');
      }
    }

    const deal = await Deal.findOne({ where: { id: dealId, integrationId, isDeleted: false } });
    if (!deal) throw new Error('Deal not found for this integration or has been deleted');

    await deal.update(updateData);
    return deal;
  } catch (error) {
    console.error('Error in updateDealService:', error);
    throw error;
  }
};


const updateDealStatusService = async (dealId, isActive, integrationId) => {
  const deal = await Deal.findOne({ where: { id: dealId, integrationId, isDeleted: false } });
  if (!deal) throw new Error('Deal not found or already deleted');
  await deal.update({ isActive });
  return deal;
};


const updateDealOfTheDayStatusService = async (dealId, isDealOfTheDay, integrationId) => {
  const deal = await Deal.findOne({ where: { id: dealId, integrationId, isDeleted: false } });
  if (!deal) throw new Error('Deal not found');

  if (isDealOfTheDay) {
    const alreadyDealOfTheDay = await Deal.findOne({
      where: {
        id: { [Op.ne]: dealId },
        integrationId,
        isDealOfTheDay: true,
        isDeleted: false,
      },
    });
    if (alreadyDealOfTheDay)
      throw new Error('Another deal is already marked as Deal Of The Day. Please remove it first.');
  }

  await deal.update({ isDealOfTheDay });
  return deal;
};


const applyDealsOnProductsService = async (integrationId, dealId, catalogueId, productIds, removedProductIds = []) => {
  const integration = await Integration.findByPk(integrationId);
  if (!integration) throw new Error('Integration not found');

  const catalogue = await Catalogue.findOne({ where: { id: catalogueId, integrationId, isDeleted: false } });
  if (!catalogue) throw new Error('Catalogue not found or has been deleted');

  const deal = await Deal.findOne({ where: { id: dealId, integrationId, isDeleted: false } });
  if (!deal) throw new Error('Deal not found for this integration');

  let appliesOnProducts = Array.isArray(deal.appliesOnProducts) ? [...deal.appliesOnProducts] : [];
  let updatedCount = 0;

  for (const productId of productIds) {
    if (!appliesOnProducts.includes(productId)) {
      appliesOnProducts.push(productId);
      updatedCount++;
    }
  }

  if (removedProductIds.length) {
    appliesOnProducts = appliesOnProducts.filter(id => !removedProductIds.includes(String(id)));
    updatedCount += removedProductIds.length;
  }

  await deal.update({ appliesOnProducts, catalogueId });
  return { updatedCount };
};


const getApplyDealsDetailsService = async (integrationId, dealId) => {
  try {
    const catalogues = await Catalogue.findAll({
      where: { integrationId, isDeleted: false },
      attributes: ['id', 'name'],
    });

    const deal = await Deal.findOne({ where: { id: dealId, integrationId, isDeleted: false } });
    if (!deal) throw new Error('Deal not found');

    return {
      deal: deal.toJSON(),
      catalogues: catalogues.map(c => ({ _id: c.id, name: c.name })),
    };
  } catch (error) {
    console.error('Error in getApplyDealsDetailsService:', error);
    throw error;
  }
};


const getDealProductsForApplyService = async (query, catalogueId, dealId, integrationId, page = 1, limit = 5) => {
  const integration = await Integration.findByPk(integrationId);
  if (!integration) throw new Error('Integration not found');

  const deal = await Deal.findOne({ where: { id: dealId, integrationId, isDeleted: false } });
  if (!deal) throw new Error('Deal not found');

  const dealProductIds = new Set((deal.appliesOnProducts || []).map(id => id.toString()));

  const where = { catalogueId, isDeleted: false };
  if (query) where.name = { [Op.iLike]: `%${query}%` };

  const products = await Product.findAll({ where });

  const results = products.map(product => ({
    productId: product.id,
    productName: product.name,
    productDescription: product.description,
    productImages: product.imageUrls || [],
    quantity: product.quantity,
    category: product.category,
    subCategory: product.subcategory,
    productPrice: product.price,
    discountPrice: product.discountPrice,
    integrationName: integration.integrationName,
    isActive: product.isActive,
    isAppliedToDeal: dealProductIds.has(product.id.toString()),
  }));

  const total = results.length;
  const startIndex = (page - 1) * limit;
  return { results: results.slice(startIndex, startIndex + limit), total };
};


module.exports = {
  createDealService,
  getAllDealsService,
  updateDealService,
  deleteDealService,
  updateDealStatusService,
  updateDealOfTheDayStatusService,
  applyDealsOnProductsService,
  getApplyDealsDetailsService,
  getDealProductsForApplyService,
};

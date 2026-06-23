const { Advertisement, Integration, sequelize } = require('../Utils/Postgres');
const Sequelize = require('sequelize');
const { uploadFileToAws } = require('../Utils/awsUpload');
const { Op } = require('sequelize');


const createAdvertisementService = async (data) => {
  let { name, description, integrationId, banner, creatorUser } = data;
  const cleanName = name.trim().replace(/\s+/g, ' ').toLowerCase();

  const existing = await Advertisement.findOne({ where: { name: cleanName, isDeleted: false } });
  if (existing) throw new Error('Advertisement with this name already exists');

  let integration = await Integration.findByPk(integrationId);
  if (!integration && creatorUser && ['super_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin'].includes(creatorUser.role?.toLowerCase())) {
    integration = await Integration.findOne({ where: { role: 'super_admin' } });
    if (integration) {
      integrationId = integration.id;
    }
  }

  if (!integration) throw new Error('Integration not found');

  let bannerUrl = 'https://placehold.co/600x400?text=Ad';

  if (banner) {
    const uploadResult = await uploadFileToAws(
      banner.buffer, banner.mimetype, banner.originalname,
      integrationId, integration.integrationName, 'advertisements'
    );
    bannerUrl = uploadResult.url;
  }

  let targetCity = null;
  let targetState = null;

  if (creatorUser && creatorUser.role === 'city_manager' && creatorUser.scopedCityId) {
    const { City, State } = require('../Utils/Postgres');
    const cityObj = await City.findByPk(creatorUser.scopedCityId, {
      include: [{ model: State, as: 'state' }]
    });
    if (cityObj) {
      targetCity = cityObj.name;
      if (cityObj.state) {
        targetState = cityObj.state.name;
      }
    }
  } else {
    const { City, State } = require('../Utils/Postgres');
    const integrationWithLoc = await Integration.findByPk(integrationId, {
      include: [
        { model: City, as: 'city_detail' },
        { model: State, as: 'state_detail' }
      ]
    });
    if (integrationWithLoc) {
      targetCity = integrationWithLoc.city || (integrationWithLoc.city_detail ? integrationWithLoc.city_detail.name : null);
      targetState = integrationWithLoc.state || (integrationWithLoc.state_detail ? integrationWithLoc.state_detail.name : null);
    }
  }

  // Deactivate any existing active advertisement for the same integration and targetCity
  await Advertisement.update(
    { isActive: false },
    {
      where: {
        integrationId,
        targetCity: targetCity === undefined ? null : targetCity,
        isActive: true,
        isDeleted: false
      }
    }
  );

  const isActive = true;

  return Advertisement.create({ 
    name: cleanName, 
    description, 
    bannerUrl, 
    integrationId, 
    isActive,
    targetCity,
    targetState,
    latitude: null,
    longitude: null,
    radius: null
  });
};


const getAllAdvertisementService = async (integrationId, page, search, creatorUser) => {
  const limit = 5;
  const offset = (page - 1) * limit;

  let queryIntegrationId = integrationId;

  if (creatorUser && ['super_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin'].includes(creatorUser.role?.toLowerCase())) {
    const superAdminInt = await Integration.findOne({ where: { role: 'super_admin' } });
    if (superAdminInt) {
      queryIntegrationId = superAdminInt.id;
    }
  }

  const where = { integrationId: queryIntegrationId, isDeleted: false };
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  if (creatorUser && creatorUser.role === 'city_manager' && creatorUser.scopedCityId) {
    const { City } = require('../Utils/Postgres');
    const cityObj = await City.findByPk(creatorUser.scopedCityId);
    if (cityObj) {
      where.targetCity = cityObj.name;
    }
  }

  const { count, rows: advertisements } = await Advertisement.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  return {
    data: advertisements,
    pagination: { total: count, page: Number(page), limit, totalPages: Math.ceil(count / limit) },
  };
};


const deleteAdvertisementService = async (advertisementId, integrationId, creatorUser) => {
  let queryIntegrationId = integrationId;
  if (creatorUser && ['super_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin'].includes(creatorUser.role?.toLowerCase())) {
    const superAdminInt = await Integration.findOne({ where: { role: 'super_admin' } });
    if (superAdminInt) queryIntegrationId = superAdminInt.id;
  }

  const ad = await Advertisement.findOne({ where: { id: advertisementId, integrationId: queryIntegrationId, isDeleted: false } });
  if (!ad) throw new Error('Advertisement not found');
  await ad.update({ isDeleted: true, isActive: false });
  return { advertisementId, deleted: true };
};


const updateAdvertisementStatusService = async (advertisementId, integrationId, isActive, creatorUser) => {
  let queryIntegrationId = integrationId;
  if (creatorUser && ['super_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin'].includes(creatorUser.role?.toLowerCase())) {
    const superAdminInt = await Integration.findOne({ where: { role: 'super_admin' } });
    if (superAdminInt) queryIntegrationId = superAdminInt.id;
  }

  const ad = await Advertisement.findOne({ where: { id: advertisementId, integrationId: queryIntegrationId, isDeleted: false } });
  if (!ad) throw new Error('Advertisement not found');

  if (isActive) {
    // Deactivate other active advertisements for the same integration and targetCity
    await Advertisement.update(
      { isActive: false },
      {
        where: {
          id: { [Op.ne]: advertisementId },
          integrationId: queryIntegrationId,
          targetCity: ad.targetCity,
          isActive: true,
          isDeleted: false,
        },
      }
    );
  }

  await ad.update({ isActive });
  return ad;
};


const getAdvertisementDetailsByIdService = async (advertisementId, integrationId, creatorUser) => {
  let queryIntegrationId = integrationId;
  if (creatorUser && ['super_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin'].includes(creatorUser.role?.toLowerCase())) {
    const superAdminInt = await Integration.findOne({ where: { role: 'super_admin' } });
    if (superAdminInt) queryIntegrationId = superAdminInt.id;
  }

  const ad = await Advertisement.findOne({ where: { id: advertisementId, integrationId: queryIntegrationId, isDeleted: false } });
  if (!ad) throw new Error('Advertisement not found');
  return ad;
};


const editAdvertisementByIdService = async (advertisementId, integrationId, updateData, creatorUser) => {
  let queryIntegrationId = integrationId;
  if (creatorUser && ['super_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin'].includes(creatorUser.role?.toLowerCase())) {
    const superAdminInt = await Integration.findOne({ where: { role: 'super_admin' } });
    if (superAdminInt) queryIntegrationId = superAdminInt.id;
  }

  const ad = await Advertisement.findOne({ where: { id: advertisementId, integrationId: queryIntegrationId, isDeleted: false } });
  if (!ad) throw new Error('Advertisement not found');

  delete updateData.targetCity;
  delete updateData.targetState;
  delete updateData.latitude;
  delete updateData.longitude;
  delete updateData.radius;

  if (updateData.name) {
    updateData.name = updateData.name.trim().replace(/\s+/g, ' ');
    const existing = await Advertisement.findOne({
      where: { id: { [Op.ne]: advertisementId }, integrationId: queryIntegrationId, name: updateData.name, isDeleted: false },
    });
    if (existing) throw new Error('Advertisement with this name already exists');
  }

  if (updateData.description) {
    updateData.description = updateData.description.trim().replace(/\s+/g, ' ');
  }

  if (updateData.banner) {
    const integration = await Integration.findByPk(queryIntegrationId);
    if (!integration) throw new Error('Integration not found');
    const uploadResult = await uploadFileToAws(
      updateData.banner.buffer, updateData.banner.mimetype, updateData.banner.originalname,
      integrationId, integration.integrationName, 'advertisements'
    );
    updateData.bannerUrl = uploadResult.url;
    delete updateData.banner;
  }

  await ad.update(updateData);
  return ad;
};


const getAppDiscoveryAdsService = async (params = {}) => {
  const { lat, lng, city, state } = params;
  
  // Find all active advertisements
  const allAds = await Advertisement.findAll({
    where: { 
      isActive: true, 
      isDeleted: false 
    },
    include: [
      {
        model: Integration,
        as: 'integration',
        where: { role: 'super_admin' },
        required: true,
      }
    ],
    order: [['createdAt', 'DESC']],
  });

  // Filter in memory to avoid Sequelize ambiguous SQL translation bugs entirely
  return allAds.filter(ad => {
    // 1. Regional Filters
    let matchesCity = false;
    let matchesState = false;
    const isGeofenced = ad.latitude !== null && ad.longitude !== null && ad.radius !== null;

    if (city && ad.targetCity && ad.targetCity.toLowerCase() === city.toLowerCase()) {
      matchesCity = true;
    }
    if (state && ad.targetState && ad.targetState.toLowerCase() === state.toLowerCase()) {
      matchesState = true;
    }

    const matchesRegion = matchesCity || matchesState || isGeofenced;
    if (!matchesRegion) return false;

    // 2. Distance Filters
    if (lat && lng && ad.latitude !== null && ad.longitude !== null && ad.radius !== null) {
      const lat1 = parseFloat(lat);
      const lon1 = parseFloat(lng);
      const lat2 = parseFloat(ad.latitude);
      const lon2 = parseFloat(ad.longitude);

      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return distance <= parseFloat(ad.radius);
    }

    return true;
  });
};


module.exports = {
  createAdvertisementService,
  getAllAdvertisementService,
  deleteAdvertisementService,
  updateAdvertisementStatusService,
  getAdvertisementDetailsByIdService,
  editAdvertisementByIdService,
  getAppDiscoveryAdsService,
};

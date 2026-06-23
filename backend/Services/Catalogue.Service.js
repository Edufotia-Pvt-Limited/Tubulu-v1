const { Integration, Catalogue, Product } = require('../Utils/Postgres');
const { catalogueCSVParse } = require("../Utils/csvParser");
const { uploadFileToAws } = require("../Utils/awsUpload");
const { Op } = require("sequelize");

const uploadCatalogueProductsService = async (
  integrationId,
  name,
  description,
  fileBuffer,
  mimeType,
  fileName,
  displayType,
  deliveryType
) => {
  const integration = await Integration.findByPk(integrationId);
  if (!integration) {
    throw new Error("Integration not found");
  }

  const uploadResult = await uploadFileToAws(
    fileBuffer,
    mimeType,
    fileName,
    integration.id,
    integration.integrationName,
    "catalogues"
  );

  const productsData = await catalogueCSVParse(fileBuffer);

  // Create relational Catalogue
  const catalogue = await Catalogue.create({
    name,
    description,
    integrationId,
    displayType: displayType || "Grid View",
    isActive: false,
    isDeleted: false
  });

  // Bulk create Products linked to this catalogue
  const productRecords = productsData.map(p => ({
    sku: p.sku || `SKU-${require('crypto').randomUUID()}`,
    name: p.name,
    description: p.description || '',
    price: p.price || 0,
    discountPrice: p.discountPrice || p.price || 0,
    currency: p.currency || 'INR',
    category: p.product_category || 'General',
    subcategory: p.product_subcategory || '',
    imageUrls: p.imageUrls || [],
    quantity: p.quantity || 0,
    isActive: true,
    isDeleted: false,
    integrationId,
    catalogueId: catalogue.id,
    specifications: {
      foodType: p.foodType || 'Other',
      cgst: p.cgst || 0,
      sgst: p.sgst || 0,
      otherTaxes: p.otherTaxes || 0,
      speciality: p.speciality || '',
      future_ref1: p.future_ref1 || '',
      future_ref2: p.future_ref2 || '',
      preference: p.preference || ''
    }
  }));

  await Product.bulkCreate(productRecords);

  return catalogue;
};

const getCatalogueService = async (integrationId, status, search, page = 1, limit = 5) => {
  const where = { integrationId, isDeleted: false };

  if (status && status !== "all") {
    if (status.toLowerCase() === "active") {
      where.isActive = true;
    }
  }

  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  const { sequelize } = require('../Utils/Postgres');
  
  const { count, rows: catalogues } = await Catalogue.findAndCountAll({
    where,
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM "Products" AS "products"
            WHERE "products"."catalogueId" = "Catalogue"."id" AND "products"."isDeleted" = false
          )`),
          'products_count'
        ]
      ]
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  return {
    catalogues,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const deleteCatalogueService = async (integrationId, catalogueId) => {
  const catalogue = await Catalogue.findOne({ where: { id: catalogueId, integrationId } });
  if (!catalogue) throw new Error("Catalogue not found");

  await catalogue.update({ isDeleted: true, isActive: false });
  return { message: "Catalogue deleted successfully" };
};

const updateCatalogueStatusService = async (integrationId, catalogueId, isActive) => {
  if (isActive) {
    // Deactivate all other catalogues for this integration
    await Catalogue.update({ isActive: false }, { where: { integrationId } });
  }

  const catalogue = await Catalogue.findOne({ where: { id: catalogueId, integrationId } });
  if (!catalogue) throw new Error("Catalogue not found");

  await catalogue.update({ isActive });
  return catalogue;
};

const createCatalogueService = async (integrationId, name, description, displayType) => {
  const integration = await Integration.findByPk(integrationId);
  if (!integration) {
    throw new Error("Integration not found");
  }

  const catalogue = await Catalogue.create({
    name,
    description,
    integrationId,
    displayType: displayType || "Grid View",
    isActive: false,
    isDeleted: false
  });

  return catalogue;
};

const updateCatalogueService = async (
  integrationId,
  catalogueId,
  name,
  description,
  fileBuffer,
  mimeType,
  fileName,
  mode,
  displayType
) => {
  const catalogue = await Catalogue.findOne({ where: { id: catalogueId, integrationId } });
  if (!catalogue) throw new Error("Catalogue not found");

  const updates = {};
  if (name) updates.name = name;
  if (description) updates.description = description;
  if (displayType) updates.displayType = displayType;

  await catalogue.update(updates);

  // If fileBuffer is passed, append or replace products
  if (fileBuffer) {
    const productsData = await catalogueCSVParse(fileBuffer);
    
    if (mode === 'replace') {
      await Product.update({ isDeleted: true }, { where: { catalogueId } });
    }

    const productRecords = productsData.map(p => ({
      sku: p.sku || `SKU-${require('crypto').randomUUID()}`,
      name: p.name,
      description: p.description || '',
      price: parseFloat(p.price) || 0,
      discountPrice: parseFloat(p.discountPrice) || parseFloat(p.price) || 0,
      currency: p.currency || 'INR',
      category: p.product_category || 'General',
      subcategory: p.product_subcategory || '',
      imageUrls: p.imageUrls || [],
      quantity: parseInt(p.quantity) || 0,
      isActive: true,
      isDeleted: false,
      integrationId,
      catalogueId: catalogue.id,
      specifications: {
        foodType: p.foodType || 'Other',
        cgst: parseFloat(p.cgst) || 0,
        sgst: parseFloat(p.sgst) || 0,
        otherTaxes: parseFloat(p.otherTaxes) || 0,
        speciality: p.speciality || '',
        future_ref1: p.future_ref1 || '',
        future_ref2: p.future_ref2 || '',
        preference: p.preference || ''
      }
    }));

    await Product.bulkCreate(productRecords);
  }

  return catalogue;
};

module.exports = {
  uploadCatalogueProductsService,
  createCatalogueService,
  getCatalogueService,
  deleteCatalogueService,
  updateCatalogueStatusService,
  updateCatalogueService
};

const { Integration, Catalogue, Product, Order, Deal, Customization } = require('../Utils/Postgres');
const { uploadFileToAws } = require('../Utils/awsUpload');
const { productViewCdpEvent } = require('../Utils/cdpHelper');
const { Op } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const formatDiscountPrice = (price) => {
  if (price == null) return 0;
  const [intPart, decPart] = price.toString().split('.');
  if (!decPart) return intPart;
  const truncatedDec = decPart.length === 1 ? decPart + '0' : decPart.slice(0, 2);
  return `${intPart}.${truncatedDec}`;
};

const formatDiscountPercentage = (percentage) => {
  if (percentage == null) return 0;
  return Number(percentage);
};

const searchProductsService = async (query, catalogueId, integrationId, page = 1, limit = 5) => {
  const where = { integrationId, isDeleted: false };
  if (catalogueId) where.catalogueId = catalogueId;
  
  if (query) {
    where.name = { [Op.iLike]: `%${query}%` };
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  const integration = await Integration.findByPk(integrationId);
  const catalogue = catalogueId ? await Catalogue.findByPk(catalogueId) : null;

  const results = products.map((product) => {
    const specs = product.specifications || {};
    return {
      id: product.id, // Mobile app compatibility
      name: product.name, // Mobile app compatibility
      price: product.price, // Mobile app compatibility
      description: product.description, // Mobile app compatibility
      imageUrls: product.imageUrls || [], // Mobile app compatibility
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      productImages: product.imageUrls || [],
      quantity: product.quantity,
      category: product.category,
      subCategory: product.subcategory,
      foodType: specs.foodType || 'Other',
      productPrice: product.price,
      discountPrice: product.discountPrice,
      discountPercentage: 0, // TBD derived
      cgst: specs.cgst || 0,
      sgst: specs.sgst || 0,
      otherTaxes: specs.otherTaxes || 0,
      speciality: specs.speciality || '',
      catalogueId: product.catalogueId,
      catalogueName: catalogue?.name,
      catalogueDescription: catalogue?.description,
      catalogueIsActive: catalogue?.isActive,
      integrationId: integration?.id,
      integrationName: integration?.integrationName,
      isActive: product.isActive,
      integrationCategory: integration?.category
    };
  });

  return { results, total: count };
};

const addNewProductService = async (
  integrationId,
  catalogueId,
  productData,
  files
) => {
  const integration = await Integration.findByPk(integrationId);
  if (!integration) throw new Error("Integration not found");

  const catalogue = await Catalogue.findByPk(catalogueId);
  if (!catalogue) throw new Error("Catalogue not found");

  const imageUrls = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const uploadResult = await uploadFileToAws(
        file.buffer,
        file.mimetype,
        file.originalname,
        integrationId,
        integration.integrationName,
        "catalogues"
      );
      imageUrls.push(uploadResult.url);
    }
  }

  const price = parseFloat(productData.price) || 0;
  const discountPercentage = parseFloat(productData.discountPercentage) || 0;
  let discountPrice = price;

  if (discountPercentage > 0) {
    discountPrice = Math.floor((price - (price * discountPercentage) / 100) * 100) / 100;
  }

  let normalizedDietaryType = 'veg';
  const inputType = (productData.dietaryType || productData.foodType || '').toString().toLowerCase().trim();
  if (inputType.includes('non') || inputType.includes('meat') || inputType.includes('chicken') || inputType.includes('fish')) {
    normalizedDietaryType = 'non-veg';
  } else if (inputType.includes('egg')) {
    normalizedDietaryType = 'egg';
  } else if (inputType === 'veg' || inputType === 'vegetarian') {
    normalizedDietaryType = 'veg';
  }

  const newProduct = await Product.create({
    sku: productData.sku || `SKU-${Math.random().toString(36).substr(2, 9)}`,
    name: productData.name,
    description: productData.description,
    price: price,
    discountPrice: discountPrice,
    currency: productData.currency || "INR",
    category: productData.category,
    subcategory: productData.subCategory,
    quantity: parseInt(productData.quantity) || 0,
    imageUrls: imageUrls,
    integrationId,
    catalogueId,
    isActive: true,
    isDeleted: false,
    dietaryType: normalizedDietaryType,
    isBestseller: productData.isBestseller || false,
    specifications: {
      foodType: productData.foodType || 'Other',
      cgst: productData.cgst || 0,
      sgst: productData.sgst || 0,
      otherTaxes: productData.otherTaxes || 0,
      speciality: productData.speciality || ''
    }
  });

  return newProduct;
};

const getProductDetailsService = async (productId, catalogueId, integrationId) => {
  const product = await Product.findOne({
    where: { id: productId, catalogueId, integrationId }
  });
  if (!product) return null;

  const integration = await Integration.findByPk(integrationId);
  const catalogue = await Catalogue.findByPk(catalogueId);
  const specs = product.specifications || {};

  return {
    productId: product.id,
    productName: product.name,
    productDescription: product.description,
    productPrice: product.price,
    productCurrency: product.currency,
    productSku: product.sku,
    productImages: product.imageUrls,
    quantity: product.quantity,
    category: product.category,
    subCategory: product.subcategory,
    foodType: specs.foodType || 'Other',
    discountPercentage: 0,
    discountPrice: product.discountPrice,
    cgst: specs.cgst || 0,
    sgst: specs.sgst || 0,
    otherTaxes: specs.otherTaxes || 0,
    speciality: specs.speciality || '',
    catalogueId: catalogue?.id,
    catalogueName: catalogue?.name,
    catalogueDescription: catalogue?.description,
    integrationCategory: integration?.category
  };
};

const editProductService = async (
  integrationId,
  catalogueId,
  productId,
  productData,
  files
) => {
  const product = await Product.findOne({
    where: { id: productId, catalogueId, integrationId }
  });
  if (!product) throw new Error("Product not found");

  const integration = await Integration.findByPk(integrationId);

  let newImageUrls = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const uploadResult = await uploadFileToAws(
        file.buffer,
        file.mimetype,
        file.originalname,
        integrationId,
        integration?.integrationName || '',
        "catalogues"
      );
      newImageUrls.push(uploadResult.url);
    }
  }

  let finalImageUrls = product.imageUrls || [];
  if (productData.existingImages) {
    try {
      const parsed = JSON.parse(productData.existingImages);
      if (Array.isArray(parsed)) finalImageUrls = parsed;
    } catch (e) {}
  }
  finalImageUrls = [...finalImageUrls, ...newImageUrls];

  const price = parseFloat(productData.price) || product.price;
  let discountPrice = parseFloat(productData.discountPrice) || price;

  const currentSpecs = product.specifications || {};
  const newSpecs = {
    ...currentSpecs,
    foodType: productData.foodType ?? currentSpecs.foodType ?? 'Other',
    cgst: productData.cgst ?? currentSpecs.cgst ?? 0,
    sgst: productData.sgst ?? currentSpecs.sgst ?? 0,
    otherTaxes: productData.otherTaxes ?? currentSpecs.otherTaxes ?? 0,
    speciality: productData.speciality ?? currentSpecs.speciality ?? ''
  };

  let normalizedDietaryType = product.dietaryType;
  if (productData.dietaryType !== undefined || productData.foodType !== undefined) {
    const inputType = (productData.dietaryType ?? productData.foodType ?? '').toString().toLowerCase().trim();
    if (inputType.includes('non') || inputType.includes('meat') || inputType.includes('chicken') || inputType.includes('fish')) {
      normalizedDietaryType = 'non-veg';
    } else if (inputType.includes('egg')) {
      normalizedDietaryType = 'egg';
    } else if (inputType === 'veg' || inputType === 'vegetarian') {
      normalizedDietaryType = 'veg';
    }
  }

  await product.update({
    name: productData.name ?? product.name,
    description: productData.description ?? product.description,
    price,
    currency: productData.currency ?? product.currency,
    sku: productData.sku ?? product.sku,
    category: productData.category ?? product.category,
    subcategory: productData.subCategory ?? product.subcategory,
    quantity: productData.quantity ?? product.quantity,
    imageUrls: finalImageUrls,
    discountPrice,
    dietaryType: normalizedDietaryType,
    isBestseller: productData.isBestseller ?? product.isBestseller,
    specifications: newSpecs
  });

  return product;
};

const deleteProductService = async (productId, integrationId) => {
  const product = await Product.findOne({ where: { id: productId, integrationId } });
  if (!product) throw new Error("Product not found");
  
  await product.update({ isDeleted: true, isActive: false });
  
  // Deactivate Catalogue if no other active products exist
  const remainingActive = await Product.count({
    where: { catalogueId: product.catalogueId, isDeleted: false, isActive: true }
  });
  
  if (remainingActive === 0 && product.catalogueId) {
    await Catalogue.update({ isActive: false }, { where: { id: product.catalogueId } });
  }

  return product;
};

const toggleProductActiveService = async (integrationId, catalogueId, productId, isActive) => {
  const product = await Product.findOne({ where: { id: productId, catalogueId, integrationId } });
  if (!product) throw new Error("Product not found");

  await product.update({ isActive });

  const remainingActive = await Product.count({
    where: { catalogueId, isDeleted: false, isActive: true }
  });

  if (remainingActive === 0) {
    await Catalogue.update({ isActive: false }, { where: { id: catalogueId } });
  }

  return { productId: product.id, isActive: product.isActive };
};




const searchAppProductsByIntegrationService = async (
  integrationId,
  userId,
  foodTypes,
  search,
  pricerange,
  discountrange
) => {
  const { Integration, Catalogue, Product, Order, Deal } = require('../Utils/Postgres');
  const { Op } = require('sequelize');
  const { sequelize } = require('../Utils/Postgres');

  const integrationWhere = {};
  if (typeof integrationId === 'string' && /^[0-9a-fA-F]{24}$/.test(integrationId)) {
    integrationWhere[Op.or] = [{ id: integrationId }, { mongoId: integrationId }];
  } else {
    integrationWhere.id = integrationId;
  }

  const integration = await Integration.findOne({ where: integrationWhere });
  if (!integration) throw new Error("Integration not found");

  const actualId = integration.id;

  const totalOrders = await Order.count({
    where: { integrationId: actualId, status: 'delivered' }
  });

  const catalogues = await Catalogue.findAll({
    where: { integrationId: actualId, isActive: true, isDeleted: false }
  });

  const result = await Promise.all(
    catalogues.map(async (catalogue) => {
      const whereProduct = {
        catalogueId: catalogue.id,
        isActive: true,
        isDeleted: false
      };

      // Food Type / Offer Filtering
      let dealProductIds = [];
      const lowerFoodTypes = Array.isArray(foodTypes) ? foodTypes.map(f => f.toLowerCase()) : [];
      
      if (lowerFoodTypes.includes("offer")) {
        const activeDeals = await Deal.findAll({
          where: { integrationId, catalogueId: catalogue.id, isActive: true, isDeleted: false }
        });
        dealProductIds = activeDeals.flatMap(d => d.appliesOnProducts || []);
      }

      // Build dynamic where filters
      const conditions = [];

      if (lowerFoodTypes.includes("offer")) {
        conditions.push({ id: { [Op.in]: dealProductIds } });
      }

      const normalFoodTypes = lowerFoodTypes.filter(f => f !== "offer");
      if (normalFoodTypes.length > 0) {
        if (normalFoodTypes.includes("other")) {
          // Exclude the standard known food types — return everything else
          conditions.push({
            [Op.not]: {
              [Op.or]: [
                sequelize.literal(`"Products"."specifications"->>'foodType' ILIKE 'Veg'`),
                sequelize.literal(`"Products"."specifications"->>'foodType' ILIKE 'Non Veg'`),
                sequelize.literal(`"Products"."specifications"->>'foodType' ILIKE 'Non-Veg'`),
              ]
            }
          });
        } else {
          // Match any of the selected food types using JSONB literal access
          const foodTypeLiterals = normalFoodTypes.map(ft =>
            sequelize.literal(`"Products"."specifications"->>'foodType' ILIKE '${ft.replace(/'/g, "''")}'`)
          );
          conditions.push({ [Op.or]: foodTypeLiterals });
        }
      }

      if (search && search.trim()) {
        conditions.push({
          [Op.or]: [
            { name: { [Op.iLike]: `%${search.trim()}%` } },
            { category: { [Op.iLike]: `%${search.trim()}%` } }
          ]
        });
      }

      if (pricerange) {
        if (pricerange.toLowerCase() === "budget") {
          conditions.push({ price: { [Op.lte]: 500 } });
        } else if (pricerange.toLowerCase() === "expensive") {
          conditions.push({ price: { [Op.gt]: 500 } });
        }
      }

      if (discountrange) {
        const minDiscount = parseInt(discountrange, 10);
        if (!isNaN(minDiscount)) {
           // Note: Postgres implementation of discount calculation/mapping
           conditions.push({
             [Op.and]: [
               sequelize.literal(`(("price" - "discountPrice") / NULLIF("price", 0) * 100) >= ${minDiscount}`)
             ]
           });
        }
      }

      if (conditions.length > 0) {
        whereProduct[Op.and] = conditions;
      }

      const products = await Product.findAll({ where: whereProduct });

      const productList = products.map(p => {
        const rawSpecs = p.specifications || {};
        const displayPrice = p.price || 0;
        // Only use discountPrice if it's explicitly > 0; otherwise show the full price
        const disPrice = (p.discountPrice && p.discountPrice > 0) ? p.discountPrice : displayPrice;
        const discPer = displayPrice > 0 ? Math.round(((displayPrice - disPrice) / displayPrice) * 100) : 0;

        return {
          id: p.id, // Mobile app compatibility
          name: p.name, // Mobile app compatibility
          price: displayPrice, // Mobile app compatibility
          description: p.description, // Mobile app compatibility
          imageUrls: p.imageUrls || [], // Mobile app compatibility
          productId: p.id,
          productName: p.name,
          productDescription: p.description,
          productImages: p.imageUrls || [],
          quantity: p.quantity,
          productPrice: displayPrice,
          discountPrice: disPrice,
          discountPercentage: discPer,
          cgst: rawSpecs.cgst || 0,
          sgst: rawSpecs.sgst || 0,
          otherTaxes: rawSpecs.otherTaxes || 0,
          category: p.category || "Miscellaneous",
          subcategory: p.subcategory || "",
          foodType: p.dietaryType || rawSpecs.foodType || "veg",
          dietaryType: p.dietaryType || "veg",
          integrationId: p.integrationId,
          isBestseller: p.isBestseller || false,
          preparationTime: p.preparationTime || 15,
          variantsConfig: p.variantsConfig || [],
          isCustomized: (p.variantsConfig && Array.isArray(p.variantsConfig) && p.variantsConfig.length > 0)
        };
      });

      // Group by category
      const structuredProducts = {};
      const categoryNames = [...new Set(productList.map(p => p.category))];

      productList.forEach(p => {
        const cat = p.category;
        if (!structuredProducts[cat]) structuredProducts[cat] = [];
        const sub = p.subcategory && p.subcategory.trim() ? p.subcategory : undefined;
        
        let subcatGroup = structuredProducts[cat].find(g => sub ? g.subcategory === sub : !g.subcategory);
        if (!subcatGroup) {
          subcatGroup = sub ? { subcategory: sub, items: [] } : { items: [] };
          structuredProducts[cat].push(subcatGroup);
        }
        subcatGroup.items.push(p);
      });

      const rawDeals = await Deal.findAll({
        where: {
          integrationId,
          catalogueId: catalogue.id,
          isActive: true,
          isDeleted: false
        }
      });

      return {
        integrationName: integration.integrationName,
        integrationLogo: integration.logo,
        catalogueId: catalogue.id,
        catalogueName: catalogue.name,
        catalogueDescription: catalogue.description,
        displayType: catalogue.displayType,
        products: structuredProducts,
        totalProducts: productList.length,
        deals: rawDeals.map(d => ({ name: d.name, descriptions: d.descriptions || [], couponCode: d.couponCode })),
        advBannerUrl: null, // Advertisement placeholders
        categoryNames,
        totalOrders
      };
    })
  );

  return result;
};




const getAllFoodTypesService = async (integrationId) => {
  const { Catalogue, Product, Deal } = require('../Utils/Postgres');

  const catalogues = await Catalogue.findAll({
    where: { integrationId, isActive: true, isDeleted: false }
  });

  const catalogueIds = catalogues.map(c => c.id);
  if (catalogueIds.length === 0) return [];

  const activeDealsCount = await Deal.count({
    where: { integrationId, catalogueId: catalogueIds, isActive: true, isDeleted: false }
  });

  const products = await Product.findAll({
    where: { catalogueId: catalogueIds, isActive: true, isDeleted: false }
  });

  const foodTypeSet = new Set();
  
  products.forEach(product => {
    const rawSpecs = product.specifications || {};
    const foodType = rawSpecs.foodType;
    if (foodType && foodType.trim().toLowerCase() !== 'other') {
      const normalized = foodType.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      foodTypeSet.add(normalized);
    }
  });

  if (activeDealsCount > 0) {
    foodTypeSet.add("Offer");
  }

  return Array.from(foodTypeSet);
};





const getProductCustomizationService = async (productId, catalogueId, integrationId, userId) => {
  const integration = await Integration.findByPk(integrationId);
  if (!integration) throw new Error('Integration not found');

  const catalogue = await Catalogue.findByPk(catalogueId);
  if (!catalogue || catalogue.isDeleted || !catalogue.isActive) {
    throw new Error('Catalogue not found or inactive');
  }

  const product = await Product.findOne({ where: { id: productId, catalogueId, isDeleted: false, isActive: true } });
  if (!product) throw new Error('Product not found or inactive');

  let customization = null;
  if (product.customizationId) {
    customization = await Customization.findOne({ where: { id: product.customizationId, integrationId, isDeleted: false, isActive: true } });
  }

  const specs = product.specifications || {};
  return {
    product: {
      productId:          product.id,
      productName:        product.name,
      productDescription: product.description,
      productPrice:       product.price,
      productCurrency:    product.currency,
      productSku:         product.sku,
      productImages:      product.imageUrls,
      quantity:           product.quantity,
      category:           product.category,
      subCategory:        product.subcategory,
      discountPercentage: 0,
      discountPrice:      product.discountPrice,
      cgst:               specs.cgst || 0,
      sgst:               specs.sgst || 0,
      otherTaxes:         specs.otherTaxes || 0,
      speciality:         specs.speciality || '',
      catalogueId:        catalogue.id,
      catalogueName:      catalogue.name,
      catalogueDescription: catalogue.description,
    },
    customization: customization ? {
      customizationId:   customization.id,
      customizationName: customization.customizationName,
      options: (customization.options || []).filter(o => !o.isDeleted && o.isActive),
    } : null,
  };
};











module.exports = {
  searchProductsService,
  addNewProductService,
  getProductDetailsService,
  editProductService,
  deleteProductService,
  toggleProductActiveService,
  searchAppProductsByIntegrationService,
  getProductCustomizationService,
  getAllFoodTypesService
};

const { searchProductsService, addNewProductService, getProductDetailsService, editProductService, deleteProductService, toggleProductActiveService, searchAppProductsByIntegrationService, getProductCustomizationService, getAllFoodTypesService } = require("../Services/Product.Service");
const { createProductSchema } = require("../Validator/productValidation");
const { ZodError } = require("zod");
const { fixUrl } = require('../Utils/UrlHelper');
const RAGHelper = require('../Utils/RAGHelper');

// Fire-and-forget RAG re-index for a store (never blocks the API response)
const reindexStore = (integrationId) => {
    if (!integrationId) return;
    RAGHelper.reindexIntegration(integrationId).catch(e =>
        console.warn('[RAG] Background reindex failed for', integrationId, ':', e.message)
    );
};



//  helper to format all responses
const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = { statusCode, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const formatZodErrors = (zodError) => {
  if (!zodError || !zodError.issues) return [];
  return zodError.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};



const searchProducts = async (req, res) => {
  try {
    const { query, page = 1, limit = 100 } = req.query;
    const { catalogueId } = req.params;
    const integrationId = req.id;

    const { results, total } = await searchProductsService(query, catalogueId, integrationId, parseInt(page), parseInt(limit));

    const fixedResults = (results || []).map(product => ({
      ...product,
      imageUrls: (product.imageUrls || []).map(url => fixUrl(url, req)),
      productImages: (product.productImages || []).map(url => fixUrl(url, req))
    }));

    return res.status(200).json({
      statusCode: 200,
      message: "Products fetched successfully",
      data: fixedResults, // For Flutter app compatibility
      products: fixedResults, // For Admin Portal compatibility
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in searchProductsController:", error);
    return sendResponse(res, 500, "Internal Server Error", null, error.message);
  }
};





const addNewProduct = async (req, res) => {
  try {
    const integrationId = req.id;
    const { catalogueId } = req.params;


    // Validate request body
    const parseResult = createProductSchema.parse(req.body);


    const newProduct = await addNewProductService(
      integrationId,
      catalogueId,
      parseResult,
      req.files
    );

    // Re-index this store's embeddings in background (non-blocking)
    reindexStore(integrationId);

    return sendResponse(res, 201, "Product created successfully", {
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);

    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Invalid request data", null, formatZodErrors(error));
    }

    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};

// Fetch single product details (productId from params, catalogueId from body)
const getProductDetails = async (req, res) => {
  try {
    const { productId, catalogueId } = req.params;

    const integrationId = req.id;

    if (!productId || !catalogueId) {
      return sendResponse(res, 400, "productId and catalogueId are required");
    }

    const product = await getProductDetailsService(productId, catalogueId, integrationId);

    if (!product) {
      return sendResponse(res, 404, "Product not found in this catalogue");
    }

    return sendResponse(res, 200, "Product fetched successfully", product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};


const editProduct = async (req, res) => {
  try {
    const { productId, catalogueId } = req.params;
    const integrationId = req.id;

    if (!productId || !catalogueId) {
      return sendResponse(res, 400, "productId and catalogueId are required");
    }



    const updatedProduct = await editProductService(
      integrationId,
      catalogueId,
      productId,
      req.body,
      req.files
    );

    // Re-index this store's embeddings in background (non-blocking)
    reindexStore(integrationId);

    return sendResponse(res, 200, "Product updated successfully", updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};


const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return sendResponse(res, 400, "productId is required");
    }
    const result = await deleteProductService(productId, req.id);
    if (result) {
      // Re-index this store's embeddings in background (non-blocking)
      reindexStore(req.id);
      return sendResponse(res, 200, "Product deleted successfully", result);
    }

    return sendResponse(res, 404, "Product not found");
  } catch (error) {
    console.error("Error deleting product:", error);
    return sendResponse(res, 500, "Internal Server Error");
  }
}


const handleToggleActive = async (req, res) => {
  try {
    const { catalogueId, productId } = req.params;
    const { isActive } = req.body;

    const integrationId = req.id


    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        statusCode: 400,
        message: "isActive must be a boolean",
      });
    }

    const updatedProduct = await toggleProductActiveService(
      integrationId,
      catalogueId,
      productId,
      isActive
    );

    // Re-index this store's embeddings in background (non-blocking)
    reindexStore(integrationId);

    return res.status(200).json({
      statusCode: 200,
      message: `Product is now ${isActive ? "active" : "inactive"}`,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error toggling product active status:", error);
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};


// APP 


const { Advertisement } = require('../Utils/Postgres');

const searchAppProductsByIntegration = async (req, res) => {
  try {
    const userId = req.id;
    const { integrationId } = req.params;
    const { search, pricerange, discountrange } = req.query;

    // 👑 CAPTURE MERCHANT CUSTOMER
    if (userId && integrationId) {
      const { recordMerchantCustomer } = require("../Services/PhoneBook.pg.Service");
      recordMerchantCustomer(userId, integrationId);
    }

    //  Parse multiple food types (comma-separated or array)
    let foodTypeArray = [];
    if (req.query.foodType) {
      if (Array.isArray(req.query.foodType)) {
        // e.g., ?foodType=veg&foodType=nonveg
        foodTypeArray = req.query.foodType.map(f => f.trim());
      } else if (typeof req.query.foodType === "string") {
        // e.g., ?foodType=veg,nonveg or ?foodType=veg
        foodTypeArray = req.query.foodType
          .split(",")
          .map(f => f.trim())
          .filter(f => f.length > 0);
      }
    }


    if (!integrationId) {
      return sendResponse(res, 400, "Integration ID is required");
    }

    const { Integration } = require('../Utils/Postgres');
    const { Op } = require('sequelize');
    const integrationWhere = {};
    if (typeof integrationId === 'string' && /^[0-9a-fA-F]{24}$/.test(integrationId)) {
      integrationWhere[Op.or] = [{ id: integrationId }, { mongoId: integrationId }];
    } else {
      integrationWhere.id = integrationId;
    }
    const integrationObj = await Integration.findOne({ where: integrationWhere });

    // 🚀 FETCH ACTIVE ADVERTISEMENTS
    const advertisements = await Advertisement.findAll({
      where: { integrationId: integrationObj ? integrationObj.id : integrationId, isDeleted: false, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    const catalogues = await searchAppProductsByIntegrationService(
      integrationId,
      userId,
      foodTypeArray, //  pass multi-select array
      search,
      pricerange,
      discountrange
    );

    if (!catalogues || catalogues.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found",
        data: [],
        integration: integrationObj,
        advertisements: advertisements.map(ad => ({
          ...ad.get({ plain: true }),
          bannerUrl: fixUrl(ad.bannerUrl, req)
        }))
      });
    }

    // 👑 Fix image URLs for physical device testing
    const fixedCatalogues = (catalogues || []).map(cat => {
      const plainCat = cat.get ? cat.get({ plain: true }) : cat;
      const productsData = plainCat.products || {};
      const fixedProducts = {};

      // productsData is a Map: { "Category": [ { "subcategory": "...", "items": [...] } ] }
      Object.keys(productsData).forEach(category => {
        const groups = productsData[category] || [];
        fixedProducts[category] = groups.map(group => ({
          ...group,
          items: (group.items || []).map(item => ({
            ...item,
            imageUrls: (item.imageUrls || item.productImages || []).map(url => fixUrl(url, req)),
            productImages: (item.productImages || item.imageUrls || []).map(url => fixUrl(url, req))
          }))
        }));
      });

      return {
        ...plainCat,
        products: fixedProducts
      };
    });

    // Return structured response for Flutter compatibility
    return res.status(200).json({
      success: true,
      message: "Catalogues fetched successfully",
      data: fixedCatalogues,
      catalogues: fixedCatalogues,
      integration: integrationObj,
      advertisements: advertisements.map(ad => ({
        ...ad.get({ plain: true }),
        bannerUrl: fixUrl(ad.bannerUrl, req)
      }))
    });
  } catch (error) {
    console.error("Error in searchAppProductsByIntegrationController:", error);
    return sendResponse(res, 500, "Internal Server Error", null, error.message);
  }
};


const getProductCustomization = async (req, res) => {
  try {
    const { productId, catalogueId, integrationId } = req.params;

    const userId = req.id;

    const result = await getProductCustomizationService(productId, catalogueId, integrationId, userId);
    return res.status(200).send(result);
  } catch (error) {
    console.error("Error in getProductCustomization:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};



const getAllFoodTypes = async (req, res) => {
  try {
    const { integrationId } = req.params;

    if (!integrationId) {
      return sendResponse(res, 400, "Integration ID is required");
    }

    const foodTypes = await getAllFoodTypesService(integrationId);

    if (foodTypes.length === 0) {
      return sendResponse(res, 200, "No food types found", []);
    }

    return res.status(200).send(foodTypes);
  } catch (error) {
    console.error("Error in getAllFoodTypesController:", error);
    return sendResponse(res, 500, "Internal Server Error", null, error.message);
  }
};


async function bulkUploadProducts(req, res, next) {
    try {
        const { catalogueId } = req.params;
        const { products } = req.body; // Array of product objects

        if (!Array.isArray(products) || products.length === 0) {
            throw new ErrorBody(400, 'Invalid products data');
        }

        const { Product } = require('../Utils/Postgres');

        // Map products to include catalogueId
        const productsToInsert = products.map(p => ({
            ...p,
            catalogueId,
            integrationId: req.id,
            isActive: true,
            isDeleted: false
        }));

        const createdProducts = await Product.bulkCreate(productsToInsert);

        res.status(201).json({
            success: true,
            message: `${createdProducts.length} products uploaded successfully`,
            data: createdProducts
        });
    } catch (error) {
        next(new ErrorBody(error.statusCode || 500, error.message || 'Server error occurred'));
    }
}


async function swiggyImport(req, res, next) {
    try {
        const { catalogueId } = req.params;
        const { swiggyUrl } = req.body;

        if (!swiggyUrl || !swiggyUrl.includes('swiggy.com')) {
            throw new ErrorBody(400, 'Invalid Swiggy URL');
        }

        const axios = require('axios');
        const cheerio = require('cheerio');
        const { Product } = require('../Utils/Postgres');

        // Fetch the Swiggy page
        const response = await axios.get(swiggyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const productsToInsert = [];

        // 🕵️ Swiggy Scraper Logic
        $('.styles_item__3_xe3, .styles_container__-6_0G').each((i, el) => {
            const name = $(el).find('.styles_itemNameText__3ZmZZ').text().trim();
            const priceText = $(el).find('.styles_price__2xrhD, .styles_itemPrice__2F_9z').text().trim();
            const description = $(el).find('.styles_itemDesc__3_s3j').text().trim();
            const imageUrl = $(el).find('img').attr('src');

            if (name && priceText) {
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                
                productsToInsert.push({
                    name,
                    description,
                    price: isNaN(price) ? 0 : price,
                    catalogueId,
                    integrationId: req.id,
                    imageUrls: imageUrl ? [imageUrl] : [],
                    isActive: true,
                    isDeleted: false
                });
            }
        });

        if (productsToInsert.length === 0) {
            throw new ErrorBody(422, 'Could not find any items on this Swiggy page. Ensure the URL is a direct restaurant menu page.');
        }

        const createdProducts = await Product.bulkCreate(productsToInsert);

        res.status(201).json({
            success: true,
            message: `Successfully imported ${createdProducts.length} items from Swiggy`,
            data: createdProducts
        });
    } catch (error) {
        console.error('Swiggy Import Error:', error.message);
        next(new ErrorBody(error.statusCode || 500, error.message || 'Failed to import from Swiggy'));
    }
}

module.exports =
{
  searchProducts,
  addNewProduct,
  getProductDetails,
  editProduct,
  deleteProduct,
  handleToggleActive,
  searchAppProductsByIntegration,
  getProductCustomization,
  getAllFoodTypes,
  bulkUploadProducts,
  swiggyImport
};

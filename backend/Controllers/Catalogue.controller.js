const { uploadCatalogueProductsService, createCatalogueService, getCatalogueService, deleteCatalogueService, updateCatalogueService, updateCatalogueStatusService } = require("../Services/Catalogue.Service");
const { uploadCatalogueSchema, updateCatalogueSchema } = require("../Validator/catalogueValidation");
const { ZodError } = require("zod");

const formatZodErrors = (zodError) => {
  if (!zodError || !zodError.issues) return [];

  return zodError.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};

//  helper to format all responses
const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = { statusCode, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};


const uploadCatalogueProducts = async (req, res) => {
  try {
    // Convert deliveryType string to array if necessary
    if (typeof req.body.deliveryType === 'string') {
      try {
        req.body.deliveryType = JSON.parse(req.body.deliveryType);
      } catch (err) {
        return sendResponse(res, 400, 'Invalid deliveryType format');
      }
    }

    const parsed = uploadCatalogueSchema.parse(req.body);
    const { name, description, displayType, deliveryType } = parsed;

    // Explicit check for required fields
    if (!name || !description) {

      return sendResponse(res, 400, "Both 'name' and 'description' are required");
    }


    if (!req.file) {
      return sendResponse(res, 400, "CSV file is required");
    }

    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;


    const catalogue = await uploadCatalogueProductsService(
      req.id,
      name,
      description,
      fileBuffer,
      mimeType,
      fileName,
      displayType,
      deliveryType
    );

    return sendResponse(res, 200, "Products uploaded successfully", { catalogue });
  } catch (error) {

    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Validation failed", null, formatZodErrors(error));
    }
    console.error("Error uploading catalogue:", error);
    if (error.stack) console.error(error.stack);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};


const getCatalogue = async (req, res) => {
  try {
    const integrationId = req.id;
    const { status = "all", search = "", page = 1, limit = 5 } = req.query;

    const catalogues = await getCatalogueService(integrationId, status, search, parseInt(page), parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Catalogue fetched successfully",
      data: catalogues.catalogues || [],
      pagination: catalogues.pagination
    });
  } catch (error) {
    console.error("Error fetching catalogue:", error);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};




const deleteCatalogue = async (req, res) => {
  try {
    const { catalogueId } = req.params;

    const integrationId = req.id;

    const catalogue = await deleteCatalogueService(integrationId, catalogueId);

    if (!catalogue) {
      return sendResponse(res, 404, "Catalogue not found");
    }

    return sendResponse(res, 200, "Catalogue deleted successfully", { catalogue });
  } catch (error) {
    console.error("Error deleting catalogue:", error);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};


const updateCatalogue = async (req, res) => {
  try {

    const { catalogueId } = req.params;

    if (typeof req.body.deliveryType === 'string') {
      try {
        req.body.deliveryType = JSON.parse(req.body.deliveryType);
      } catch (err) {
        return sendResponse(res, 400, 'Invalid deliveryType format');
      }
    }

    const parsed = updateCatalogueSchema.parse(req.body);

    const { name, description, mode, displayType, deliveryType } = parsed;

    if (!req.file && !name && !description && !mode) {
      return sendResponse(res, 400, "No update data provided");
    }

    const fileBuffer = req.file?.buffer || null;
    const mimeType = req.file?.mimetype;
    const fileName = req.file?.originalname;


    const updatedCatalogue = await updateCatalogueService(
      req.id,
      catalogueId,
      name,
      description,
      fileBuffer,
      mimeType,
      fileName,
      mode,
      displayType,
      deliveryType
    );

    return sendResponse(res, 200, "Catalogue updated successfully", { catalogue: updatedCatalogue });
  } catch (error) {
    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Validation failed", null, formatZodErrors(error));
    }
    console.error("Error updating catalogue:", error);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};


const updateCatalogueStatus = async (req, res) => {
  try {
    const { catalogueId, isActive } = req.body;

    const integrationId = req.id;

    if (!integrationId || !catalogueId) {
      return sendResponse(res, 400, "'integrationId' and 'catalogueId' are required");
    }

    if (typeof isActive !== "boolean") {
      return sendResponse(res, 400, "'isActive' must be a boolean");
    }

    const updatedCatalogue = await updateCatalogueStatusService(
      integrationId,
      catalogueId,
      isActive
    );

    return sendResponse(res, 200, "Catalogue status updated successfully", {
      catalogue: updatedCatalogue,
    });
  } catch (error) {
    console.error("Error updating catalogue status:", error);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};





const createCatalogue = async (req, res) => {
  try {
    const { name, description, displayType } = req.body;
    if (!name || !description) {
      return sendResponse(res, 400, "Both 'name' and 'description' are required");
    }

    const catalogue = await createCatalogueService(req.id, name, description, displayType);
    return sendResponse(res, 201, "Catalogue created successfully", { catalogue });
  } catch (error) {
    console.error("Error creating catalogue:", error);
    return sendResponse(res, 500, error.message || "Internal Server Error");
  }
};

module.exports = {
  uploadCatalogueProducts,
  createCatalogue,
  getCatalogue,
  deleteCatalogue,
  updateCatalogue,
  updateCatalogueStatus
};

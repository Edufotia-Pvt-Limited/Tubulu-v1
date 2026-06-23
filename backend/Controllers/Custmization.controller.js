const {
    createCustomizationService,
    getAllCustomizationsService,
    updateCustomizationStatusService,
    getCustomizationByIdService,
    editCustomizationService,
    deleteCustomizationService,
   getAllOptionsByCustomizationIdService,
   deleteOptionByOptionIdService,
   updateOptionStatusService,
   addOptionService,
   getSingleOptionByIdService,
   editOptionService,
   getCustomizationDetailsForApplyService,
   applyProductCustomizationService,
   searchProductsForCustomizationService

} = require("../Services/Custmization.Service");


const { createCustomizationSchema, addOptionSchema, editOptionSchema } = require("../Validator/customizationValidation");
const { ZodError } = require("zod");

// Helper to format all responses
const sendResponse = (res, statusCode, message, data = null, errors = null) => {
    const response = { statusCode, message };
    if (data) response.data = data;
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

// Helper to format Zod errors
const formatZodErrors = (zodError) => {
    if (!zodError || !zodError.issues) return [];
    return zodError.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }));
};



// ===================== CREATE CUSTOMIZATION =====================
const createCustomization = async (req, res) => {
    try {

       const integrationId = req.id;

        // Validate request body
        const validatedData = createCustomizationSchema.parse(req.body);



        // Pass validated data + integrationId to service
        const customization = await createCustomizationService(validatedData, integrationId);

        return sendResponse(res, 201, "Customization created successfully", customization);
    } catch (error) {
        if (error instanceof ZodError) {
            return sendResponse(res, 400, "Validation error", null, formatZodErrors(error));
        }
        console.error("Error in createCustomization:", error);
        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
};



const getAllCustomizations = async (req, res) => {
    try {
        const integrationId = req.id;

        // Get query params for search and pagination
        const { search = "", page = 1 } = req.query;

        const customizations = await getAllCustomizationsService(integrationId, search, parseInt(page));

        return sendResponse(res, 200, "Customizations fetched successfully", customizations);
    } catch (error) {
        console.error("Error in getAllCustomizations:", error);
        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
};

const deleteCustomization = async (req, res) => {
    try {
        const { id } = req.params;
        const integrationId = req.id;

        const customization = await deleteCustomizationService(id, integrationId);
        return sendResponse(res, 200, "Customization deleted successfully", customization);
    } catch (error) {
        console.error("Error in deleteCustomization:", error);
        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
};


// ===================== UPDATE ACTIVE/INACTIVE STATUS =====================
const updateCustomizationStatus = async (req, res) => {
    try {
        const { customizationId, isActive } = req.body;
        const integrationId = req.id;

        const customization = await updateCustomizationStatusService(customizationId, isActive, integrationId);
        return sendResponse(res, 200, "Customization status updated successfully", customization);
    } catch (error) {
        console.error("Error in updateCustomizationStatus:", error);
        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
};


// GET CUSTOMIZATION BY ID
const getCustomizationById = async (req, res) => {
    try {
        const { id } = req.params;
        const integrationId = req.id;

        const customization = await getCustomizationByIdService(id, integrationId);
        if (!customization) return sendResponse(res, 404, "Customization not found");
        return sendResponse(res, 200, "Customization fetched successfully", customization);
    } catch (error) {
        console.error("Error in getCustomizationById:", error);
        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
};


const editCustomization = async (req, res) => {
    try {
        const { id } = req.params;
        const { customizationName } = req.body;
        const integrationId = req.id;

        const customization = await editCustomizationService(id, customizationName, integrationId, req.body);
        return sendResponse(res, 200, "Customization updated successfully", customization);
    } catch (error) {
        console.error("Error in editCustomization:", error);
        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
};



const getAllOptionsByCustomizationId = async (req, res) => {
    try {
        const { customizationId } = req.params;
        // const integrationId = req.id;

          const integrationId = req.id;

        const options = await getAllOptionsByCustomizationIdService(customizationId, integrationId);

        if (!options || options.length === 0) {
            return sendResponse(res, 404, "No options found for this customization");
        }

        return sendResponse(res, 200, "Options fetched successfully", options);
    } catch (error) {
        console.error("Error in getAllOptionsByCustomizationId:", error);
        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
};


const deleteOptionByOptionId = async (req, res) => {
  try {
    const { customizationId, optionId } = req.params;

   const integrationId = req.id;

    const result = await deleteOptionByOptionIdService(customizationId, optionId, integrationId);

    return sendResponse(res, 200, result.message, {
      customizationName: result.customizationName,
      deletedOptionId: result.deletedOptionId,
    });
  } catch (error) {
    console.error("Error in deleteOptionByOptionId:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};


const updateOptionStatus = async (req, res) => {
  try {
   
    const { customizationId, optionId, isActive } = req.body;
    const integrationId = req.id;

    const result = await updateOptionStatusService(customizationId, optionId, isActive, integrationId);

    return sendResponse(res, 200, result.message, {
      customizationName: result.customizationName,
      optionId: result.optionId,
      isActive: result.isActive,
    });
  } catch (error) {
    console.error("Error in updateOptionStatus:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};


const addOption = async (req, res) => {
  try {
    const { customizationId } = req.params;
   const integrationId = req.id;


    // Validate request body
    const validatedData = addOptionSchema.parse(req.body);


    const result = await addOptionService(customizationId, validatedData, integrationId);

    return sendResponse(res, 201, result.message, {
      customizationName: result.customizationName,
      option: result.option,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Validation error", null, error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message
      })));
    }
    console.error("Error in addOption:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};



const getSingleOptionById = async (req, res) => {
  try {
    const { customizationId, optionId } = req.params;

    const integrationId = req.id;

    const result = await getSingleOptionByIdService(customizationId, optionId, integrationId);

    return sendResponse(res, 200, "Option fetched successfully", {
      customizationName: result.customizationName,
      option: result.option,
    });
  } catch (error) {
    console.error("Error in getSingleOptionById:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};




const editOption = async (req, res) => {
  try {
    const { customizationId, optionId } = req.params;


    const integrationId = req.id;

    // Validate request body using editOptionSchema
    const validatedData = editOptionSchema.parse(req.body);

    const result = await editOptionService(customizationId, optionId, validatedData, integrationId);

    return sendResponse(res, 200, result.message, {
      customizationName: result.customizationName,
      option: result.option,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return sendResponse(res, 400, "Validation error", null, errors);
    }
    console.error("Error in editOption:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};


const getCustomizationDetailsForApply = async (req, res) => {
  try {
    const { customizationId } = req.params;

 const integrationId = req.id;

    const result = await getCustomizationDetailsForApplyService(customizationId, integrationId);

    return res.status(200).json({
      statusCode: 200,
      message: "Customization and catalogues fetched successfully",
      data: {
        customization: result.customization,
        catalogues: result.catalogues,
      },
    });
  } catch (error) {
    console.error("Error in getCataloguesByCustomizationId:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      errors: error.message,
    });
  }
};



const applyProductCustomization = async (req, res) => {
  try {
    const integrationId = req.id;
    const { customizationId, productIds, catalogueId, removedProductIds } = req.body;


    if (!customizationId || !catalogueId || !Array.isArray(productIds)) {
      return sendResponse(res, 400, "customizationId, catalogueId and productIds are required");
    }

    const result = await applyProductCustomizationService(
      integrationId,
      customizationId,
      catalogueId,
      productIds,
      removedProductIds || []
    );

    return sendResponse(res, 200, "Customization applied to selected products", {
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("Error in applyProductCustomization:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};


const searchProductsForCustomization = async (req, res) => {
  try {
    const { query, page = 1, limit = 5 } = req.query;
    const { catalogueId, customizationId } = req.params;
    const integrationId = req.id; 

    const { results, total } = await searchProductsForCustomizationService(
      query,
      catalogueId,
      customizationId,
       integrationId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Products fetched successfully",
      data: {
        products: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in searchProductsForCustomizationController:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      errors: error.message,
    });
  }
};




module.exports = {
    createCustomization,
    getAllCustomizations,
    deleteCustomization,
    updateCustomizationStatus,
    getCustomizationById,
    editCustomization,
    getAllOptionsByCustomizationId,
    deleteOptionByOptionId,
    updateOptionStatus,
    addOption,
    getSingleOptionById,
    editOption,
    getCustomizationDetailsForApply,
    applyProductCustomization,
    searchProductsForCustomization 
};

const { createDealService, getAllDealsService, updateDealService, deleteDealService, updateDealStatusService, updateDealOfTheDayStatusService, applyDealsOnProductsService, getApplyDealsDetailsService, getDealProductsForApplyService } = require("../Services/Deal.Service");
const { createDealSchema, updateDealSchema } = require("../Validator/dealValidation");
const { ZodError } = require("zod");


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


const createDealController = async (req, res) => {
  try {


    const integrationId = req.id;

    const validatedDealData = createDealSchema.parse(req.body);

    const deal = await createDealService(validatedDealData, integrationId);

    return sendResponse(res, 201, "Deal created successfully", deal);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Validation error", null, formatZodErrors(error));
    }
    console.error("Error in createDeal:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
}


const getAllDealsController = async (req, res) => {
  try {
    const integrationId = req.id;

    if (!integrationId) {
      return sendResponse(res, 400, "integrationId is required");
    }

    const { page = 1, search = "" } = req.query;

    const deals = await getAllDealsService(integrationId, page, search);

    return sendResponse(res, 200, "Deals fetched successfully", deals);
  } catch (err) {
    console.error("Error fetching deals:", err);
    return sendResponse(
      res,
      500,
      "Server error while fetching deals",
      null,
      [{ message: err.message }]
    );
  }
};


const deleteDealController = async (req, res) => {
  try {
    const { dealId } = req.params;
    const integrationId = req.id;
    if (!integrationId) {
      return sendResponse(res, 400, "integrationId is required");
    }

    if (!dealId) return sendResponse(res, 400, "Deal ID is required");

    const deletedDeal = await deleteDealService(dealId, integrationId);

    return sendResponse(res, 200, "Deal deleted successfully", deletedDeal);
  } catch (error) {
    console.error("Error in delete Deal:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};

const updateDealController = async (req, res) => {
  try {
    const integrationId = req.id;
    const { dealId } = req.params;


    if (!dealId) return sendResponse(res, 400, "Deal ID is required");
    if (!integrationId) return sendResponse(res, 400, "integrationId is required");

    const validatedData = updateDealSchema.parse(req.body);

    const updatedDeal = await updateDealService(dealId, validatedData, integrationId);

    return res.status(200).json({
      message: "Deal updated successfully",
      data: updatedDeal,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Validation error", null, formatZodErrors(error));
    }
    console.error("Error in UpdateDeal:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};



const updateDealStatusController = async (req, res) => {
  try {
    const { dealId, isActive } = req.body;
    const integrationId = req.id;

    const deal = await updateDealStatusService(dealId, isActive, integrationId);
    return sendResponse(res, 200, "Deal status updated successfully", deal);
  } catch (error) {
    console.error("Error in updateDealStatus:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};




const updateDealOfTheDayStatusController = async (req, res) => {
  try {
    const { dealId, isDealOfTheDay } = req.body;
    const integrationId = req.id;


    const deal = await updateDealOfTheDayStatusService(
      dealId,
      isDealOfTheDay,
      integrationId
    );

    return sendResponse(
      res,
      200,
      "Deal of the day status updated successfully",
      deal
    );
  } catch (error) {
    console.error("Error in updateDealOfTheDayStatus:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};


const applyDealsOnProducts = async (req, res) => {
  try {
    const integrationId = req.id;
    const { dealId, catalogueId, productIds, removedProductIds } = req.body;


    if (!dealId || !catalogueId || !Array.isArray(productIds)) {
      return sendResponse(
        res,
        400,
        "dealId, catalogueId and productIds are required"
      );
    }

    const result = await applyDealsOnProductsService(
      integrationId,
      dealId,
      catalogueId,
      productIds,
      removedProductIds || []
    );

    return sendResponse(res, 200, "Deal applied to selected products", {
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("Error in applyDealsOnProducts:", error);
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};



const getApplyDealsDetailsController = async (req, res) => {
  try {
   const integrationId = req.id;
    const { dealId } = req.params;

    if (!integrationId) {
      return sendResponse(res, 400, "integrationId is required");
    }

    if (!dealId) {
      return sendResponse(res, 400, "dealId is required");
    }

    const deal = await getApplyDealsDetailsService(integrationId, dealId);

    if (!deal) {
      return sendResponse(res, 404, "Deal not found");
    }

    return sendResponse(res, 200, "Deal details fetched successfully", deal);
  } catch (err) {
    console.error("Error fetching deal details:", err);
    return sendResponse(
      res,
      500,
      "Server error while fetching deal details",
      null,
      [{ message: err.message }]
    );
  }
};


const getDealProductsForApplyController = async (req, res) => {
  try {
    const { query, page = 1, limit = 5 } = req.query;
    const { catalogueId, dealId } = req.params;
    const integrationId = req.id;

    const { results, total } = await getDealProductsForApplyService(
      query,
      catalogueId,
      dealId,
      integrationId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Deal products fetched successfully",
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
    console.error("Error in getDealProductsForApplyController:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      errors: error.message,
    });
  }
};




module.exports = { createDealController, getAllDealsController, updateDealController, deleteDealController, updateDealStatusController, updateDealOfTheDayStatusController, applyDealsOnProducts, getApplyDealsDetailsController, getDealProductsForApplyController };
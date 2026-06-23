// controllers/cartController.js
const {
  deleteCartItemService,
  increaseCartItemQuantityService,
  decreaseCartItemQuantityService,
  getAllCartItemsService,
  createCartForCustomizedProductService,
  getCartItemsByProductService,
  getAllUserCartsService,
  deleteAllCartsService,
  applyDealOnCartService,
  removeDealFromCartService,
  clearDealByCouponTypeService
} = require('../Services/Cart.Service');

const {
  createCartForCustomizedProductSchema
} = require('../Validator/cartValidation');

const { ZodError } = require("zod");

const formatZodErrors = (zodError) => {
  if (!zodError || !zodError.issues) return [];
  return zodError.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};

// unified response helper
const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = { statusCode, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};




const createCartForCustomizedProduct = async (req, res) => {
  try {
    const parsedBody = createCartForCustomizedProductSchema.parse(req.body);
    const {
      integrationId,
      catalogueId,
      productId,
      quantity,
      customizationId,
      selectedOptions,
      specialRequest,

    } = parsedBody;


     const userId = req.id;

     // Enforce store opening hours check on backend
     const { Integration } = require('../Utils/Postgres');
     const moment = require('moment');
     const integration = await Integration.findByPk(integrationId);
     if (!integration) {
       return sendResponse(res, 404, "Store not found");
     }

     if (integration.isSuspended === true || integration.isActive === false || integration.isApproved === false) {
       return sendResponse(res, 400, "This store is currently unavailable.");
     }

     const openingHours = integration.openingHours;
     if (openingHours) {
       const now = moment();
       const dayName = now.format('dddd').toLowerCase();
       const daySchedule = openingHours[dayName];
       if (!daySchedule || !daySchedule.isOpen) {
         return sendResponse(res, 400, "This store is currently closed. You cannot add items to your cart.");
       }

       const currentTimeStr = now.format('HH:mm');
       const openTime = daySchedule.open;
       const closeTime = daySchedule.close;
       if (openTime && closeTime) {
         if (currentTimeStr < openTime || currentTimeStr > closeTime) {
           return sendResponse(res, 400, "This store is currently closed. You cannot add items to your cart.");
         }
       }
     }

    const result = await createCartForCustomizedProductService(
      userId,
      integrationId,
      catalogueId,
      productId,
      quantity,
      customizationId,
      selectedOptions,
      specialRequest,
    );

    return sendResponse(res, 201, "Cart created successfully", result);
  } catch (error) {
    console.error("Create Cart Error:", error);

    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Invalid request data", null, formatZodErrors(error));
    }

    return sendResponse(res, 500, "Error creating cart", null, [{ message: error.message }]);
  }
};



const deleteCartItem = async (req, res) => {
  try {
    const { integrationId, catalogueId } = req.params;

  
    const userId = req.id;

     const {productId} = req.body;

    const result = await deleteCartItemService(userId, integrationId, catalogueId, productId);

    return sendResponse(res, 200, "Item removed from cart successfully", result);
  } catch (error) {
    console.error("Delete Cart Error:", error);
    return sendResponse(res, 500, "Error deleting item from cart", null, [{ message: error.message }]);
  }
};


const increaseCartItemQuantity = async (req, res) => {
  try {
    const { integrationId, catalogueId, itemId } = req.params;
    const { isItemId } = req.body;


    const userId = req.id;

    const result = await increaseCartItemQuantityService(
      userId,
      integrationId,
      catalogueId,
      itemId,
      isItemId
    );

    return sendResponse(res, 200, "Item quantity increased successfully", result);
  } catch (error) {
    console.error("Increase Cart Error:", error);
    return sendResponse(res, 500, "Error increasing item quantity", null, [{ message: error.message }]);
  }
};


const decreaseCartItemQuantity = async (req, res) => {
  try {
    const { integrationId, catalogueId, itemId } = req.params;
    const { isItemId } = req.body; // get flag from request body
    const userId = req.id;


    const result = await decreaseCartItemQuantityService(
      userId,
      integrationId,
      catalogueId,
      itemId,
      isItemId
    );

    return sendResponse(res, 200, "Item quantity decreased successfully", result);
  } catch (error) {
    console.error("Decrease Cart Error:", error);
    return sendResponse(res, 500, "Error decreasing item quantity", null, [
      { message: error.message },
    ]);
  }
};



const getAllCartItems = async (req, res) => {
  try {
    const { integrationId, catalogueId } = req.params;

   
    const userId = req.id;

    const result = await getAllCartItemsService(userId, integrationId, catalogueId);

    return sendResponse(res, 200, "Cart items fetched successfully", result);
  } catch (error) {
    console.error("Get Cart Items Error:", error);
    return sendResponse(res, 500, "Error fetching cart items", null, [{ message: error.message }]);
  }
};


const getCartItemsByProduct = async (req, res) => {
  try {
    const { integrationId, catalogueId, productId } = req.params;

     const userId = req.id;

    const result = await getCartItemsByProductService(
      userId,
      integrationId,
      catalogueId,
      productId
    );

    return sendResponse(res, 200, "Cart items for product fetched successfully", result);
  } catch (error) {
    console.error("Get Cart Items By Product Error:", error);
    return sendResponse(res, 500, "Error fetching cart items for product", null, [
      { message: error.message },
    ]);
  }
};


const getAllUserCarts = async (req, res) => {
  try {
    const userId = req.id;

    const result = await getAllUserCartsService(userId);

    return sendResponse(res, 200, "User carts fetched successfully", result);
  } catch (error) {
    console.error("Get All User Carts Error:", error);
    return sendResponse(res, 500, "Error fetching user carts", null, [
      { message: error.message },
    ]);
  }
};


const deleteAllCarts = async (req, res) => {
  try {
    const userId = req.id;

    const result = await deleteAllCartsService(userId);

    return sendResponse(res, 200, "All carts deleted successfully", result);
  } catch (error) {
    console.error("Delete All Carts Error:", error);
    return sendResponse(res, 500, "Error deleting all carts", null, [
      { message: error.message },
    ]);
  }
};



const applyDealOnCart = async (req, res) => {
  try {
    const {
      cartId,
      dealIds = [],   // <-- Accept array
      integrationId,
      catalogueId
    } = req.body;

    const userId = req.id;

    const result = await applyDealOnCartService(
      userId,
      cartId,
      Array.isArray(dealIds) ? dealIds : [dealIds], // normalize to array
      integrationId,
      catalogueId
    );

    return sendResponse(res, 200, "Deals applied successfully", result);
  } catch (error) {
    console.error("Apply Deal Error:", error);

    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Invalid request data", null, formatZodErrors(error));
    }

    return sendResponse(res, 400, "Error applying deal", null, [{ message: error.message }]);
  }
};



const removeDealFromCart = async (req, res) => {
  try {
    const {
      cartId,
      dealId,
      integrationId,
      catalogueId
    } = req.body;

     const userId = req.id;

    const result = await removeDealFromCartService(
      userId,
      cartId,
      dealId,
      integrationId,
      catalogueId
    );

    return sendResponse(res, 200, "Deal removed successfully", result);
  } catch (error) {
    console.error("Remove Deal Error:", error);

    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Invalid request data", null, formatZodErrors(error));
    }

    return sendResponse(res, 400, "Error removing deal", null, [{ message: error.message }]);
  }
};


const clearDealByCouponType = async (req, res) => {
  try {
    const { cartId, couponType, integrationId, catalogueId } = req.body;
    const userId = req.id;

    const result = await clearDealByCouponTypeService(
      userId,
      cartId,
      couponType,
      integrationId,
      catalogueId
    );

    return sendResponse(res, 200, "Deal cleared successfully", result);
  } catch (error) {
    console.error("Clear Deal Error:", error);

    if (error instanceof ZodError) {
      return sendResponse(res, 400, "Invalid request data", null, formatZodErrors(error));
    }

    return sendResponse(res, 400, "Error clearing deal", null, [{ message: error.message }]);
  }
};




module.exports = {
  deleteCartItem,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  getAllCartItems,
  createCartForCustomizedProduct,
  getCartItemsByProduct,
  getAllUserCarts,
  deleteAllCarts,
  applyDealOnCart,
  removeDealFromCart,
  clearDealByCouponType
};

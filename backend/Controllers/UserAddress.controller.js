const { addUserAddress, deleteUserAddress, updateUserAddress, getUserAddressByIdService } = require("../Services/UserAddress.Service");
const axios = require("axios");
require("dotenv").config();
const Strings = require("../Utils/Strings");
const { createAddressSchema, updateAddressSchema, deleteAddressParamsSchema } = require("../Validator/addressValidation");

const { ZodError } = require("zod");

const { config } = require("../config");
const { getGeolocation } = require("../Utils/map");

const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = { statusCode, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};


// Create Address Contoller
const formatZodErrors = (zodError) => {
  if (!zodError || !zodError.issues) return [];

  return zodError.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};


async function createAddress(req, res, next) {
  try {
    const parsed = createAddressSchema.parse(req.body);

    const {
      fullName,
      contact,
      addressLine1,
      addressLine2 = "",
      city,
      state,
      country,
      pincode,
      addressType,
      customLabel
    } = parsed;

    const userId = req.id;

    let fullAddress = addressLine1;
    if (addressLine2) fullAddress += ", " + addressLine2;
    fullAddress += `, ${city}, ${state}, ${country}, ${pincode}`;

    // Use utility function
    let location;
    let mapsUrl;


    // try {
    //   const geo = await getGeolocation(fullAddress);
    //   location = { lat: geo.lat, lng: geo.lng };
    //   mapsUrl = geo.googleMapsUrl;
    // } catch (err) {
    //   console.error("Geocoding API failed:", err.message);
    //   return res.status(503).json({
    //     success: false,
    //     message: "External geocoding service unavailable",
    //   });
    // }


    let addressLabel = addressType;
    if (addressType === "other") {

      addressLabel = customLabel && customLabel.trim() !== "" ? customLabel : "other";
    }


    // Prepare address data
    const addressData = {
      fullName,
      contact,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      geoLocation: location,
      googleLocationUrl: mapsUrl,
      addressType,
      addressLabel
    };


    const addresses = await addUserAddress(userId, addressData);

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(error),
      });
    }

    console.error("Error adding address:", error.message);

    return res.status(500).json({
      success: false,
      message: Strings.SERVER_ERROR || "Internal server error",
      error: error.message,
    });
  }
}


// Delete Address Controller
const deleteAddress = async (req, res) => {
  try {
    const parsed = deleteAddressParamsSchema.parse(req.params);
    const { addressId } = parsed;
    const userId = req.id;
    const address = await deleteUserAddress(userId, addressId);

    res.status(200).json({
      success: true,
      message: "Address soft deleted successfully",
      data: address,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(error),
      });
    }

    if (error.message === "User not found" || error.message === "Address not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || Strings.SERVER_ERROR || "Internal server error",
    });
  }
};




//Update Address Contoller
async function updateAddress(req, res) {
  try {
    const { addressId } = req.params;

    const userId = req.id;

    const parsed = updateAddressSchema.parse(req.body);


    let addressLabel = parsed.addressType;
    if (parsed.addressType === "other") {
      // addressLabel = parsed.customLabel;

      addressLabel = parsed.customLabel && parsed.customLabel.trim() !== "" ? parsed.customLabel : "other";

    }

    const updatedData = { ...parsed, addressLabel };


    const updatedAddress = await updateUserAddress(userId, addressId, updatedData);

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(error),
      });
    }

    console.error("Error updating address:", error.message);

    res.status(500).json({
      success: false,
      message: Strings.SERVER_ERROR || "Internal server error",
      error: error.message,
    });
  }
}



// async function getAddressById(req, res) {
//   try {
//     const { addressId } = req.params;

//     const userId = req.id;

//     const address = await getUserAddressByIdService(userId, addressId);

//     return sendResponse(res, 200, "Address fetched successfully", address);
//   } catch (error) {
//     console.error("Error fetching address:", error.message);

//     if (error.message === "User not found" || error.message === "Address not found") {
//       return sendResponse(res, 404, error.message);
//     }

//     return sendResponse(res, 500, "Server error occurred", null, error.message);
//   }
// }

async function getAddressById(req, res) {
  try {
    const { addressId } = req.params;
    const { default: defaultQuery } = req.query; // query param ?default=true
  const userId = req.id;

    let isDefault = defaultQuery === "true"; // convert query string to boolean

    let address;

    if (isDefault) {
      // fetch default address
      address = await getUserAddressByIdService(userId, { default: true });
    } else if (addressId) {
      // fetch by address ID
      address = await getUserAddressByIdService(userId, { addressId });
    } else {
      // fetch all addresses
      address = await getUserAddressByIdService(userId, {});
    }

    if (!address || (Array.isArray(address) && address.length === 0)) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    return res.status(200).json({ success: true, data: address });
  } catch (error) {
    console.error(error.message);
    if (
      error.message === "No addresses found" ||
      error.message === "Address not found" ||
      error.message === "Default address not found" ||
      error.message === "User not found"
    ) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createAddress,
  deleteAddress,
  updateAddress,
  getAddressById
};

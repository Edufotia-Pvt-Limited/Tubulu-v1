const { ZodError } = require("zod");
const { createAdvertisementSchema } = require("../Validator/advertisementValidation");
const { createAdvertisementService, getAllAdvertisementService, deleteAdvertisementService, updateAdvertisementStatusService, getAdvertisementDetailsByIdService, editAdvertisementByIdService, getAppDiscoveryAdsService } = require("../Services/Advertisment.service");
const { fixUrl } = require("../Utils/UrlHelper");
const { getImageDimensions } = require("../Utils/imageDimensionHelper");

const validateBannerFile = (file) => {
  if (!file || !file.buffer) return null;
  const dims = getImageDimensions(file.buffer);
  if (!dims) {
    return "Unable to parse image dimensions. Please upload a valid PNG, JPEG, or WebP image.";
  }
  const { width, height } = dims;
  if (width < 600 || height < 150) {
    return `Image resolution too small (${width}x${height}px). Banners must be at least 600px wide and 150px high.`;
  }
  const ratio = width / height;
  if (ratio < 1.5 || ratio > 4.5) {
    return `Invalid image aspect ratio (${ratio.toFixed(2)}:1). Banners must have a wide/horizontal aspect ratio between 1.5:1 and 4.5:1 (e.g., 16:9 or 3:1).`;
  }
  return null;
};



// Format Zod errors
const formatZodErrors = (zodError) => {
  if (!zodError || !zodError.issues) return [];
  return zodError.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};

// Unified response helper
const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = { statusCode, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const createAdvertisement = async (req, res) => {
  try {
    const parsedBody = createAdvertisementSchema.parse(req.body);
    const { name, description } = parsedBody;

    const integrationId = req.id;

    const banner = req.file;
    if (banner) {
      const errorMsg = validateBannerFile(banner);
      if (errorMsg) {
        return sendResponse(res, 400, "Invalid advertisement data", null, [
          { field: "banner", message: errorMsg }
        ]);
      }
    }

    const createdAdvertisement = await createAdvertisementService({
      name,
      description,
      integrationId,
      banner,
      creatorUser: req.user
    });

    return sendResponse(
      res,
      201,
      "Advertisement created successfully",
      createdAdvertisement
    );

  } catch (error) {
    console.error("Create Advertisement Error:", error);

    if (error instanceof ZodError) {
      return sendResponse(
        res,
        400,
        "Invalid advertisement data",
        null,
        formatZodErrors(error)
      );
    }

    return sendResponse(res, 500, "Error creating advertisement", null, [
      { message: error.message },
    ]);
  }
};


const getAllAdvertisement = async (req, res) => {

  try {

    const integrationId = req.id;

    const { page = 1, search = "" } = req.query;

    const integrations = await getAllAdvertisementService(integrationId, page, search, req.user);

    return sendResponse(
      res,
      200,
      "Integrations fetched successfully",
      integrations
    );

  } catch (error) {
    console.error("Get Integrations Error:", error);

    return sendResponse(res, 500, "Error fetching integrations", null, [
      { message: error.message },
    ]);
  }
};

const deleteAdvertisement = async (req, res) => {
  try {
    const { advertisementId } = req.params;

    const integrationId = req.id;

    const result = await deleteAdvertisementService(advertisementId, integrationId, req.user);

    return sendResponse(
      res,
      200,
      "Advertisement deleted successfully",
      result
    );

  } catch (error) {
    console.error("Delete Advertisement Error:", error);

    return sendResponse(res, 500, "Error deleting advertisement", null, [
      { message: error.message },
    ]);
  }
};


const updateAdvertisementStatus = async (req, res) => {
  try {
    const { advertisementId } = req.params;
    const { isActive } = req.body;

    const integrationId = req.id;

    if (typeof isActive !== "boolean") {
      return sendResponse(res, 400, "isActive must be boolean", null);
    }

    const result = await updateAdvertisementStatusService(
      advertisementId,
      integrationId,
      isActive,
      req.user
    );

    return sendResponse(
      res,
      200,
      "Advertisement status updated successfully",
      result
    );

  } catch (error) {
    console.error("Update Status Error:", error);
    return sendResponse(res, 500, "Error updating advertisement status", null, [
      { message: error.message },
    ]);
  }
};

const getAdvertisementDetailsById = async (req, res) => {
  try {
    const { advertisementId } = req.params;

    const integrationId = req.id;

    const ad = await getAdvertisementDetailsByIdService(advertisementId, integrationId, req.user);

    return sendResponse(
      res,
      200,
      "Advertisement details fetched successfully",
      ad
    );

  } catch (error) {
    console.error("Get Advertisement Details Error:", error);
    return sendResponse(res, 500, "Error fetching advertisement details", null, [
      { message: error.message },
    ]);
  }
};



const editAdvertisementById = async (req, res) => {
  try {
    const { advertisementId } = req.params;

    const integrationId = req.id;

    // Partial validation
    const parsedBody = createAdvertisementSchema.partial().parse(req.body);

    // Attach uploaded banner if any
    if (req.file) {
      const errorMsg = validateBannerFile(req.file);
      if (errorMsg) {
        return sendResponse(res, 400, "Invalid advertisement data", null, [
          { field: "banner", message: errorMsg }
        ]);
      }
      parsedBody.banner = req.file;
    }

    const updatedAd = await editAdvertisementByIdService(advertisementId, integrationId, parsedBody, req.user);

    return sendResponse(res, 200, "Advertisement updated successfully", updatedAd);

  } catch (error) {
    console.error("Edit Advertisement Error:", error);

    if (error instanceof ZodError) {
      return sendResponse(
        res,
        400,
        "Invalid advertisement data",
        null,
        error.issues.map((err) => ({ field: err.path.join("."), message: err.message }))
      );
    }

    return sendResponse(res, 500, "Error updating advertisement", null, [
      { message: error.message },
    ]);
  }
};



const getAppDiscoveryAds = async (req, res, next) => {
  try {
    const { lat, lng, city, state } = req.query;
    let parsedLat = lat ? parseFloat(lat) : null;
    let parsedLng = lng ? parseFloat(lng) : null;

    let resolvedCity = city;
    // Fallback for emulators/tests outside India coverage area
    if (parsedLat !== null && parsedLng !== null) {
      if (parsedLat < 6 || parsedLat > 38 || parsedLng < 68 || parsedLng > 98) {
        console.log(`📡 Ads coordinates (${parsedLat}, ${parsedLng}) are outside India. Defaulting to Mysore (12.3237008, 76.6022778) for testing.`);
        parsedLat = 12.3237008;
        parsedLng = 76.6022778;
      }

      if (!resolvedCity) {
        const distToMysuru = Math.sqrt(Math.pow(parsedLat - 12.302, 2) + Math.pow(parsedLng - 76.639, 2));
        const distToBengaluru = Math.sqrt(Math.pow(parsedLat - 12.972, 2) + Math.pow(parsedLng - 77.594, 2));
        resolvedCity = distToMysuru < distToBengaluru ? 'Mysuru' : 'Bengaluru';
        console.log(`[GEO RESOLVER] Resolved coordinates (${parsedLat}, ${parsedLng}) to city: ${resolvedCity}`);
      }
    }

    const ads = await getAppDiscoveryAdsService({ lat: parsedLat, lng: parsedLng, city: resolvedCity, state });
    
    // Fix URLs for physical device testing
    const fixedAds = ads.map(ad => {
      const plainAd = ad.get ? ad.get({ plain: true }) : ad;
      return {
        ...plainAd,
        bannerUrl: fixUrl(plainAd.bannerUrl, req)
      };
    });

    return sendResponse(res, 200, "Discovery ads fetched successfully", fixedAds);
  } catch (error) {
    console.error("Get Discovery Ads Error:", error);
    return sendResponse(res, 500, "Error fetching discovery ads", null, [
      { message: error.message },
    ]);
  }
};



module.exports = {
  createAdvertisement,
  getAllAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus,
  getAdvertisementDetailsById,
  editAdvertisementById,
  getAppDiscoveryAds
};

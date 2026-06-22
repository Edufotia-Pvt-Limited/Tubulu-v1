const express = require("express");
const {
  uploadCatalogueProducts,
  createCatalogue,
  getCatalogue,
  deleteCatalogue,
  updateCatalogue,
  updateCatalogueStatus,
} = require("../Controllers/Catalogue.controller");

const {
  verifyIntegrationToken,
} = require("../MiddleWare/VerifyToken.Middleware");
const roleGuard = require('../MiddleWare/roleGuard');
const { catalogueUpload } = require("../MiddleWare/uploadMiddleware");

const router = express.Router();

router.post(
  "/upload-catalogue",
  catalogueUpload,
  verifyIntegrationToken,
  roleGuard('merchant_admin', 'super_admin'),
  uploadCatalogueProducts
);

router.post(
  "/create-catalogue",
  verifyIntegrationToken,
  roleGuard('merchant_admin', 'super_admin'),
  createCatalogue
);

// Route to get catalogue by integrationId
router.get("/catalogues", verifyIntegrationToken, getCatalogue);

// Soft delete a catalogue
router.delete("/:catalogueId", verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), deleteCatalogue);

// PUT /api/v1/catalogue/update
router.put(
  "/update-catalogue/:catalogueId",
  catalogueUpload,
  verifyIntegrationToken,
  roleGuard('merchant_admin', 'super_admin'),
  updateCatalogue
);


// update a catalogue status
router.post("/update-status", verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), updateCatalogueStatus);

module.exports = router;

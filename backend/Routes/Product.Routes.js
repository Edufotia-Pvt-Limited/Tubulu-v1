const express = require("express");
const {
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
} = require("../Controllers/Product.Controller");
const router = express.Router();

const { productImageUpload } = require("../MiddleWare/uploadMiddleware");

const {
  verifyIntegrationToken,verifyToken
} = require("../MiddleWare/VerifyToken.Middleware");
const roleGuard = require("../MiddleWare/roleGuard");




// GET /api/products/search?query=phone
router.get("/search/:catalogueId",verifyIntegrationToken, searchProducts);

router.post('/bulk-upload/:catalogueId', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), bulkUploadProducts);

router.post('/swiggy-import/:catalogueId', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), swiggyImport);

// General bulk image upload endpoint returning URL list
router.post('/upload-image', verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin', 'city_manager'), productImageUpload, async (req, res, next) => {
  try {
    const integrationId = req.id;
    const { Integration } = require('../Utils/Postgres');
    const { uploadFileToAws } = require('../Utils/awsUpload');
    const integration = await Integration.findByPk(integrationId);

    const folderName = integration ? integration.integrationName : 'System';

    const urls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadFileToAws(
          file.buffer,
          file.mimetype,
          file.originalname,
          integrationId,
          folderName,
          "catalogues"
        );
        urls.push(uploadResult.url);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      urls: urls
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload image' });
  }
});


// Add new product with multiple images
router.post(
  "/create/:catalogueId",
  verifyIntegrationToken,
  roleGuard('merchant_admin', 'super_admin'),
  productImageUpload, 
  addNewProduct
);


router.get("/single/:productId/:catalogueId", verifyIntegrationToken, getProductDetails);

router.put(
  "/edit/:productId/:catalogueId",
  verifyIntegrationToken,
  roleGuard('merchant_admin', 'super_admin'),
  productImageUpload,
  editProduct
);


router.delete("/delete/:productId", verifyIntegrationToken, roleGuard('merchant_admin', 'super_admin'), deleteProduct);


router.patch(
  "/toggle-active/:catalogueId/:productId",
  verifyIntegrationToken,
  roleGuard('merchant_admin', 'super_admin'),
  handleToggleActive
);


// APP 

router.get("/search-app/:integrationId",verifyToken, searchAppProductsByIntegration);

router.get("/food-types/:integrationId", getAllFoodTypes);

router.get('/customization/:integrationId/:catalogueId/:productId',verifyToken, getProductCustomization);

module.exports = router;

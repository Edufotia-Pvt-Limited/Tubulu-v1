const express = require("express");
const router = express.Router();
const UserAddressController = require("../Controllers/UserAddress.controller");
const { verifyToken } = require('../MiddleWare/VerifyToken.Middleware');

// POST 
router.post("/create-address",verifyToken, UserAddressController.createAddress);

// DELETE 
router.delete(
  "/delete/:addressId", verifyToken,
  UserAddressController.deleteAddress
);

// PATCH= update
router.patch(
  "/update/:addressId",verifyToken,
  UserAddressController.updateAddress
);

// router.get("/get-address/:addressId",verifyToken, UserAddressController.getAddressById);

router.get("/get-address/:addressId?",verifyToken, UserAddressController.getAddressById);

module.exports = router;

const express = require('express');
const router = express.Router();

const { deleteCartItem, increaseCartItemQuantity, decreaseCartItemQuantity, getAllCartItems, createCartForCustomizedProduct, getCartItemsByProduct, getAllUserCarts, deleteAllCarts, applyDealOnCart, removeDealFromCart, clearDealByCouponType } = require('../Controllers/Cart.controller');

const {
  verifyToken,
} = require("../MiddleWare/VerifyToken.Middleware");



router.post('/create',verifyToken, createCartForCustomizedProduct);

router.delete('/delete/:integrationId/:catalogueId',verifyToken, deleteCartItem); 
router.put('/increase/:integrationId/:catalogueId/:itemId',verifyToken, increaseCartItemQuantity);
router.put('/decrease/:integrationId/:catalogueId/:itemId',verifyToken, decreaseCartItemQuantity);
router.get('/items/:integrationId/:catalogueId',verifyToken, getAllCartItems);

router.get('/product-items/:integrationId/:catalogueId/:productId',verifyToken, getCartItemsByProduct);


router.get('/all-integrations',verifyToken, getAllUserCarts); 

router.delete('/delete/all-carts',verifyToken, deleteAllCarts); 

router.patch("/apply-deal",verifyToken, applyDealOnCart);

router.patch("/remove-deal",verifyToken, removeDealFromCart);


router.patch("/clear-deal",verifyToken, clearDealByCouponType);


module.exports = router;

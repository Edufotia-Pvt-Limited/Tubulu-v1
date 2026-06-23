
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors } from "../../Utils/Colors";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { updateCartQuantity } from "../../Store/cart.store/cart.thunks";
import type { RootState } from "../../Store/Store";
import InlineLoader from "./InlineLoader";
import ProductViewModal from "./ProductViewModal";
import CartItemViewModal from "./CartItemViewModal";
import FoodTypeIcon from "./FoodTypeIcon";

interface Product {
  productId: string;
  _id: string;
  productName: string;
  subtitle: string;
  discountPrice: number;
  productImages: string[];
  discountPercentage: number;
  productPrice: string;
  quantity: number;
  productDescription: string;
  catalogueId: string;
  integrationId: string;
  isCustomized?: boolean;
  foodType: "Veg" | "Non Veg" | "Egg" | "Other";
}

interface Props {
  product: Product;
  onPress: () => void;
}

const ProductListCard: React.FC<Props> = ({ product, onPress }) => {
  const dispatch = useAppDispatch();
  const [productModal, setProductModal] = useState(false);
  const [cartModal, setCartModal] = useState(false);

  const cartKey = `${product.integrationId}:${product.catalogueId}`;

  const qty = useAppSelector((state: RootState) => {
    const cart = state.cartState.carts[cartKey]?.cart || [];
    return cart
      .filter(i => i.productId === product.productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  });

  const cartItem = useAppSelector(
    state =>
      state.cartState.carts[cartKey]?.cart?.find(
        i => i.productId === product.productId
      )
  );

  const syncing = cartItem?.syncing;

  // ✅ ADDED
  const isOutOfStock = product.quantity === 0;

  const increase = () => {
    if (syncing || isOutOfStock) return;
    if (product.isCustomized) return setCartModal(true);

    dispatch(updateCartQuantity({
      integrationId: product.integrationId,
      catalogueId: product.catalogueId,
      productId: product.productId,
      currentQty: qty,
      isIncrease: true,
      isItemId: false,
    }));
  };

  const decrease = () => {
    if (syncing || isOutOfStock) return;
    if (product.isCustomized) return setCartModal(true);

    dispatch(updateCartQuantity({
      integrationId: product.integrationId,
      catalogueId: product.catalogueId,
      productId: product.productId,
      currentQty: qty,
      isIncrease: false,
      isItemId: false,
    }));
  };

  return (
    <>
      <View style={styles.card}>
        {/* LEFT */}
        <View style={styles.left}>
          {product.foodType !== "Other" && <FoodTypeIcon type={product.foodType} />}

          <Text style={styles.title} numberOfLines={2}>
            {product.productName}
          </Text>

          <Text style={styles.desc} numberOfLines={2}>
            {product.productDescription}
          </Text>

          {/* PRICE */}
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.price,
                {
                  color: product.discountPercentage
                    ? "#FF3E3E"
                    : colors.titleBlackColor,
                },
              ]}
            >
              ₹
              {!product.discountPrice || !product.discountPercentage
                ? product.productPrice
                : product.discountPrice}
            </Text>

            {Number(product.productPrice) > product.discountPrice && (
              <Text style={styles.strike}>₹{product.productPrice}</Text>
            )}
          </View>

          {product.discountPercentage > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text
                style={{
                  color: colors.jobStatus12,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {product.discountPercentage}% OFF
              </Text>
            </View>
          )}

          {/* ✅ ADDED OUT OF STOCK LABEL */}
          {isOutOfStock && (
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: "700",
                color: "#D32F2F",
              }}
            >
              Unavailable
            </Text>
          )}
        </View>

        {/* RIGHT */}
        <View style={styles.right}>
          <TouchableOpacity
            onPress={() => !isOutOfStock && setProductModal(true)}
            disabled={isOutOfStock}
            style={{ opacity: isOutOfStock ? 0.6 : 1 }}
          >
            <Image
              source={
                product.productImages?.length
                  ? { uri: product.productImages[0] }
                  : require("../../assets/order-card.jpg")
              }
              style={styles.image}
            />
          </TouchableOpacity>

          {qty === 0 ? (
            <TouchableOpacity
              style={[
                styles.ctaContainer,
                isOutOfStock && {
                  borderColor: "#BDBDBD",
                  backgroundColor: "#F2F2F2",
                },
              ]}
              disabled={isOutOfStock}
              onPress={() => {
                if (isOutOfStock) return;
                product.isCustomized ? setProductModal(true) : onPress();
              }}
            >
              <Text
                style={[
                  styles.addText,
                  isOutOfStock && { color: "#9E9E9E" },
                ]}
              >
                {isOutOfStock ? "Unavailable" : "ADD"}
              </Text>

              {!isOutOfStock && <Text style={styles.plusIcon}>＋</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                onPress={decrease}
                disabled={isOutOfStock || syncing}
                style={{ opacity: isOutOfStock ? 0.4 : 1 }}
              >
                <Text style={styles.ctaAction}>–</Text>
              </TouchableOpacity>

              <Text style={styles.qty}>{qty}</Text>
              {syncing && <InlineLoader />}

              <TouchableOpacity
                onPress={increase}
                disabled={isOutOfStock || syncing}
                style={{ opacity: isOutOfStock ? 0.4 : 1 }}
              >
                <Text style={styles.ctaAction}>+</Text>
              </TouchableOpacity>
            </View>
          )}

          {product.isCustomized && (
            <Text style={styles.customLabel}>Customisable</Text>
          )}
        </View>
      </View>

      {productModal && (
        <ProductViewModal
          visible
          onClose={() => setProductModal(false)}
          item={{
            name: product.productName,
            // price: product.discountPrice ?? +product.productPrice,
            // price: product.discountPrice ?? +product.productPrice,
            price: product.productPrice,
            description: product.productDescription,
            imageUri: product.productImages[0],
            integrationId: product.integrationId,
            catalogueId: product.catalogueId,
            productId: product.productId,
            isCustomized: product.isCustomized,
            discountPercentage: product.discountPercentage,
          }}
          itemQuantity={qty}
        />
      )}

      {cartModal && (
        <CartItemViewModal
          visible
          onClose={() => setCartModal(false)}
          openProductModal={() => setProductModal(true)}
          product={{
            integrationId: product.integrationId,
            catalogueId: product.catalogueId,
            productId: product.productId,
          }}
        />
      )}
    </>
  );
};

export default React.memo(ProductListCard);



const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    // paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: "#fff",

    // dashed ruler style
    borderBottomWidth: 1,
    // borderBottomColor: "#E3E3E3",
    borderBottomColor: "#cac4c4ff",
    borderStyle: "dashed",
  },

  /* LEFT SIDE */
  left: {
    flex: 1,
    paddingRight: 14,
  },


  right: {
    width: 138,
    alignItems: "center",
    paddingBottom: 8,
  },

  /* IMAGE */
  image: {
    width: 132,
    height: 120,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",

  },

  /* FOOD TYPE + TITLE */
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.titleBlackColor,
    marginTop: 6,
    lineHeight: 22,
  },

  desc: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
    lineHeight: 18,
  },

  /* PRICE */
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  price: {
    fontWeight: "700",
    fontSize: 16,
  },

  strike: {
    marginLeft: 8,
    color: "#9A9A9E",
    textDecorationLine: "line-through",
    fontSize: 12,
  },


  /* COUNTER */
  counter: {
    marginTop: -12,
    // marginTop: 10,
    flexDirection: "row",
    backgroundColor: colors.backgroundColorHeader,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    height: 34,
  },

  counterText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 6,
  },

  qty: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginHorizontal: 6,
    minWidth: 18,
    textAlign: "center",
  },

  /* CUSTOMISABLE LABEL */
  customLabel: {
    fontSize: 11,
    color: "#777",
    marginTop: 6,
  },

  addText: {
    color: colors.backgroundColorHeader,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.6,
  },

  plusIcon: {
    color: colors.backgroundColorHeader,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 4,
    marginTop: -1,
  },

  ctaAction: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 6,
  },

  ctaContainer: {
    marginTop: -14,
    height: 36,
    minWidth: 90,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: colors.backgroundColorHeader,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  qtyContainer: {
    marginTop: -14,
    height: 36,
    minWidth: 90,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: colors.backgroundColorHeader,
    backgroundColor: colors.backgroundColorHeader,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

});

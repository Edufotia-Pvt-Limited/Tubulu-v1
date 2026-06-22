
import React, { useState } from "react";
import {
  Image,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../Utils/Colors";
import ProductViewModal from "./ProductViewModal";
import { useAppSelector, useAppDispatch } from "../../Store/hooks";
import { updateCartQuantity } from "../../Store/cart.store/cart.thunks";
import type { RootState } from "../../Store/Store";
import InlineLoader from "./InlineLoader";
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

const ProductCard: React.FC<Props> = ({ product, onPress }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);

  const { width } = Dimensions.get("window");
  const CARD_WIDTH = (width - 15 * 2 - 15) / 2;


  const dispatch = useAppDispatch();
  const cartKey = `${product.integrationId}:${product.catalogueId}`;

  const qty = useAppSelector((state: RootState) => {
    const c = state.cartState.carts[cartKey];
    if (!c) return 0;
    return c.cart
      .filter((i) => i.productId === product.productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  });

  const cartItem = useAppSelector((state: RootState) =>
    (state.cartState.carts[cartKey]?.cart || []).find(
      (i) => i.productId === product.productId
    )
  );

  const syncing = cartItem?.syncing ?? false;
  const syncError = cartItem?.syncError;

  const isOutOfStock = product.quantity === 0;

  const handleIncreaseQty = () => {
    if (syncing || isOutOfStock) return;
      if (product.isCustomized) return setIsCartModalVisible(true);
    
    
    dispatch(
      updateCartQuantity({
        integrationId: product.integrationId,
        catalogueId: product.catalogueId,
        productId: product.productId,
        isIncrease: true,
        currentQty: qty,
        isItemId: false,
      })
    );
  };

  const handleDecreaseQty = () => {
    if (syncing || isOutOfStock || qty === 0) return;
      if (product.isCustomized) return setIsCartModalVisible(true);
    dispatch(
      updateCartQuantity({
        integrationId: product.integrationId,
        catalogueId: product.catalogueId,
        productId: product.productId,
        isIncrease: false,
        currentQty: qty,
        isItemId: false,
      })
    );
  };

  return (
    <View
      style={{
        width: CARD_WIDTH,
        borderRadius: 16,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 10,
        marginTop: 20,
        overflow: "hidden",
      }}
    >
      {/* IMAGE */}
      <TouchableOpacity
        onPress={() => !isOutOfStock && setIsModalVisible(true)}
        activeOpacity={0.9}
        disabled={isOutOfStock}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={
              product.productImages?.length
                ? { uri: product.productImages[0] }
                : require("../../assets/order-card.jpg")
            }
            style={{
              width: "100%",
              height: 140,
              backgroundColor: "#F9F9FB",
            }}
            resizeMode="cover"
          />

          {/* OUT OF STOCK OVERLAY */}
          {isOutOfStock && (
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.55)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
               Unavailable
              </Text>
            </View>
          )}

          {/* DISCOUNT */}
          {product.discountPercentage > 0 && !isOutOfStock && (
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "#FF3E3E",
                paddingVertical: 3,
                paddingHorizontal: 8,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                {product.discountPercentage}% OFF
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* INFO */}
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {product.foodType !== "Other" && (
            <FoodTypeIcon type={product.foodType} size={13} dotSize={6} />
          )}
          <Text
            style={{ fontSize: 14, fontWeight: "700", flexShrink: 1 }}
            numberOfLines={1}
          >
            {product.productName}
          </Text>
        </View>

  
        {/* Description (height preserved) */}
{product.productDescription ? (
  <Text
    style={{
      fontSize: 12,
      color: "#6C6C70",
      marginTop: 3,
      lineHeight: 16,
      minHeight: 32, 
    }}
    numberOfLines={2}
  >
    {product.productDescription}
  </Text>
) : (
  <View style={{ height: 32 }} /> 
)}


        <View style={{ flexDirection: "row", marginTop: 6, gap: 6 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: product.discountPercentage ? "#FF3E3E" : "#000",
            }}
          >
            ₹
            {product.discountPercentage
              ? product.discountPrice
              : product.productPrice}
          </Text>

          {Number(product.productPrice) > product.discountPrice && (
            <Text
              style={{
                fontSize: 12,
                color: "#999",
                textDecorationLine: "line-through",
              }}
            >
              ₹{product.productPrice}
            </Text>
          )}
               {product.isCustomized && (
                      <Text style={{fontSize: 11,
    color: "#777",
    marginTop: 3,}}>Customisable</Text>
                    )}
        </View>
      </View>

      {/* ACTION */}
      <View style={{ padding: 10 }}>
        {qty === 0 ? (
          <TouchableOpacity
            disabled={isOutOfStock}
            onPress={() => {
              if (isOutOfStock) return;
              product.isCustomized
                ? setIsModalVisible(true)
                : onPress();
            }}
            style={{
              height: 38,
              borderRadius: 10,
              backgroundColor: isOutOfStock
                ? "#D1D1D6"
                : colors.backgroundColorHeader,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
              {isOutOfStock ? "Unavailable" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.backgroundColorHeader,
              borderRadius: 10,
              paddingHorizontal: 10,
              height: 38,
            }}
          >
            <TouchableOpacity onPress={handleDecreaseQty}>
              <Text style={{ color: "#fff", fontSize: 18 }}>–</Text>
            </TouchableOpacity>

            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              {qty}
            </Text>

            <TouchableOpacity onPress={handleIncreaseQty}>
              <Text style={{ color: "#fff", fontSize: 18 }}>+</Text>
            </TouchableOpacity>

            {syncing && <InlineLoader />}
          </View>
        )}
      </View>

      {syncError && (
        <Text style={{ color: "red", fontSize: 11, textAlign: "center" }}>
          {syncError}
        </Text>
      )}

      {isModalVisible && (
        <ProductViewModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          item={{
            name: product.productName,
            // price: product.discountPrice ?? +product.productPrice,
               price: product.productPrice,
            description: product.productDescription,
            imageUri: product.productImages?.[0],
            integrationId: product.integrationId,
            catalogueId: product.catalogueId,
            productId: product.productId,
            isCustomized: product.isCustomized,
            discountPercentage: product.discountPercentage,
          }}
          itemQuantity={qty}
        />
      )}

      {isCartModalVisible && (
        <CartItemViewModal
          visible={isCartModalVisible}
          openProductModal={() => setIsModalVisible(true)}
          onClose={() => setIsCartModalVisible(false)}
          product={{
            integrationId: product.integrationId,
            catalogueId: product.catalogueId,
            productId: product.productId,
          }}
        />
      )}
    </View>
  );
};

export default ProductCard;

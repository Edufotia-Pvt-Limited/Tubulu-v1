
import { useEffect, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../Utils/Colors";
import { useAppDispatch } from "../../Store/hooks";
import { updateCartQuantity } from "../../Store/cart.store/cart.thunks";
import { fetchCartItemById } from "../../Utils/ApiActions";

interface Props {
  visible: boolean;
  onClose: () => void;
  openProductModal: () => void;
  product: {
    integrationId: string;
    catalogueId: string;
    productId: string;
  };
}

const RepeatCustomizationModal = ({
  visible,
  onClose,
  openProductModal,
  product,
}: Props) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!visible) return;

    let mounted = true;

    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await fetchCartItemById(
          product.integrationId,
          product.catalogueId,
          product.productId
        );

        if (mounted && res?.items?.length) {
          setCartItems(res.items);
        }
      } catch (e) {
        console.error("Error loading cart items:", e);
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchItems();

    return () => {
      mounted = false;
    };
  }, [visible, product]);

  const onQuantityChange = useCallback(
    async (
      id: string,
      currentQty: number,
      isIncrease: boolean,
      isItemId: boolean
    ) => {
      try {
        await dispatch(
          updateCartQuantity({
            integrationId: product.integrationId,
            catalogueId: product.catalogueId,
            productId: id,
            isIncrease,
            currentQty,
            isItemId,
          })
        ).unwrap();

        setCartItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: isIncrease
                    ? item.quantity + 1
                    : Math.max(1, item.quantity - 1),
                  total: isIncrease
                    ? item.total + item.price
                    : Math.max(item.price, item.total - item.price),
                }
              : item
          )
        );
      } catch (err) {
        console.error("Quantity update error:", err);
      }
    },
    [dispatch, product]
  );

  const renderSkeleton = () => (
    <>
      {[...Array(2)].map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.skelRowBetween}>
            <View style={styles.skelTitle} />
            <View style={styles.skelQty} />
          </View>

          <View style={styles.skelSubText} />

          <View style={styles.skelRowBetween}>
            <View style={styles.skelPriceSmall} />
            <View style={styles.skelPrice} />
          </View>
        </View>
      ))}
    </>
  );

  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropOpacity={0.7}
      coverScreen
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      propagateSwipe
      hideModalContentWhileAnimating
      deviceHeight={Dimensions.get("screen").height}
      deviceWidth={Dimensions.get("screen").width}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback>
        <View
          style={[
            styles.container,
            {
              maxHeight:
                Platform.OS === "ios"
                  ? Dimensions.get("window").height * 0.9
                  : Dimensions.get("window").height * 0.9,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Repeat last used customization?</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              renderSkeleton()
            ) : (
              cartItems.map((item) => (
                <View key={item._id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>
                        {item.product.name}
                      </Text>
                    </View>

                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          onQuantityChange(item._id, item.quantity, false, true)
                        }
                        style={styles.qtyButton}
                      >
                        <Text style={styles.qtySymbol}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          onQuantityChange(item._id, item.quantity, true, true)
                        }
                        style={styles.qtyButton}
                      >
                        <Text style={styles.qtySymbol}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.customText}>
                    {item.choiceNames.join(", ")}
                  </Text>

                  <View style={styles.rowBetween}>
                    {item.price > item.total && (
                      <Text style={styles.totalPrice}>₹{item.price}</Text>
                    )}
                    <Text style={styles.totalText}>₹{item.total}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity
            style={styles.addNewBtn}
            onPress={() => {
              openProductModal();
              onClose();
            }}
          >
            <Text style={styles.addNewText}>+ Add new customisation</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </ReactNativeModal>
  );
};

export default memo(RepeatCustomizationModal);



const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
   
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
      backgroundColor: colors.backgroundColorHeader,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
    closeBtn: {
    backgroundColor: "#ffffff33",
    padding: 6,
    borderRadius: 50,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFF",
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.titleBlackColor,
  },
  priceText: {
    fontSize: 14,
    color: colors.merchantScreenTitleColor,
    marginTop: 3,
  },
  customText: {
    fontSize: 14,
    color: "#555",
    marginVertical: 8,
  },
  editRow: { flexDirection: "row", alignItems: "center" },
  editText: {
    fontSize: 15,
    color: colors.backgroundColorHeader,
    fontWeight: "600",
    marginRight: 3,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.backgroundColorHeader,
  },
    totalPrice: {
  color: colors.backgroundColorHeader,
  fontSize: 14,
  fontWeight: "600",
  textDecorationLine: "line-through",
  marginRight: 6,
  opacity: 0.8,
},
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
  },
  qtyButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.backgroundColorHeader,
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.backgroundColorHeader,
    marginHorizontal: 6,
  },
  addNewBtn: {
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 24,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addNewText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.backgroundColorHeader,
  },
    skelRowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skelTitle: {
    height: 16,
    width: "55%",
    backgroundColor: "#e5e5e5",
    borderRadius: 6,
  },
  skelQty: {
    height: 36,
    width: 90,
    backgroundColor: "#e5e5e5",
    borderRadius: 10,
  },
  skelSubText: {
    height: 14,
    width: "75%",
    backgroundColor: "#ededed",
    borderRadius: 6,
    marginVertical: 10,
  },
  skelPrice: {
    height: 16,
    width: 70,
    backgroundColor: "#e5e5e5",
    borderRadius: 6,
  },
  skelPriceSmall: {
    height: 14,
    width: 50,
    backgroundColor: "#ededed",
    borderRadius: 6,
  },
});



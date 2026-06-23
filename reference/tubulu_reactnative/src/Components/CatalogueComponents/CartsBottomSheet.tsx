
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Modal,
  Platform,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";

interface Cart {
  cartId: string;
  catalogueId: string;
  integrationId: string;
  integrationLogo: string;
  integrationName: string;
  itemsCount: number;
}

interface Props {
  carts: Cart[];
  loading?: boolean;
  onOpenCart?: (item: Cart) => void;
  onRemove?: (item: Cart) => void;
  onClearAll?: () => void;
  onBrowse?: () => void;
  onViewMenu?: (item: Cart) => void;
}

const PRIMARY = "#2355C4";
const CARD_HEIGHT = 60; // compact height

const CartsPage: React.FC<Props> = ({
  carts,
  loading = false,
  onOpenCart,
  onRemove,
  onClearAll,
  onBrowse,
  onViewMenu,
}) => {
  const swipeableRefs = useRef<Map<string, Swipeable | null>>(new Map());

  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<"single" | "all" | null>(null);
  const [selectedCart, setSelectedCart] = React.useState<Cart | null>(null);

  const askRemove = (cart: Cart) => {
    setSelectedCart(cart);
    setConfirmType("single");
    setConfirmVisible(true);
  };

  const askClearAll = () => {
    setSelectedCart(null);
    setConfirmType("all");
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    if (confirmType === "single" && selectedCart) {
      onRemove?.(selectedCart);
    } else if (confirmType === "all") {
      onClearAll?.();
    }
    setConfirmVisible(false);
    setSelectedCart(null);
    setConfirmType(null);
  };

  const handleCancel = () => {
    setConfirmVisible(false);
    setSelectedCart(null);
    setConfirmType(null);
  };

  // skeleton shimmer anim
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const renderRightActions = (item: Cart) => (
    <View style={styles.swipeDeleteContainer}>
      <TouchableOpacity style={styles.removeSwipe} onPress={() => askRemove(item)} activeOpacity={0.85}>
        <Ionicons name="trash" size={18} color="#fff" />
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Cart }) => {
    const setRef = (r: Swipeable | null) => swipeableRefs.current.set(item.cartId, r);

    return (
      <Swipeable ref={setRef} overshootRight={false} renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity
          style={styles.cartCard}
          onPress={() => onViewMenu?.(item)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: item.integrationLogo }} style={styles.logo} resizeMode="cover" />

          <View style={styles.meta}>
            <Text numberOfLines={1} style={styles.name}>
              {item.integrationName}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <Text style={styles.viewMenuText}>View Menu</Text>
              <Ionicons name="chevron-forward" size={14} color={PRIMARY} style={{ marginLeft: 4 }} />
            </View>
          </View>

          <TouchableOpacity style={styles.viewBtn} onPress={() => onOpenCart?.(item)} activeOpacity={0.85}>
            <Text style={styles.viewBtnText}>View Cart</Text>
            <Text style={styles.itemCount}>
              {item.itemsCount} {item.itemsCount === 1 ? "item" : "items"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={() => askRemove(item)} activeOpacity={0.8}>
            <Ionicons name="close-circle" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="cart-outline" size={40} color="#BBB" />
      </View>
      <Text style={styles.emptyTitle}>No active carts</Text>
      <Text style={styles.emptySubtitle}>Add items from your integrations to create a cart.</Text>

      <TouchableOpacity style={styles.browseBtn} activeOpacity={0.85} onPress={onBrowse}>
        <Text style={styles.browseBtnText}>Browse Integrations</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>Your Carts ({carts.length})</Text>
        </View>

        {carts.length > 0 && (
          <TouchableOpacity onPress={askClearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={carts}
        keyExtractor={(item) => item.cartId}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          flexGrow: carts.length === 0 ? 1 : 0,
          paddingBottom: 40,
          paddingHorizontal: 14,
        }}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={confirmVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {confirmType === "single" ? "Remove Cart?" : "Clear All Carts?"}
            </Text>

            <Text style={styles.modalSubtitle}>
              {confirmType === "single"
                ? "Are you sure you want to remove this cart?"
                : "This will remove all carts from your list."}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOkBtn} onPress={handleConfirm}>
                <Text style={styles.modalOkText}>
                  {confirmType === "single" ? "Yes, Remove" : "Yes, Clear All"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CartsPage;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDFF",
    paddingTop: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  titleBadge: {
    backgroundColor: "rgba(35,85,196,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },

  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
  },

  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY,
  },

  /* ===== COMPACT CARD ===== */
  cartCard: {
    flexDirection: "row",
    alignItems: "center",
    height: CARD_HEIGHT,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.06 : 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    marginTop: 12,
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },

  meta: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 6,
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    maxWidth: "95%",
  },

  viewMenuText: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: "600",
  },

  viewBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  viewBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 14,
  },

  itemCount: {
    color: "#fff",
    fontSize: 10,
    marginTop: 1,
  },

  closeBtn: {
    paddingLeft: 4,
    justifyContent: "center",
    marginLeft: 6,
  },

  /* Swipe */
  swipeDeleteContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 86,
    height: CARD_HEIGHT,
  },

  removeSwipe: {
    backgroundColor: "#FF6B6B",
    width: 82,
    height: CARD_HEIGHT - 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  removeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 4,
  },

  /* empty */
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },

  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "#F4F6FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 18,
  },

  browseBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  browseBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#666",
  },

  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#E8ECF5",
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
  },

  modalCancelText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#5A5A5A",
  },

  modalOkBtn: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
  },

  modalOkText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});

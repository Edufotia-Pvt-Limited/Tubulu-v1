import React, { useCallback, useEffect, useMemo, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { chatContext } from '../Context/ChatContext';
import Icon from "react-native-vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import { getOrderDetails } from "../Utils/ApiActions";
import { colors } from "../Utils/Colors";


interface Customization {
  choiceName: string;
  choicePrice: string;
}

interface ProductItem {
  productName: string;
  productQuantity: number;
  productLogo: string;
  productPrice: string;
  customizations: Customization[];
}

interface Order {
  orderId: string;
  orderStatus: string;
  orderDate: string;
  deliveryAddress: string;
  paymentMethod: string;
  productDetails: ProductItem[];
  subtotal: string;
  taxes: string;
  totalSaved: string;
  toPay: string;
}

interface Props {
  navigation: any;
  route: {
    params?: {
      orderId?: string;
      // type? : string
    };
  };
}


const ORDER_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "packing", label: "Preparing" },
  { key: "dispatched", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "canceled", label: "Canceled" },
];

// Helper function to normalize order status to match ORDER_STEPS keys
const normalizeOrderStatus = (status: string): string => {
  if (!status) return "placed";
  const normalized = status.toLowerCase().trim();

  // Map various status formats to our step keys
  const statusMap: { [key: string]: string } = {
    "order_placed": "placed",
    "placed": "placed",
    "order_accepted": "accepted",
    "accepted": "accepted",
    "confirmed": "accepted",
    "order_packing": "packing",
    "packing": "packing",
    "preparing": "packing",
    "order_dispatched": "dispatched",
    "dispatched": "dispatched",
    "out_for_delivery": "dispatched",
    "order_delivered": "delivered",
    "delivered": "delivered",
    "order_canceled": "canceled",
    "order_cancelled": "canceled",
    "canceled": "canceled",
    "cancelled": "canceled",
    "ORDER_DELIVERED": "delivered",
    "ORDER_ACCEPTED": "delivered",
    "ORDER_DISPATCHED": "delivered",
    "ORDER_PREPARING": "delivered",
    "ORDER_PLACED": "delivered",
    "ORDER_CANCELLED": "canceled",

  };

  return statusMap[normalized] || normalized;
};


const OrderSummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const orderId = route?.params?.orderId;
  // const type = route?.params?.type;
  const insets = useSafeAreaInsets();
  const chat = useContext(chatContext) as any
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);


  const msgType = useMemo(() => {
    if (!order?.orderId) return ""
    return chat?.state?.chatmessages.find((item: any) => item.orderId === order.orderId)?.type || ""

  }, [chat?.state?.chatmessages, order?.orderId])


  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await getOrderDetails(orderId);
      setOrder(res);
    } catch (e) {
      console.log("Order fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);



  // Normalize and find current step index
  const normalizedStatus = useMemo(() => {
    if (!msgType) return "placed";
    // return normalizeOrderStatus(order.orderStatus);
    return normalizeOrderStatus(msgType);
  }, [msgType]);

  const currentStepIndex = useMemo(() => {
    if (!order) return 0;
    const index = ORDER_STEPS.findIndex(s => s.key === normalizedStatus);
    return Math.max(index, 0);
  }, [order, normalizedStatus]);

  // Check if this is a canceled order
  const isCanceled = normalizedStatus === "canceled";

  // For canceled orders, we need to determine the last completed step before cancellation
  // Since we don't have history, we'll show steps up to "accepted" as completed
  // (placed and accepted are minimum required before cancellation)
  // Then show canceled after that
  const lastCompletedStepBeforeCancel = isCanceled
    ? ORDER_STEPS.findIndex(s => s.key === "accepted")
    : -1;

  const handleCopyOrderId = useCallback(() => {
    if (order?.orderId) {
      Clipboard.setString(order.orderId);
      setShowCopyToast(true);
      setTimeout(() => {
        setShowCopyToast(false);
      }, 2000);
    }
  }, [order?.orderId]);

  if (loading) {
    return <OrderSummarySkeleton navigation={navigation} insets={insets} />;
  }

  if (!order) return null;

  return (

    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor="#2355C4" barStyle="light-content" translucent />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* ORDER INFO & STEPPER - MERGED */}
        <View style={styles.mergedCard}>
          {/* Order ID & Status Header */}
          <View style={styles.orderInfoHeader}>
            <View style={styles.orderIdBadge}>
              <Icon name="receipt-outline" size={18} color={colors.backgroundColorHeader} />
              <Text style={styles.orderId} numberOfLines={1}>Order #{truncateOrderId(order.orderId)}</Text>
              <TouchableOpacity
                onPress={handleCopyOrderId}
                style={styles.copyButton}
                activeOpacity={0.7}
              >
                <Icon name="copy-outline" size={14} color={colors.backgroundColorHeader} />
              </TouchableOpacity>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) }]}>
              <Text style={styles.statusText} numberOfLines={1}>{order.orderStatus}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperRow}>
              {ORDER_STEPS.map((step, index) => {
                // Skip showing canceled as a step if it's not the current status
                if (step.key === "canceled" && !isCanceled) {
                  return null;
                }

                const isCanceledStep = step.key === "canceled" && isCanceled;

                // For canceled orders, hide steps that come after the last completed step
                if (isCanceled && !isCanceledStep && index > lastCompletedStepBeforeCancel) {
                  return null;
                }

                // Determine step states
                let completed = false;
                let active = false;

                if (isCanceled) {
                  // For canceled orders: only show steps up to last completed as completed
                  if (isCanceledStep) {
                    active = true;
                  } else {
                    // Only steps up to lastCompletedStepBeforeCancel are shown as completed
                    completed = index <= lastCompletedStepBeforeCancel;
                  }
                } else {
                  // Normal flow: show steps up to current as completed, current as active
                  completed = index < currentStepIndex;
                  active = index === currentStepIndex;
                }

                // Check if there's a next visible step to draw a line to
                const nextVisibleStepIndex = ORDER_STEPS.findIndex((s, idx) => {
                  if (idx <= index) return false;
                  if (s.key === "canceled" && !isCanceled) return false;
                  if (isCanceled && !isCanceledStep && idx > lastCompletedStepBeforeCancel && s.key !== "canceled") return false;
                  return true;
                });
                const hasNextStep = nextVisibleStepIndex !== -1;

                return (
                  <View key={step.key} style={styles.stepItem}>
                    {/* Line connecting to next step */}
                    {hasNextStep && step.key !== "canceled" && (
                      <View
                        style={[
                          styles.stepLine,
                          completed && styles.stepLineCompleted,
                          !completed && styles.stepLineIncomplete,
                        ]}
                      />
                    )}

                    <View style={styles.stepContent}>
                      <View
                        style={[
                          styles.stepDot,
                          completed && !isCanceledStep && styles.stepDotCompleted,
                          active && !isCanceledStep && styles.stepDotActive,
                          isCanceledStep && styles.stepDotCanceled,
                        ]}
                      >
                        {active && !isCanceledStep && (
                          <View style={styles.stepDotInner} />
                        )}
                        {isCanceledStep && (
                          <Text style={styles.canceledIcon}>✕</Text>
                        )}
                        {completed && !isCanceledStep && (
                          <Text style={styles.checkIcon}>✓</Text>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.stepLabel,
                          active && !isCanceledStep && styles.stepLabelActive,
                          isCanceledStep && styles.stepLabelCanceled,
                          completed && !isCanceledStep && styles.stepLabelCompleted,
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Date Footer */}
          <View style={styles.dateRow}>
            <Icon name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.date}>
              {new Date(order.orderDate).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ITEMS & BILL SUMMARY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cube-outline" size={16} color="#6B7280" />
            <Text style={styles.sectionTitle}>
              {order.productDetails.length} {order.productDetails.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>

          {order.productDetails.map((item, index) => (
            <View key={index} style={[styles.itemCard, index === order.productDetails.length - 1 && styles.itemCardLast]}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.productLogo }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.itemInfo}>
                <Text numberOfLines={2} style={styles.itemName}>
                  {item.productName}
                </Text>
                <View style={styles.qtyRow}>
                  <Icon name="layers-outline" size={12} color="#6B7280" />
                  <Text style={styles.qty}>Quantity: {item.productQuantity}</Text>
                </View>

                {item.customizations?.length > 0 && (
                  <View style={styles.customizations}>
                    {item.customizations.map((c, i) => (
                      <View key={i} style={styles.chip}>
                        <Icon name="add-circle-outline" size={10} color="#3730A3" />
                        <Text style={styles.chipText}>
                          {c.choiceName} (+₹{c.choicePrice})
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{item.productPrice}</Text>
              </View>
            </View>
          ))}

          {/* BILL SUMMARY - Integrated */}
          <View style={styles.billSummaryContainer}>
            <View style={styles.billSummaryDivider} />
            <View style={styles.billSummaryHeader}>
              <View style={styles.billSummaryIconContainer}>
                <Icon name="receipt-outline" size={18} color={colors.backgroundColorHeader} />
              </View>
              <Text style={styles.billSummaryTitle}>Bill Summary</Text>
            </View>

            <View style={styles.billSummaryContent}>
              <BillRow label="Subtotal" value={order.subtotal} />
              <BillRow label="Taxes" value={order.taxes} />
              {parseFloat(order.totalSaved) > 0 && (
                <BillRow label="You Saved" value={order.totalSaved} highlight={false} saved />
              )}
            </View>

            <View style={styles.billSummaryTotalDivider} />

            <View style={styles.billSummaryTotalRow}>
              <Text style={styles.billSummaryTotalLabel}>Total Payable</Text>
              <Text style={styles.billSummaryTotalValue}>₹{order.toPay}</Text>
            </View>
          </View>
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <View style={styles.addressIconContainer}>
              <Icon name="location" size={22} color="#fff" />
            </View>
            <View style={styles.addressTitleContainer}>
              <Text style={styles.addressTitle}>Delivery Address</Text>
              <Text style={styles.addressSubtitle}>Where your order will be delivered</Text>
            </View>
          </View>
          <View style={styles.addressContent}>
            <View style={styles.addressDivider} />
            <View style={styles.addressTextContainer}>
              <Icon name="home-outline" size={16} color="#059669" style={styles.addressTextIcon} />
              <Text style={styles.addressText}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Copy Toast */}
      {showCopyToast && (
        <View style={styles.toastContainer}>
          <Icon name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.toastText}>Order ID copied!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OrderSummaryScreen;


const truncateOrderId = (orderId: string, startChars: number = 6, endChars: number = 6): string => {
  if (!orderId || orderId.length <= startChars + endChars) {
    return orderId;
  }
  const start = orderId.substring(0, startChars);
  const end = orderId.substring(orderId.length - endChars);
  return `${start}...${end}`;
};

const BillRow = ({ label, value, bold, highlight, saved }: any) => (
  <View style={styles.billRow}>
    <Text style={[styles.billLabel, bold && styles.bold]}>{label}</Text>
    <Text
      style={[
        styles.billValue,
        bold && styles.bold,
        highlight && { color: colors.backgroundColorHeader, fontSize: 16 },
        saved && styles.savedText,
      ]}
    >
      {saved ? `- ₹${value}` : `₹${value}`}
    </Text>
  </View>
);

const getStatusColor = (status: string) => {
  const normalized = normalizeOrderStatus(status);
  const statusColors: { [key: string]: string } = {
    placed: "#D1FAE5",
    accepted: "#D1FAE5",
    confirmed: "#D1FAE5",
    packing: "#D1FAE5",
    preparing: "#D1FAE5",
    dispatched: "#D1FAE5",
    out_for_delivery: "#D1FAE5",
    delivered: "#D1FAE5",
    canceled: "#FEE2E2",
    cancelled: "#FEE2E2",
  };
  return statusColors[normalized] || "#D1FAE5";
};


const SkeletonBox = ({ width, height, borderRadius = 8, style }: any) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const opacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <View style={[{ width, height, borderRadius, backgroundColor: "#E5E7EB", overflow: "hidden" }, style]}>
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "#F9FAFB",
          opacity,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

const OrderSummarySkeleton = ({ navigation, insets }: any) => (
  <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
    <StatusBar backgroundColor="#2355C4" barStyle="light-content" translucent />

    {/* HEADER */}
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <SkeletonBox width={140} height={20} borderRadius={4} />
      <View style={{ width: 24 }} />
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >

      <View style={styles.mergedCard}>
        <View style={styles.orderInfoHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
            <SkeletonBox width={18} height={18} borderRadius={9} />
            <SkeletonBox width={120} height={16} borderRadius={4} />
          </View>
          <SkeletonBox width={70} height={24} borderRadius={12} />
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.stepperContainer}>
          <View style={styles.stepperRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepContent}>
                  <SkeletonBox width={24} height={24} borderRadius={12} />
                  <SkeletonBox width={55} height={11} borderRadius={4} style={{ marginTop: 6 }} />
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.dateRow}>
          <SkeletonBox width={14} height={14} borderRadius={7} />
          <SkeletonBox width={160} height={12} borderRadius={4} />
        </View>
      </View>

      {/* ITEMS & BILL SUMMARY SKELETON */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonBox width={16} height={16} borderRadius={8} />
          <SkeletonBox width={70} height={14} borderRadius={4} />
        </View>
        {[1, 2].map((i) => (
          <View key={i} style={[styles.itemCard, i === 2 && styles.itemCardLast]}>
            <SkeletonBox width={60} height={60} borderRadius={12} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonBox width="85%" height={16} borderRadius={4} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
                <SkeletonBox width={12} height={12} borderRadius={6} />
                <SkeletonBox width={90} height={12} borderRadius={4} />
              </View>
            </View>
            <SkeletonBox width={55} height={16} borderRadius={4} />
          </View>
        ))}

        {/* BILL SUMMARY SKELETON - Integrated */}
        <View style={styles.billSummaryContainer}>
          <View style={styles.billSummaryDivider} />
          <View style={styles.billSummaryHeader}>
            <SkeletonBox width={32} height={32} borderRadius={16} />
            <SkeletonBox width={100} height={15} borderRadius={4} />
          </View>
          <View style={styles.billSummaryContent}>
            <View style={styles.billRow}>
              <SkeletonBox width={70} height={13} borderRadius={4} />
              <SkeletonBox width={65} height={13} borderRadius={4} />
            </View>
            <View style={styles.billRow}>
              <SkeletonBox width={50} height={13} borderRadius={4} />
              <SkeletonBox width={55} height={13} borderRadius={4} />
            </View>
            <View style={styles.billRow}>
              <SkeletonBox width={75} height={13} borderRadius={4} />
              <SkeletonBox width={70} height={13} borderRadius={4} />
            </View>
          </View>
          <View style={styles.billSummaryTotalDivider} />
          <View style={styles.billSummaryTotalRow}>
            <SkeletonBox width={95} height={16} borderRadius={4} />
            <SkeletonBox width={80} height={18} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* ADDRESS SKELETON */}
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <SkeletonBox width={48} height={48} borderRadius={24} />
          <View style={styles.addressTitleContainer}>
            <SkeletonBox width={140} height={16} borderRadius={4} />
            <SkeletonBox width={180} height={11} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
        </View>
        <View style={styles.addressContent}>
          <View style={styles.addressDivider} />
          <View style={styles.addressTextContainer}>
            <SkeletonBox width={16} height={16} borderRadius={8} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <SkeletonBox width="100%" height={14} borderRadius={4} />
              <SkeletonBox width="85%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);

/* ---------------- STYLES ---------------- */

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safe: {
    flex: 1,

    backgroundColor: "#F4F6FB"

  },

  header: {
    backgroundColor: "#2355C4",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  mergedCard: {
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },

  stepperCard: {
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 10,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  stepperContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },

  stepContent: {
    alignItems: "center",
    zIndex: 2,
  },

  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },

  stepDotCompleted: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },

  stepDotActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  stepDotCanceled: {
    backgroundColor: "#d32f2f",
    borderColor: "#d32f2f",
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },

  checkIcon: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  canceledIcon: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  stepLine: {
    position: "absolute",
    top: 14,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#e5e7eb",
    zIndex: 0,
  },

  stepLineCompleted: {
    backgroundColor: "#22c55e",
  },

  stepLineIncomplete: {
    backgroundColor: "#e5e7eb",
  },

  stepLabel: {
    marginTop: 6,
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "500",
    textAlign: "center",
    minHeight: 28,
  },

  stepLabelActive: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 11,
  },

  stepLabelCanceled: {
    color: "#d32f2f",
    fontWeight: "700",
    fontSize: 11,
  },

  stepLabelCompleted: {
    color: "#22c55e",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  orderInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  orderIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: 6,
  },

  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    flex: 1,
  },

  copyButton: {
    padding: 4,
    marginLeft: 4,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    flexShrink: 0,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    textTransform: "capitalize",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  date: {
    fontSize: 12,
    color: "#6B7280",
  },

  section: {
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },

  itemCard: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  itemCardLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },

  imageContainer: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    lineHeight: 20,
    marginBottom: 6,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },

  qty: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  customizations: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },

  chip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },

  chipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#3730A3",
  },

  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },

  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  billSummaryContainer: {
    marginTop: 20,
    paddingTop: 20,
  },

  billSummaryDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },

  billSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  billSummaryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  billSummaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    letterSpacing: 0.2,
  },

  billSummaryContent: {
    marginBottom: 12,
  },

  billSummaryTotalDivider: {
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  billSummaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },

  billSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    letterSpacing: 0.3,
  },

  billSummaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.backgroundColorHeader,
    letterSpacing: 0.2,
  },

  billCard: {
    backgroundColor: "#F9FAFB",
    margin: 12,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  billTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
    alignItems: "center",
  },

  billLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  billValue: {
    fontSize: 13,
    color: "#111",
    fontWeight: "600",
  },

  bold: { fontWeight: "700" },

  savedText: {
    color: "#22C55E",
    fontWeight: "600",
  },

  divider: {
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  addressCard: {
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    shadowColor: "#22C55E",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },

  addressHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  addressTitleContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  addressTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    letterSpacing: 0.2,
    marginBottom: 2,
  },

  addressSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },

  addressContent: {
    marginTop: 4,
  },

  addressDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 14,
  },

  addressTextContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
  },

  addressTextIcon: {
    marginTop: 2,
    marginRight: 10,
  },

  addressText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#065F46",
    fontWeight: "500",
    flex: 1,
    letterSpacing: 0.1,
  },

  toastContainer: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#22C55E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 1000,
  },

  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});


import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  DimensionValue,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { fetchCart } from "../Store/cart.store/cart.thunks";
import { colors } from "../Utils/Colors";
import { IAppState } from "../Store/State";
import { applyDealAsyc, clearDealAsync } from "../Utils/ApiActions";
import CouponDetailsModal from "../Components/CatalogueComponents/CouponDetailsModal";

interface SkeletonProps {
  height?: number;
  width?: DimensionValue;
  radius?: number;
}

const SkeletonPlaceholder = ({ height = 14, width = "100%", radius = 6 }: SkeletonProps) => (
  <View
    style={{
      backgroundColor: "#e5e5e5",
      height,
      width,
      borderRadius: radius,
      marginBottom: 10,
    }}
  />
);

export default function CouponsPage({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const integrationId: string | undefined = route?.params?.integrationId;
  const catalogueId: string | undefined = route?.params?.catalogueId;

  const cartState = useAppSelector((state: IAppState) => state.cartState);
  const loading = cartState.loading;

  // selected deals stored as array but we enforce single-per-section semantics
  const [selectedDeal, setSelectedDeal] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingClear, setLoadingClear] = useState<string | null>(null);
  const [selectedDealInfo, setSelectedDealInfo] = useState<any>({
    dealName: "",
    couponCode: "",
    descriptions: [],
  });

  const cartKey = `${integrationId}:${catalogueId}`;
  const currentCart = cartState.carts[cartKey];
  const dealItems: any[] = currentCart?.deals || [];

  // split coupons
  const storeCoupons = useMemo(() => dealItems.filter((d) => d.couponType === "store_coupon"), [dealItems]);
  const paymentCoupons = useMemo(() => dealItems.filter((d) => d.couponType === "payment_coupon"), [dealItems]);

  // map for quick lookups
  const dealById = useMemo(() => {
    const m: Record<string, any> = {};
    for (const d of dealItems) m[d.dealId] = d;
    return m;
  }, [dealItems]);

  const sectionDealsMap = useMemo(() => {
    return {
      store_coupon: storeCoupons,
      payment_coupon: paymentCoupons,
    } as Record<string, any[]>;
  }, [storeCoupons, paymentCoupons]);

  const hasAppliedStoreCoupon = useMemo(() => storeCoupons.some((c) => c.alreadyApplied), [storeCoupons]);
  const hasAppliedPaymentCoupon = useMemo(() => paymentCoupons.some((c) => c.alreadyApplied), [paymentCoupons]);

  const sectionAppliedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    map.store_coupon = hasAppliedStoreCoupon;
    map.payment_coupon = hasAppliedPaymentCoupon;
    return map;
  }, [hasAppliedStoreCoupon, hasAppliedPaymentCoupon]);


  const openDetails = useCallback((coupon: any) => {
    setSelectedDealInfo({
      dealName: coupon.dealName,
      couponCode: coupon.couponCode,
      descriptions: coupon.descriptions || [],
    });
    setDetailsOpen(true);
  }, []);

  const applySelected = useCallback(async () => {
    if (selectedDeal.length === 0) {
      return;
    }
    if (!integrationId || !catalogueId) {
      return;
    }

    try {
      setLoadingApply(true);
      const payload = {
        cartId: currentCart?.cartId,
        dealIds: selectedDeal,
        integrationId,
        catalogueId,
      };
      await applyDealAsyc(payload);
      await dispatch(fetchCart({ integrationId, catalogueId }));

    } catch (err) {
      console.error("applySelected error:", err);
      Alert.alert("Failed", "Could not apply selected coupon(s).");
    } finally {
      setLoadingApply(false);
    }
  }, [selectedDeal, integrationId, catalogueId, currentCart?.cartId, dispatch]);

  /**
   * clearDeal:
   * - If API already applied a coupon in this section -> call API to clear it
   * - Otherwise (only local selection present) -> clear locally without API
   */
  const clearDeal = useCallback(
    async (couponType: "store_coupon" | "payment_coupon") => {
      if (!integrationId || !catalogueId) return;

      const sectionDeals = sectionDealsMap[couponType] || [];
      const appliedDeal = sectionDeals.find((d) => d.alreadyApplied);

      // If an applied deal exists in backend -> call API to clear
      if (appliedDeal) {
        try {
          setLoadingClear(couponType);
          const payload = {
            cartId: currentCart?.cartId,
            couponType,
            integrationId,
            catalogueId,
          };
          await clearDealAsync(payload);
          await dispatch(fetchCart({ integrationId, catalogueId }));
          setSelectedDeal([]); // after API clear, remove local selection too
        } catch (err) {
          console.error("clearDeal API error:", err);
          Alert.alert("Failed", "Could not clear coupon from server.");
        } finally {
          setLoadingClear(null);
        }
        return;
      }

      // else clear local selection for this section only (no API call)
      setSelectedDeal((prev) => prev.filter((id) => {
        const d = dealById[id];
        return d?.couponType !== couponType;
      }));
    },
    [integrationId, catalogueId, currentCart?.cartId, dispatch, dealById, sectionDealsMap]
  );

  // selection handler: single-selection-per-section; allow replacing an alreadyApplied locally
  const onSelectDeal = useCallback((coupon: any) => {
    if (!coupon?.isEligible) return;

    const couponType = coupon.couponType;
    const sectionDeals = sectionDealsMap[couponType] || [];

    // find currently applied deal in section (from API)
    const appliedDeal = sectionDeals.find((d) => d.alreadyApplied);

    setSelectedDeal((prev) => {
      // remove any prior selection for this couponType
      const cleaned = prev.filter((id) => {
        const d = dealById[id];
        return d?.couponType !== couponType;
      });

      // if user clicked the currently selected (either local or applied), then toggle off
      const wasSelectedLocally = prev.includes(coupon.dealId);
      const isApplied = coupon.alreadyApplied;

      if (wasSelectedLocally || isApplied) {
        // user is deselecting -> return cleaned (also removes appliedDeal if we intentionally remove local representation)
        // Note: if appliedDeal existed and user tapped a different coupon, we still remove appliedDeal below and add new one
        return cleaned;
      }

      // If there was an applied deal from API, we remove it locally and add new one
      let result = cleaned;
      if (appliedDeal) {
        // ensure appliedDeal id removed (cleaned already covers local selections, but ensure appliedDeal removed too)
        result = result.filter(id => id !== appliedDeal.dealId);
      }

      return [...result, coupon.dealId];
    });
  }, [dealById, sectionDealsMap]);

  // small helper to compute if a coupon is selected (includes applied-if-no-local-selection)
  const isCouponSelected = useCallback((coupon: any) => {
    const couponType = coupon.couponType;
    const sectionHasLocalSelection = selectedDeal.some((id) => {
      const d = dealById[id];
      return d?.couponType === couponType;
    });

    if (sectionHasLocalSelection) {
      return selectedDeal.includes(coupon.dealId);
    }

    // fallback: if no local selection, show API-applied coupon as selected
    return !!sectionDealsMap[couponType]?.some((d) => d.dealId === coupon.dealId && d.alreadyApplied);
  }, [selectedDeal, dealById, sectionDealsMap]);

  // ------------- CouponRow component (kept inside to access memoized handlers) -------------
  const CouponRow = useCallback(({ coupon }: { coupon: any }) => {
    const disabled = !coupon.isEligible;
    const selected = isCouponSelected(coupon);

    return (
      <TouchableOpacity
        style={[styles.dealRow, disabled && styles.disabledRow]}
        // onPress={() => onSelectDeal(coupon)}
        onPress={() => openDetails(coupon)}
        disabled={disabled}
      >
        <View style={styles.dealIconContainer}>
          <Icon name="redeem" size={18} color={colors.backgroundColorHeader} />
        </View>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <View style={styles.dealHeader}
          >
            <Text
              // style={styles.dealName}
              style={[styles.dealName, { flexShrink: 1, flexGrow: 0 }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >{coupon.dealName}{" "}



            </Text>

            <View

            // onPress={() => openDetails(coupon)}

            >
              <Icon name="info-outline" size={16} color="#666" style={styles.infoIcon} />
            </View>
          </View>

          {parseFloat(coupon.calculatedDiscount || 0) > 0 && (
            <View style={{ marginTop: 2 }}>
              <Text style={styles.discountText}>
                Save ₹{parseFloat(coupon.calculatedDiscount).toFixed(2)}
                {coupon.couponCode ? " with this code:" : ""}
              </Text>

              {coupon.couponCode && (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{coupon.couponCode}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => onSelectDeal(coupon)}
          style={[
            styles.radioButton,
            { borderColor: disabled ? "#ccc" : colors.backgroundColorHeader }
          ]}>
          {selected && <View style={styles.radioButtonSelected} />}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [isCouponSelected, onSelectDeal, openDetails]);


  const SkeletonCard = useMemo(() => {
    return () => (
      <View style={styles.skeletonCard}>

        {/* Header Skeleton */}
        <View style={styles.skelHeaderRow}>
          <SkeletonPlaceholder width={140} height={20} radius={6} />
        </View>

        {/* Coupon Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.skelDealRow}>

            {/* Icon Circle */}
            <SkeletonPlaceholder width={26} height={26} radius={13} />

            {/* Text Block */}
            <View style={styles.skelTextBlock}>
              <SkeletonPlaceholder width="85%" height={14} radius={4} />
              <View style={{ height: 6 }} />
              <SkeletonPlaceholder width="65%" height={12} radius={4} />
            </View>

            {/* Checkbox / radio */}
            <SkeletonPlaceholder width={20} height={20} radius={10} />
          </View>
        ))}

      </View>
    );
  }, []);


  // ---------- Render ----------
  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-ios" size={18} color={"#222"} />
          </TouchableOpacity>

          {loading ? (
            <SkeletonPlaceholder width={120} height={20} radius={6} />
          ) : (
            <Text style={styles.headerTitle}>Coupons</Text>
          )}

          <View style={{ width: 20 }} />
        </View>

        {/* BODY */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {/* STORE COUPONS */}
              {storeCoupons.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Store Coupons</Text>

                    {(sectionAppliedMap.store_coupon || selectedDeal.some(id => (dealById[id]?.couponType === "store_coupon"))) && (
                      <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => clearDeal("store_coupon")}
                      >
                        {loadingClear === "store_coupon" ? (
                          <ActivityIndicator size="small" color="#666" />
                        ) : (
                          <Text style={styles.clearBtnText}>Clear</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  {storeCoupons.map((c) => (
                    <CouponRow key={c.dealId} coupon={c} />
                  ))}
                </View>
              )}

              {/* PAYMENT COUPONS */}
              {paymentCoupons.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Payment Coupons</Text>

                    {(sectionAppliedMap.payment_coupon || selectedDeal.some(id => (dealById[id]?.couponType === "payment_coupon"))) && (
                      <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => clearDeal("payment_coupon")}
                      >
                        {loadingClear === "payment_coupon" ? (
                          <ActivityIndicator size="small" color="#666" />
                        ) : (
                          <Text style={styles.clearBtnText}>Clear</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  {paymentCoupons.map((c) => (
                    <CouponRow key={c.dealId} coupon={c} />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* FOOTER */}
        {!loading && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={[
                styles.proceedBtn,
                {
                  backgroundColor: selectedDeal.length > 0 ? colors.backgroundColorHeader : "#ccc",
                },
              ]}
              disabled={selectedDeal.length === 0 || loadingApply}
              onPress={applySelected}
            >
              {loadingApply ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.proceedBtnText}>Apply Coupon</Text>
                  <Icon name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* details modal */}
      {detailsOpen && (
        <CouponDetailsModal
          visible={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          deal={{
            dealName: selectedDealInfo.dealName,
            couponCode: selectedDealInfo.couponCode,
            descriptions: selectedDealInfo.descriptions,
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 6,
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  card: {
    borderRadius: 12,
    backgroundColor: "#f7f8fa",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.titleBlackColor,
  },

  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f5",
    borderRadius: 18,
  },

  clearBtnText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 13,
  },

  dealRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  disabledRow: {
    opacity: 0.6,
  },

  dealIconContainer: {
    // width: 28,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 2
  },

  dealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 2,
  },

  dealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  infoIcon: {
    marginLeft: 4,
    marginTop: 2,
  },

  discountText: {
    color: '#1a73e8',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 1,
  },
  codeContainer: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#333',
  },


  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginRight: 4,
    marginTop: 1,
  },


  radioButtonSelected: {

    width: 10,
    height: 10,
    borderRadius: 4,
    backgroundColor: colors.backgroundColorHeader,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  proceedBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  proceedBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  skeletonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  skelHeaderRow: {
    marginBottom: 18,
  },

  skelDealRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },

  skelTextBlock: {
    flex: 1,
    marginLeft: 14,
  },

});

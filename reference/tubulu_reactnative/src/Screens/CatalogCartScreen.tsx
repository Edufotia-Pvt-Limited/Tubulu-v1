
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { fetchCart, updateCartQuantity } from "../Store/cart.store/cart.thunks";
import { IAppState } from "../Store/State";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../Utils/Colors";
import CartHeader from "../Components/CatalogueComponents/CartHeader";
import { createOrder, deleteCartItems, verifyPayment, applyDealAsyc, removeDealAsync } from "../Utils/ApiActions";
import RazorpayCheckout from "react-native-razorpay";
import { Address } from "../Store/UserAddressStore/address.state";
import { AddressAddModal } from "../Components/CatalogueComponents/AddAddressModal";
import BillSummaryModal from "../Components/CatalogueComponents/BillSummaryModal";
import { Deal } from "../models/Cart";
import CouponDetailsModal from "../Components/CatalogueComponents/CouponDetailsModal";
import AddNoteModal from "../Components/CatalogueComponents/AddNoteModal";
import FoodTypeIcon from "../Components/CatalogueComponents/FoodTypeIcon";
import DealRow from "../Components/CatalogueComponents/DealRow";

interface CartProps {
  navigation: any
  route: RouteProp<RootStackParamList, "CatalogCartScreen">;
}
type RootStackParamList = {
  CatalogCartScreen: {
    integrationId?: string;
    catalogId?: string;
    integrationName: string
    integrationItem : any
  };
};

interface CartScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CatalogCartScreen'>;
  route: RouteProp<RootStackParamList, 'CatalogCartScreen'>;
  onOpenAddressModal?: () => void;
}


const CouponsSection = ({ title, storeCoupons, paymentCoupons, onApply, onRemove, onNavigate }: any) => {


  return (
    <View style={styles.card}>
      {/* <Text style={styles.cardTitle}>{title}</Text> */}

      <View style={styles.cardRow}>
        <Icon name="celebration" size={20} color="#1E88E5" />
        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>
          Save extra by applying coupons on every order
        </Text>
      </View>
      {storeCoupons.map((c: any) => (
        <DealRow key={c.dealId?.toString() || c.dealId} deal={c} onApply={onApply} onRemove={onRemove} disabledApply={c.alreadyApplied} />
      ))}

      {paymentCoupons.map((c: any) => (
        <DealRow key={c.dealId?.toString() || c.dealId} deal={c} onApply={onApply} onRemove={onRemove} disabledApply={c.alreadyApplied} />
      ))}
      <TouchableOpacity style={styles.viewAllRow} onPress={() => onNavigate()}>

        <Text style={styles.viewAllText}>View all coupons</Text>
        <Icon name="arrow-forward-ios" size={12} color={colors.backgroundColorHeader} />
      </TouchableOpacity>
    </View>
  );
};


const CartScreenContent = ({ navigation, route }: CartProps) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showBill, setShowBill] = useState<boolean>(false)
  const [paymentloading, setPaymentLoading] = useState<boolean>(false);
  const [qtyLoading, setQtyLoading] = useState<{ [key: string]: boolean }>({});
  const [noteModal, setNoteModal] = useState<boolean>(false);
  const [orderNote, setOrderNote] = useState<string>("");
  const insets = useSafeAreaInsets();

  const integrationId = route?.params?.integrationId;
  const catalogueId = route?.params?.catalogId;
  const integrationName = route?.params?.integrationName || "Unknown";
  const dispatch = useAppDispatch();
  const cartState = useAppSelector((state: IAppState) => state.cartState);
  const  addresses  = useAppSelector((state) => state.userAddressState.addresses);
  const isAnyQuantityUpdating = useMemo(()=>Object.values(qtyLoading).some((val) => val === true), [qtyLoading]);


  useEffect(() => {
  if (!addresses.length) return;

  const defaultAddress =
    addresses.find((addr) => addr.isDefault) ?? null;

  setSelectedAddress(defaultAddress);
}, [addresses]);


  const cartKey = useMemo(
  () => `${integrationId}:${catalogueId}`,
  [integrationId, catalogueId]
);

const currentCart = useMemo(
  () => cartState.carts[cartKey],
  [cartState.carts, cartKey]
);

  const cartItems = currentCart?.cart || [];
  const dealItems = currentCart?.deals || [];
  const taxItem = currentCart?.taxes || {};
  const itemsTotal = currentCart?.itemsTotal ?? 0;
  const totalSaved = currentCart?.totalSaved ?? 0;
  const totalPrice = currentCart?.totalPrice || 0;
  const billPrice = Number(currentCart?.billPrice) || 0;
  const loading = cartState.loading;


  useEffect(() => {
  if (!integrationId || !catalogueId) return;

  dispatch(fetchCart({ integrationId, catalogueId }));
}, [integrationId, catalogueId, dispatch]);


  const onQuantityChange = async (productId: string, currentQty: number, isIncrease: boolean, isItemId: boolean) => {
    if (!integrationId || !catalogueId || !productId) return;
    try {
      setQtyLoading((prev) => ({ ...prev, [productId]: true }));
      await dispatch(
        updateCartQuantity({
          integrationId,
          catalogueId,
          productId,
          isIncrease,
          currentQty,
          isItemId
        })
      ).unwrap();
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setQtyLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const verifyPaymentHandler = async (
    paymentId: string,
    orderId: string,
    signature: string,
    totalAmount: number
  ) => {
    try {
      const verifyPaymentPayload = {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        integrationId,
      };
      const res = await verifyPayment(verifyPaymentPayload);
      // setPaymentLoading(false)

      console.log("Payment Verification Response-----------------:", res);
      // if (res.data) {
      //   navigation.navigate("OrderPlacedScreen", {
      //     orderId,
      //     totalAmount,
      //     estimatedDeliveryMinutes: 20,
      //   });
      // }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const handleRazorpay = (amount: number, currency: string, orderId: string, publicToken: string) => {
     console.log("inside handleRazorpay-----------------:", amount, currency, orderId);
    const options = {
      description: `Order #${orderId}`,
      currency,
      key: publicToken,
      amount,
      name: integrationName || "Tubulu Payment",
      order_id: orderId,
      prefill: {
        email: "void@razorpay.com",
        contact: "9191919191",
        name: "Razorpay Software",
      },
      theme: { color: colors.backgroundColorHeader },
      modal: {
        ondismiss: () => {
          console.log("Checkout form closed");
        },
      },
    };
    RazorpayCheckout.open(options)
      .then((data) => {
        setPaymentLoading(true);
        // if (integrationId && catalogueId) {
        //   dispatch(fetchCart({ integrationId, catalogueId }));
        // }
        console.log("Razorpay Payment pay amount: ", amount);

          navigation.replace("OrderPlacedScreen", {
          orderId,
          totalAmount: amount,
          estimatedDeliveryMinutes: 20,
          integrationItem: route?.params?.integrationItem,
        });
      
        console.log("Razorpay Payment Success===========: ", data);

        verifyPaymentHandler(data.razorpay_payment_id, data.razorpay_order_id, data.razorpay_signature, amount);

      })
      .catch((error) => {
        console.log("Razorpay Error: ", error);
        setPaymentLoading(false);
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  };

  const createAddress = async () => {
    if (!integrationId || !catalogueId || !selectedAddress) return;
    try {
      setPaymentLoading(true);
      const orderPayload = {
        integrationId,
        catalogueId,
        cartId: currentCart?.cartId || "",
        addressId: selectedAddress._id,
        orderMessage: orderNote,
      };
      const res = await createOrder(orderPayload);
      if (res.data) {
        console.log("Order Created-----------------:", res);
        handleRazorpay(res.data.razorpayOrder.amount, res.data.razorpayOrder.currency, res.data.razorpayOrder.id, res.data.publicToken);
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setPaymentLoading(false);
    }
  };

  const clearAllCart = async () => {
    if (!integrationId || !catalogueId) return;
    try {
      await deleteCartItems(integrationId, catalogueId, "all");
      dispatch(fetchCart({ integrationId, catalogueId }));
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  // ----- Apply / Remove deal handlers (replace applyDealApi/removeDealApi with your real API)
  const applyDeal = async (deal: Deal) => {
    if (!integrationId || !catalogueId) return;
    try {

      const dealsPayload = {
        cartId: currentCart?.cartId || "",
        dealIds: [deal.dealId],
        integrationId,
        catalogueId,
      }
      await applyDealAsyc(dealsPayload)
      await dispatch(fetchCart({ integrationId, catalogueId }));
    } catch (err) {
      console.error("Failed to apply deal:", err);
    }
  };

  const removeDeal = async (deal: Deal) => {
    if (!integrationId || !catalogueId) return;
    try {
      // TODO: call your remove/unapply deal API endpoint
      const dealsPayload = {
        cartId: currentCart?.cartId,
        dealId: deal.dealId,
        integrationId,
        catalogueId,
      }
      await removeDealAsync(dealsPayload)

      // await removeDealApi({ integrationId, catalogueId, dealId: deal.dealId });
      await dispatch(fetchCart({ integrationId, catalogueId }));
    } catch (err) {
      console.error("Failed to remove deal:", err);
    }
  };


  // Front-page default deal rules (per your spec)
  const defaultDeals = (Array.isArray(dealItems) ? dealItems : []).filter((d: any) => d.isDefault && d.isEligible);
  const showDefaultDeal = defaultDeals.length > 0;

  // split coupons by type (store_coupon / payment_coupon)
  const x = (dealItems || []).filter((d: any) => d.couponType === "store_coupon" && d.isDefault);
  const paymentCoupons = (dealItems || []).filter((d: any) => d.couponType === "payment_coupon" && d.isDefault);

  const skeletonData = Array(5).fill(null);


  const couponsPageNavigation = () => {
    navigation.navigate("CouponsScreen", {
      dealItems: dealItems,
      integrationId,
      catalogueId,
    })

  }

  const onUseCurrentLocation = () => {
  };

  const onViewAllAddresses = () => {
  };



  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom + 80 }]}>
      <CartHeader navigation={navigation} integrationName={integrationName} />
      <View style={styles.container}>
        {Number(totalSaved) > 0 && (
          <View style={styles.card}>
            <Text style={styles.saveExtraLabel}>🎉 You saved ₹{totalSaved} on this order!</Text>
          </View>
        )}
        {loading ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Skeleton for Address */}
            <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#ececec', marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <View style={{ width: 60, height: 10, backgroundColor: '#ececec', borderRadius: 5, marginBottom: 4 }} />
                <View style={{ width: '80%', height: 16, backgroundColor: '#ececec', borderRadius: 6 }} />
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#ececec', marginLeft: 4 }} />
            </View>
            {/* Skeleton for Total Bill */}
            <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }]}>
              <View style={{ width: 80, height: 16, backgroundColor: '#ececec', borderRadius: 6 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 60, height: 18, backgroundColor: '#ececec', borderRadius: 6, marginRight: 4 }} />
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#ececec' }} />
              </View>
            </View>
            {/* Skeleton for Cart Items */}
            <View style={styles.card}>
              {[...Array(3)].map((_, idx) => (

                <View key={idx} style={styles.cartItemRow}>

                  {/* NAME COLUMN SKELETON */}
                  <View style={styles.skelNameColumn}>
                    <View style={styles.skelNameLine1} />
                    <View style={styles.skelNameLine2} />
                  </View>

                  {/* QUANTITY BOX SKELETON */}
                  <View style={styles.skelQuantityBox}>
                    <View style={styles.skelQtyBtn} />
                    <View style={styles.skelQtyText} />
                    <View style={styles.skelQtyBtn} />
                  </View>

                  {/* PRICE SKELETON */}
                  <View style={styles.skelPriceColumn}>
                    <View style={styles.skelPriceLine} />
                  </View>

                </View>

              ))}
            </View>
            {/* Skeleton for Coupons */}
            {[...Array(2)].map((_, idx) => (
              <View key={idx} style={styles.card}>
                <View style={{ width: '60%', height: 14, backgroundColor: '#ececec', borderRadius: 6, marginBottom: 8 }} />
                <View style={{ width: '90%', height: 10, backgroundColor: '#ececec', borderRadius: 6 }} />
              </View>
            ))}
          </ScrollView>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="remove-shopping-cart" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              Your cart is empty. Add something from the catalog!
            </Text>
          </View>
        ) : (
          // Entire content scrollable with separate cards
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >

            {/* CART ITEMS CARD */}
            <View style={styles.card}>

              {cartItems.map((item: any) => (

                <View key={item._id} style={styles.cartItemRow}>


                  {/* NAME COLUMN */}
                  <View style={{ width: "52%", flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>

                    {item.product.foodType !== "Other" && <FoodTypeIcon  style={{ marginTop: 3 }} type={item.product.foodType} />}
                    <View style={styles.itemNameColumn}>
                      <Text
                        style={styles.itemName}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {item.product.name}
                      </Text>

                      {Array.isArray(item.choiceNames) && item.choiceNames.length > 0 && (
                        <Text style={styles.choicesText}>
                          {item.choiceNames.join(", ")}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'column', alignItems: 'flex-end', width: "25%" }}>
                    <View style={styles.quantityBox}>
                      <TouchableOpacity
                        style={[styles.quantityButton, qtyLoading[item._id] && { opacity: 0.4 }]}
                        onPress={() => onQuantityChange(item._id, item.quantity, false, true)}
                        disabled={qtyLoading[item._id]}
                      >
                        <Icon name="remove" size={18} color={"#1E88E5"} />
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={[styles.quantityButton, qtyLoading[item._id] && { opacity: 0.4 }]}
                        onPress={() => onQuantityChange(item._id, item.quantity, true, true)}
                        disabled={qtyLoading[item._id]}
                      >
                        <Icon name="add" size={18} color={"#1E88E5"} />
                      </TouchableOpacity>
                    </View>


                    <View style={styles.priceColumn}>
                      {item.price > item.total && (
                        <Text style={styles.strikePrice}>₹{item.price}</Text>
                      )}
                      <Text style={styles.itemPrice}>₹{item.total}</Text>
                    </View>

                  </View>

                </View>

              ))}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                <TouchableOpacity
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                  onPress={clearAllCart}
                >
                  <Text style={{ fontSize: 14, color: "#1E88E5", fontWeight: "600" }}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>


              <TouchableOpacity style={styles.addItemRow} onPress={() => navigation.goBack()}>
                <Icon name="add-circle" size={20} color="#1E88E5" />
                <Text style={styles.addItemText}>Add  more items</Text>
              </TouchableOpacity>


              <TouchableOpacity style={styles.addNoteBox} onPress={() => setNoteModal(true)}>
                <Icon name="description" size={18} color="#548dc5ff" />
                <Text style={styles.addNoteText}>Add a note for the restaurant</Text>
              </TouchableOpacity>


            </View>


            {/* Store Coupons */}
            {dealItems.length > 0 &&
              <CouponsSection title="Store Coupons" storeCoupons={x} paymentCoupons={paymentCoupons} onApply={applyDeal} onRemove={removeDeal} onNavigate={couponsPageNavigation} />}


            {/* Delivery at section */}
            <TouchableOpacity 
              style={styles.deliveryCard} 
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.deliveryIconContainer}>
                <Icon name="location-on" size={20} color={colors.backgroundColorHeader} />
              </View>
              <View style={styles.deliveryContent}>
                <Text style={styles.deliveryLabel}>Delivery at</Text>
                {selectedAddress ? (
                  <View style={styles.addressContainer}>
                    <View style={styles.addressBadge}>
                      <Text style={styles.addressBadgeText}>{selectedAddress.addressLabel}</Text>
                    </View>
                    <Text style={[styles.addressText, { marginLeft: 6 }]} numberOfLines={2} ellipsizeMode="tail">
                      {selectedAddress.addressLine1}, {selectedAddress.city}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.selectAddressText}>Select address</Text>
                )}
              </View>
              <View style={styles.deliveryArrowContainer}>
                <Icon name="keyboard-arrow-right" size={24} color="#888" />
              </View>
            </TouchableOpacity>

            {/* Bill Summary: only total */}
            <TouchableOpacity 
              style={styles.billCard} 
              onPress={() => setShowBill(true)}
              activeOpacity={0.7}
            >
              <View style={styles.billLeftSection}>
                <View style={styles.billIconContainer}>
                  <Icon name="receipt" size={20} color={colors.backgroundColorHeader} />
                </View>
                <View style={styles.billTextContainer}>
                  <Text style={styles.billLabel}>Total Bill</Text>
                  {Number(totalSaved) > 0 && (
                    <Text style={styles.billSavingsText}>You saved ₹{totalSaved}</Text>
                  )}
                </View>
              </View>
              <View style={styles.billRightSection}>
                {(paymentloading || isAnyQuantityUpdating) ? (
                  <View style={styles.skeletonPrice} />
                ) : (
                  <View style={styles.billPriceContainer}>
                    <Text style={styles.billPrice}>₹{totalPrice}</Text>
                    {Number(billPrice) > Number(totalPrice) && (
                      <Text style={styles.billOriginalPrice}>₹{billPrice}</Text>
                    )}
                  </View>
                )}
                <View style={styles.billArrowContainer}>
                  <Icon name="keyboard-arrow-right" size={24} color="#888" />
                </View>
              </View>
            </TouchableOpacity>

          </ScrollView>
        )}
      </View>


      {loading && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.footerContent}>

            {/* LEFT SKELETON (Pay Section Placeholder) */}
            <View style={[styles.paySection, { opacity: 0.4 }]}>
              <View
                style={{
                  width: 120,
                  height: 16,
                  backgroundColor: '#e5e5e5',
                  borderRadius: 6,
                  marginBottom: 10,
                }}
              />
              <View
                style={{
                  width: 80,
                  height: 14,
                  backgroundColor: '#e5e5e5',
                  borderRadius: 6,
                }}
              />
            </View>

            {/* RIGHT SKELETON (Button Placeholder) */}
            <View
              style={{
                width: 160,
                height: 52,
                backgroundColor: '#e5e5e5',
                borderRadius: 12,
                marginLeft: 8,
              }}
            />
          </View>
        </View>
      )}


      {!loading && cartItems.length > 0 && (
        selectedAddress ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
            <View style={styles.footerContent}>
              <View style={styles.paySection}>
                <View style={styles.payUsingRow}>
                  <Icon name="payments" size={14} color="#444" style={styles.payIcon} />
                  <Text style={styles.payUsingLabel}>Pay using</Text>
                  <Icon name="keyboard-arrow-down" size={16} color="#888" style={styles.payUsingIcon} />
                </View>
                <View style={styles.paySelectStatic}>
                  <Text style={styles.payStaticText} numberOfLines={1} ellipsizeMode="tail">UPI/Card</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.proceedBtn}
                activeOpacity={0.85}
                onPress={createAddress}
                disabled={paymentloading || isAnyQuantityUpdating}
              >
                <View style={styles.buttonContentContainer}>
                  {(paymentloading || isAnyQuantityUpdating) && (
                    <View style={styles.loaderOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                  <View style={[
                    styles.buttonContent,
                    (paymentloading || isAnyQuantityUpdating) && styles.buttonContentHidden
                  ]}>
                    <Text style={styles.proceedBtnPrimary}>Place Order</Text>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText} numberOfLines={1} ellipsizeMode="tail">
                        ₹{totalPrice}
                      </Text>
                    </View>
                    <Icon name="arrow-forward" size={16} color="#fff" style={styles.proceedBtnIcon} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setModalVisible(true)}
            style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 8, backgroundColor: '#fffbe8', borderTopColor: '#ffe066', borderTopWidth: 2 }]}
          >
            <Text style={{ color: '#b8860b', fontWeight: '700', fontSize: 15, textAlign: 'center', flex: 1 }} numberOfLines={2}>
              Please select a delivery address to place your order
            </Text>
          </TouchableOpacity>
        )
      )}


      {modalVisible &&

        (<AddressAddModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onUseCurrentLocation={onUseCurrentLocation}
          onViewAllAddresses={onViewAllAddresses}
        />
        )
      }


      {showBill &&
        (<BillSummaryModal
          visible={showBill}
          onClose={() => setShowBill(false)}
          itemsTotal={itemsTotal}
          cgst={taxItem?.cgst}
          sgst={taxItem?.sgst}
          otherTaxes={taxItem?.otherTaxes}
          totalPrice={currentCart?.totalPrice ?? 0}
          billPrice={currentCart?.billPrice ?? 0}
          totalSavings={currentCart?.totalSaved ?? 0}
        />

        )
      }

      {noteModal &&
        <AddNoteModal
          visible={noteModal}
          initialNote={orderNote}
          onClose={() => setNoteModal(false)}
          onSave={(val) => setOrderNote(val)}
        />

      }

    </SafeAreaView>
  );
};

const CartScreen = (props: CartScreenProps) => {
  return (
    <SafeAreaProvider>
      <CartScreenContent navigation={props.navigation} route={props.route} />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundWhite },
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    flex: 1,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#f7f8fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.titleBlackColor,
    marginBottom: 8,
    marginLeft: 8,
    flexShrink: 1,
    flex: 1,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 12,
    marginBottom: 16,
  },

  saveExtraLabel: {
    alignSelf: 'flex-start',
    backgroundColor: '#f2f6ff',
    color: colors.backgroundColorHeader,
    fontWeight: '700',
    fontSize: 13,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },

  // deal row

  dealLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  fixedWidthBtn: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  viewAllRow: {
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    // color: colors.backgroundColorHeader,
    color: "#1E88E5",
    fontWeight: "700",
    marginRight: 6,
    fontSize: 13,
  },


  // ROW WRAPPER
  cartItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    // padding: 12,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 8,
    marginBottom: 6,
  },

  foodTypeIconWrapper: {
    width: 20,
    marginRight: 6,
    marginTop: 3,
  },


  // ------------ FIXED WIDTH COLUMNS ------------ //
  itemNameColumn: {
    paddingRight: 8,

  },

  quantityBox: {
    // width: "24%",
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "flexs-end",
    alignItems: "center",
    backgroundColor: "#E7F3FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E88E5",
    paddingVertical: 2,
    paddingHorizontal: 8,
  },

  priceColumn: {
    // width: "22%",     
    alignItems: "flex-end",
    marginTop: 4,
    flexDirection: "row",
    gap: 1
  },

  strikePrice: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 2,
  },

  addItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12
  },

  addItemText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E88E5"
  },

  addNoteBox: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
    marginLeft: 12,
    marginBottom: 10,
    width: "85%",

  },

  addNoteText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },

  // ------------ TEXTS ------------ //
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 20,
  },

  choicesText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },


  itemPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },

  // ------------ QUANTITY BUTTON & TEXT ------------ //

  quantityButton: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  quantityText: {
    minWidth: 15,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "black",
  },

  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    fontFamily: "Roboto",
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  paySection: {
    flexShrink: 1,
    flexGrow: 0,
    width: '38%',
    minWidth: 0,
    paddingRight: 4,
  },
  footerPriceBox: {
    flex: 1,
  },
  footerPriceTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.backgroundColorHeader,
  },

  proceedBtn: {
    backgroundColor: colors.backgroundColorHeader,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    flexGrow: 0,
    width: '60%',
    minWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.backgroundColorHeader,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    flexShrink: 1,
    minWidth: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    flexShrink: 1,
    minWidth: 0,
    width: '100%',
    paddingHorizontal: 2,
  },
  buttonContentHidden: {
    opacity: 0,
  },
  loaderOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  proceedInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  proceedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  proceedBtnIcon: {
    color: '#fff',
    fontSize: 16,
    flexShrink: 0,
    marginLeft: 2,
    width: 18,
    height: 18,
  },

  payUsingLabel: {
    color: '#666',
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 2,
    flexShrink: 0,
    fontWeight: '700',
  },

  payUsingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    flexWrap: 'nowrap',
    marginBottom: 2,
  },

  payIcon: {
    marginRight: 3,
    flexShrink: 0,
  },

  proceedBtnPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
    flexShrink: 0,
  },

  priceBadge: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginLeft: 4,
    marginRight: 3,
    flexShrink: 0,
    minWidth: 0,
  },

  payToggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  payToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  payToggleBtnActive: {
    borderColor: colors.backgroundColorHeader,
    backgroundColor: '#eef4ff',
  },
  paySelectStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 1,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  payStaticText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 11,
    flexShrink: 1,
    minWidth: 0,
  },
  payUsingIcon: {
    marginLeft: 3,
    flexShrink: 0,
  },
  payToggleText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 12,
  },
  payToggleTextActive: {
    color: colors.backgroundColorHeader,
  },
  priceBadgeText: {
    color: colors.backgroundColorHeader,
    fontWeight: '700',
    fontSize: 12,
    flexShrink: 0,
  },

  skelNameColumn: {
    width: "52%",
    paddingRight: 8,
  },

  skelQuantityBox: {
    width: "28%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  skelPriceColumn: {
    width: "20%",
    alignItems: "flex-end",
  },

  skelNameLine1: {
    width: "80%",
    height: 16,
    backgroundColor: "#ececec",
    borderRadius: 6,
    marginBottom: 6,
  },
  skelNameLine2: {
    width: "60%",
    height: 14,
    backgroundColor: "#ececec",
    borderRadius: 6,
  },

  skelQtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#ececec",
  },

  skelQtyText: {
    width: 28,
    height: 16,
    backgroundColor: "#ececec",
    borderRadius: 6,
  },

  skelPriceLine: {
    width: 40,
    height: 14,
    backgroundColor: "#ececec",
    borderRadius: 6,
  },

  skeletonPrice: {
    width: 60,
    height: 17,
    backgroundColor: "#ececec",
    borderRadius: 6,
    marginRight: 4,
  },

  // Enhanced Delivery Card Styles
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e9eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  deliveryLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addressBadge: {
    backgroundColor: colors.backgroundColorHeader,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 4,
  },
  addressBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addressText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  selectAddressText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
    fontStyle: 'italic',
  },
  deliveryArrowContainer: {
    marginLeft: 8,
    justifyContent: 'center',
  },

  // Enhanced Bill Card Styles
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.backgroundColorHeader,
    ...Platform.select({
      ios: {
        shadowColor: colors.backgroundColorHeader,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  billLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billTextContainer: {
    flex: 1,
  },
  billLabel: {
    fontWeight: '700',
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  billSavingsText: {
    fontSize: 11,
    color: '#0CB175',
    fontWeight: '600',
    marginTop: 2,
  },
  billRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  billPriceContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  billPrice: {
    fontWeight: '700',
    fontSize: 20,
    color: colors.backgroundColorHeader,
    lineHeight: 24,
  },
  billOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  billArrowContainer: {
    justifyContent: 'center',
  },

});

export default CartScreen;



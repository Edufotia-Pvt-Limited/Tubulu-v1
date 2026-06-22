
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Easing,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../Utils/Colors";
import { useAppDispatch } from "../../Store/hooks";
import { getProductCustomization } from "../../Utils/ApiActions";
import { addToCart } from "../../Store/cart.store/cart.thunks";
import FoodTypeIcon from "./FoodTypeIcon";

type FoodType = "Veg" | "Non Veg" | "Egg" | "Other";

type Choice = {
  choiceId: string;
  name: string;
  priceAdjustment: number;
  isDefault?: boolean;
  foodType?: FoodType;
};

type Option = {
  optionId: string;
  name: string;
  required?: boolean;
  type: "radio" | "checkbox";
  priceType: "base" | "adjustment";
  choices: Choice[];
};

type Customization = {
  customizationId?: string;
  options?: Option[];
  discount?: {
    percent?: number;
    amount?: number;
  };
};

const SkeletonBox = ({ width, height, borderRadius = 6, style }: any) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-(width || 200), width || 200],
  });

  return (
    <View style={[{ width, height, borderRadius, backgroundColor: "#e0e0e0", overflow: "hidden" }, style]}>
      <Animated.View
        style={{
          width: "40%",
          height: "100%",
          backgroundColor: "#f5f5f5",
          opacity: 0.8,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

interface Props {
  visible: boolean;
  onClose: () => void;
  item: {
    name: string;
    description?: string;
    price: number | string;
    imageUri?: string;
    productId: string;
    integrationId: string;
    catalogueId: string;
    isCustomized?: boolean;
    discountPercentage?: number;
  };
  itemQuantity: number;
  onAdded?: () => void;
}

const ProductViewModal = ({ visible, onClose, item, itemQuantity }: Props) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [customization, setCustomization] = useState<Customization | null>(null);
  const [loadingCustomization, setLoadingCustomization] = useState<boolean>(false);
  const [note, setNote] = useState<string>("")
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  // selectedOptions: stable plain object mapping optionId -> string[] of choiceIds
  const [selectedOptions, setSelectedOptions] = useState<{ [k: string]: string[] }>({});
  const [localQuantity, setLocalQuantity] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(Number(item.price || 0));
  const [originalPrice, setOriginalPrice] = useState<number>(Number(item.price || 0));
  const isMounted = useRef(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const inputContainerRef = useRef<View>(null);



  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* -----------------------
     Fetch customization & prepare defaults
  ------------------------*/
  const fetchCustomization = useCallback(async () => {
    if (!item.integrationId || !item.catalogueId || !item.productId) return;
    setLoadingCustomization(true);
    try {
      const res = await getProductCustomization(item.integrationId, item.catalogueId, item.productId);
      const dataCustomization = res?.data?.customization ?? null;
      if (!isMounted.current) return;
      setCustomization(dataCustomization);

      // build initial selectedOptions from defaults
      const initial: { [k: string]: string[] } = {};
      (dataCustomization?.options || []).forEach((opt: Option) => {
        let defaults = (opt.choices || []).filter(c => c.isDefault).map(c => c.choiceId);
        // Auto-select first choice for required radio options when no default exists
        if (opt.required && opt.type === "radio" && defaults.length === 0) {
          if (opt.choices.length > 0) {
            defaults = [opt.choices[0].choiceId];
          }
        }

        if (defaults.length) initial[opt.optionId] = defaults;
      });
      setSelectedOptions(initial);
    } catch (err) {
      console.error("fetchCustomization error", err);
    } finally {
      if (isMounted.current) setLoadingCustomization(false);
    }
  }, [item.integrationId, item.catalogueId, item.productId]);

  useEffect(() => {
    if (!visible) return;
    fetchCustomization();
    // reset quantity when opened
    // setLocalQuantity(Math.max(1, itemQuantity || 1));
    setLocalQuantity(1);
  }, [visible, fetchCustomization, itemQuantity]);

  // Handle keyboard show/hide to scroll input into view
  useEffect(() => {
    if (!visible || item.isCustomized) return;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        // Set keyboard height and scroll to input
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, Platform.OS === "ios" ? 100 : 300);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [visible, item.isCustomized]);

  /* -----------------------
     Price calc per your rules (memoized)
     - If any base option exists: base sum = SUM(default base choice prices)
       total = (base sum + sum(default adjustment prices)) * qty
     - Else: base = item.price; add default adjustment sums
     - Then apply discount if present: percent or fixed amount
  ------------------------*/


  const computePriceForSelections = useCallback(
    (
      selections: { [k: string]: string[] },
      qty: number,
      customizationData: Customization | null
    ) => {
      const basePrice = Number(item.price || 0);

      // No customization at all
      if (!customizationData?.options?.length) {
        let priceTotal = basePrice * qty;
        let finalPrice = item.discountPercentage
          ? priceTotal * (1 - item.discountPercentage / 100)
          : priceTotal;

        return {
          priceTotal: Number(priceTotal.toFixed(2)),
          finalPrice: Number(finalPrice.toFixed(2)),
        };
      }

      const baseOptions = customizationData.options.filter(
        o => o.priceType === "base"
      );

      const adjustmentOptions = customizationData.options.filter(
        o => o.priceType === "adjustment"
      );

      let baseSum = 0;
      let adjustmentSum = 0;

      /** -------- BASE OPTIONS -------- */
      baseOptions.forEach(opt => {
        const selected =
          selections[opt.optionId] ??
          opt.choices.filter(c => c.isDefault).map(c => c.choiceId);

        selected.forEach(id => {
          const ch = opt.choices.find(c => c.choiceId === id);
          if (ch) baseSum += Number(ch.priceAdjustment || 0);
        });
      });

      /** -------- ADJUSTMENT OPTIONS -------- */
      adjustmentOptions.forEach(opt => {
        const selected =
          selections[opt.optionId] ??
          opt.choices.filter(c => c.isDefault).map(c => c.choiceId);

        selected.forEach(id => {
          const ch = opt.choices.find(c => c.choiceId === id);
          if (ch) adjustmentSum += Number(ch.priceAdjustment || 0);
        });
      });

      /** -------- PRICE CALCULATION -------- */
      let priceTotal = 0;

      if (baseOptions.length > 0) {
        // Base option replaces product price
        priceTotal = (baseSum + adjustmentSum) * qty;
      } else {
        // Product price + default adjustment prices
        priceTotal = (basePrice + adjustmentSum) * qty;
      }

      let finalPrice = item.discountPercentage
        ? priceTotal * (1 - item.discountPercentage / 100)
        : priceTotal;

      return {
        priceTotal: Number(priceTotal.toFixed(2)),
        finalPrice: Number(finalPrice.toFixed(2)),
      };
    },
    [item.price, item.discountPercentage]
  );



  // recalc total whenever selections, qty or customization change
  useEffect(() => {
    const { finalPrice, priceTotal } = computePriceForSelections(selectedOptions, localQuantity, customization);
    setOriginalPrice(priceTotal)
    setTotalPrice(finalPrice);
    setOriginalPrice(priceTotal);

  }, [selectedOptions, localQuantity, customization, computePriceForSelections]);

  /* -----------------------
     Helpers: check required satisfied
  ------------------------*/
  const isOptionSatisfied = useCallback((opt: Option) => {
    const sel = selectedOptions[opt.optionId] || [];
    if (opt.required) {
      if (opt.type === "radio") return sel.length >= 1;
      if (opt.type === "checkbox") return sel.length >= 1;
    }
    // if not required, always satisfied
    return true;
  }, [selectedOptions]);

  const allRequiredSatisfied = useMemo(() => {
    if (!customization?.options) return true;
    return customization.options.every(opt => isOptionSatisfied(opt));
  }, [customization, isOptionSatisfied]);

  /* -----------------------
     Handlers: select/deselect, clear
     - useCallback for stable refs
     - For required radios we prevent deselect (can't become empty)
  ------------------------*/
  const handleOptionSelect = useCallback((optionId: string, choiceId: string, type: string) => {
    setSelectedOptions(prev => {
      const current = prev[optionId] || [];
      let updated: string[] = [];

      // find option meta to know if required
      const opt = customization?.options?.find(o => o.optionId === optionId);

      if (type === "radio") {
        // radio -> single selection
        const alreadySelected = current.includes(choiceId);

        // If option is required, do not allow deselecting the current selection (must have one)
        if (opt?.required) {
          // if already selected, keep it (no change), else set to the newly selected
          updated = alreadySelected ? current : [choiceId];
        } else {
          // non-required radio -> allow toggle/deselect
          updated = alreadySelected ? [] : [choiceId];
        }
      } else {
        // checkbox -> toggle membership
        updated = current.includes(choiceId) ? current.filter(c => c !== choiceId) : [...current, choiceId];
      }

      return { ...prev, [optionId]: updated };
    });
  }, [customization]);

  const handleClearOption = useCallback((optionId: string) => {
    // Clear locally only; if API needs call, caller does it from outside
    setSelectedOptions(prev => {
      if (!prev[optionId] || prev[optionId].length === 0) return prev;
      const copy = { ...prev };
      copy[optionId] = [];
      return copy;
    });
  }, []);

  const handleLocalIncrease = useCallback(() => {
    setLocalQuantity(prev => Math.max(1, prev + 1));
  }, []);


  const handleLocalDecrease = useCallback(() => {
    setLocalQuantity(prev => Math.max(1, prev - 1));
  }, []);

  /* -----------------------
     Add to cart (uses selectedOptions + customizationId if any)
     - disable button if required not satisfied
  ------------------------*/
  const handleAddToCart = useCallback(async () => {
    if (!allRequiredSatisfied) return;
    const selectedOptionsArray = Object.entries(selectedOptions).map(([optionId, selectedChoices]) => ({
      optionId,
      selectedChoices,
    }));
    const cartPayload = {
      integrationId: item.integrationId,
      catalogueId: item.catalogueId,
      productId: item.productId,
      customizationId: customization?.customizationId || undefined,
      quantity: localQuantity,
      selectedOptions: selectedOptionsArray,
      specialRequest: note
    };

    console.log("Add to cart payload:", cartPayload);

    try {
      await dispatch(addToCart(cartPayload)).unwrap();
      // onAdded && onAdded();
      setLocalQuantity(0)
      onClose && onClose();
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  }, [allRequiredSatisfied, selectedOptions, customization, note, localQuantity, dispatch, item.integrationId, item.catalogueId, item.productId, onClose]);

  /* -----------------------
     Utility: render option helper text per your rules
  ------------------------*/
  const renderOptionHelpText = useCallback((opt: Option) => {
    if (opt.required && opt.type === "radio") return "Required - Select any 1 option.";
    if (opt.required && opt.type === "checkbox") return "Required - Select any 1 or more options.";
    if (!opt.required && opt.type === "checkbox") return `Select up to ${opt.choices.length} options.`;
    if (!opt.required && opt.type === "radio") return "Select up to 1 option.";
    return "";
  }, []);

  /* -----------------------
     Memoized option list UI to avoid re-renders
  ------------------------*/
  const OptionList = useMemo(() => {
    if (!customization?.options) return null;
    return customization.options.map((opt: Option) => {
      const selectedIds = selectedOptions[opt.optionId] || [];
      const showClear = !opt.required;
      return (
        <View key={opt.optionId} style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View>
              <Text style={styles.optionTitle}>{opt.name}</Text>
              <Text style={styles.optionSubTitle}>{renderOptionHelpText(opt)}</Text>
            </View>
            {showClear && (
              <TouchableOpacity onPress={() => handleClearOption(opt.optionId)} style={styles.clearOptionBtn}>
                <Text style={styles.clearOptionText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {(opt.choices || []).map((choice) => {
            const isSelected = selectedIds.includes(choice.choiceId);
            return (
              <TouchableOpacity
                key={choice.choiceId}
                activeOpacity={0.8}
                style={[styles.choiceRow, isSelected && styles.choiceRowSelected]}
                onPress={() => handleOptionSelect(opt.optionId, choice.choiceId, opt.type)}
              >
                <View style={styles.choiceLeft}>
                  {/* Food type icon if present */}
                  {choice.foodType !== "Other" && <FoodTypeIcon type={choice.foodType as FoodType} />}
                  {/* {product.foodType !== "Other" && <FoodTypeIcon type={product.foodType} />} */}
                  <Text style={[styles.choiceText, isSelected && { color: colors.backgroundColorHeader }]}>
                    {choice.name}
                  </Text>
                </View>

                <View style={styles.choiceRight}>
                  {choice.priceAdjustment > 0 && (
                    <Text style={styles.choicePrice}>
                      {opt.priceType === "adjustment" ? "+" : ""} ₹{choice.priceAdjustment}
                    </Text>
                  )}

                  {opt.type === "radio" ? (
                    <View style={[styles.radioOuter, isSelected && { borderColor: colors.backgroundColorHeader }]}>
                      {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.backgroundColorHeader }]} />}
                    </View>
                  ) : (
                    <View style={[styles.checkbox, isSelected && { backgroundColor: colors.backgroundColorHeader, borderColor: colors.backgroundColorHeader }]}>
                      {isSelected && <Icon name="check" size={14} color="#fff" />}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    });
  }, [customization, selectedOptions, handleOptionSelect, handleClearOption, renderOptionHelpText]);


  // Compute a comfortable bottom padding for scroll content so the last option isn't clipped
  const scrollBottomPadding = 160 + insets.bottom; // 160 is a safe footer height + margin


  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.6}
      deviceHeight={Dimensions.get("screen").height}
      deviceWidth={Dimensions.get("screen").width}
      coverScreen
      statusBarTranslucent
      useNativeDriver
      propagateSwipe
      hideModalContentWhileAnimating
    >
      <View style={[styles.container, { maxHeight: Dimensions.get("window").height * 0.9 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={26} color={colors.titleBlackColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={{ 
            paddingBottom: scrollBottomPadding + (keyboardHeight > 0 ? keyboardHeight + 50 : 0)
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" /> : null}
          {item.description ? (
            <Text style={styles.description} numberOfLines={4} ellipsizeMode="tail">
              {item.description}
            </Text>
          ) : null}


          {/* Content */}
          {!item.isCustomized &&
            <View style={styles.content}>


              <Text style={styles.caption}>
                Add a cooking request (optional)
              </Text>

              {/* Textarea Input */}
              <View ref={inputContainerRef} style={styles.textAreaContainer}>
                <TextInput
                  ref={textInputRef}
                  value={note}
                  onChangeText={setNote}
                  placeholder="e.g. Don't make it too spicy"
                  placeholderTextColor="#999"
                  multiline
                  style={styles.textArea}
                  maxLength={100}
                />
              </View>

            </View>
          }

          {loadingCustomization && item.isCustomized ? (
            <View style={styles.skeletonContainer}>
              {[...Array(2)].map((_, i) => (
                <View key={i} style={styles.skeletonOption}>
                  <SkeletonBox width={200} height={16} style={{ marginBottom: 8 }} />
                  <SkeletonBox width={120} height={12} style={{ marginBottom: 12 }} />
                  {[...Array(3)].map((__, j) => (
                    <View key={j} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <SkeletonBox width={16} height={16} borderRadius={8} style={{ marginRight: 10 }} />
                      <SkeletonBox width={180} height={14} />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.customizationContainer}>{OptionList}</View>
          )}
        </ScrollView>

        {/* Footer — fixed, uses safe area inset to avoid clipping */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          {loadingCustomization ? (
            <View style={styles.footerSkeleton}>
              <SkeletonBox width={90} height={40} borderRadius={8} />
              <SkeletonBox width={160} height={44} borderRadius={8} />
            </View>
          ) : (
            <>
              <View style={styles.qtyContainer}>
                <TouchableOpacity onPress={handleLocalDecrease} style={styles.qtyButton}>
                  <Text style={styles.qtySymbol}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{localQuantity}</Text>
                <TouchableOpacity onPress={handleLocalIncrease} style={styles.qtyButton}>
                  <Text style={styles.qtySymbol}>+</Text>
                </TouchableOpacity>
              </View>



              <TouchableOpacity
                style={[styles.addButton, !allRequiredSatisfied && { opacity: 0.5 }]}
                onPress={handleAddToCart}
                disabled={!allRequiredSatisfied}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>

                  <Text style={styles.addButtonText}>
                    Add Item | ₹{totalPrice}
                  </Text>


                  {!!item?.discountPercentage && (
                    <Text style={styles.actualPriceText}>
                      ₹{originalPrice}
                    </Text>
                  )}

                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ReactNativeModal>
  );
};

export default ProductViewModal;

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  container: {
    backgroundColor: "#f6f6f9ff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.titleBlackColor, flex: 1 },
  scrollContainer: { paddingHorizontal: 18 },
  image: { width: "100%", height: 180, borderRadius: 12, marginTop: 10, marginBottom: 14 },
  description: { fontSize: 15, color: colors.merchantScreenTitleColor, marginBottom: 12 },

  customizationContainer: { marginTop: 8 },

  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginBottom: 12,
  },
  optionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#222" },
  optionSubTitle: { fontSize: 12, color: "#888", marginTop: 2 },

  clearOptionBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearOptionText: { color: "#666", fontWeight: "600" },

  choiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  choiceRowSelected: { borderColor: colors.backgroundColorHeader, backgroundColor: "#f7fbff" },
  choiceLeft: { flexDirection: "row", alignItems: "center" },
  choiceText: { fontSize: 15, color: "#333", marginLeft: 4 },
  choiceRight: { flexDirection: "row", alignItems: "center" },
  choicePrice: { fontSize: 14, color: colors.merchantScreenTitleColor, marginRight: 8 },

  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#ccc", justifyContent: "center", alignItems: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },

  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "#ccc", justifyContent: "center", alignItems: "center" },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 6,
    height: 42,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  qtyButton: { width: 36, height: 34, justifyContent: "center", alignItems: "center" },
  qtySymbol: { color: colors.backgroundColorHeader, fontSize: 20, fontWeight: "700" },
  qtyText: { fontSize: 16, fontWeight: "700", color: colors.backgroundColorHeader, marginHorizontal: 6, minWidth: 26, textAlign: "center" },

  addButton: { flex: 1, marginLeft: 12, backgroundColor: colors.backgroundColorHeader, borderRadius: 12, alignItems: "center", justifyContent: "center", height: 46 },
  addButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  actualPriceText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "line-through",
    marginRight: 6,
    marginLeft: 4,
    opacity: 0.8,
  },


  skeletonContainer: { paddingHorizontal: 12, marginTop: 8 },
  skeletonOption: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },

  /* Food type small pill */
  foodTypeWrapper: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  foodTypeDot: { width: 8, height: 8, borderRadius: 4 },

  footerSkeleton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  content: {
    paddingTop: 18,
  },

  caption: {
    fontSize: 17,
    color: "#1b1818ff",
    marginTop: 12,
    lineHeight: 20,
    marginBottom: 15,
    fontWeight: "700"
  },

  textAreaContainer: {
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    padding: 12,
    height: 120,
  },

  textArea: {
    fontSize: 15,
    color: "#111",
    height: "100%",
    textAlignVertical: "top",
  },
});

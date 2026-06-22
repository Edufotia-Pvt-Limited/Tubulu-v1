

import React from "react";

const ORDER_STEPS = [
  { key: "ORDER_PLACED", label: "Placed" },
  { key: "ORDER_ACCEPTED", label: "Accepted" },
  { key: "ORDER_PACKING", label: "Preparing" },
  { key: "ORDER_DISPATCHED", label: "Out for delivery" },
  { key: "ORDER_DELIVERED", label: "Delivered" },
  { key: "ORDER_CANCELED", label: "Canceled" },
];



import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { ORDER_STATUS_CONFIG } from "../../Utils/Constants";


interface ProductItem {
  name: string;
  price: number;
  quantity: number;
  choiceNames?: string[];
  logo?: string;
}

interface OrderMessageData {
  type: keyof typeof ORDER_STATUS_CONFIG;
  message: string;
  createdAt: string | number | Date;
  productNames?: string[] | ProductItem[];
  orderId?: string;
  subTotal?: number;
}

interface Props {
  data: OrderMessageData;
  onViewDetails?: (orderId: string, type:string) => void;
  isLoading?: boolean;
}

const OrderReceiptMessage: React.FC<Props> = ({ data, onViewDetails, isLoading = false }) => {
  const {
    type,
    message,
    createdAt,
    productNames = [],
    orderId,
    subTotal,
  } = data;

  const config = ORDER_STATUS_CONFIG[type];
  if (!config) return null;

  const date = new Date(createdAt);

  // ORDER_REFUND is the only true terminal status (shown as pill)
  const isTerminal = type === "ORDER_REFUND";

  // Find the current step index
  const currentStepIndex = ORDER_STEPS.findIndex(
    s => s.key === type
  );

  // Check if this is a canceled order
  const isCanceled = type === "ORDER_CANCELED";
  
  // For canceled orders, we need to determine the last completed step before cancellation
  // Since we don't have history, we'll show steps up to ORDER_ACCEPTED as completed
  // (ORDER_PLACED and ORDER_ACCEPTED are minimum required before cancellation)
  // Then show ORDER_CANCELED after that
  const lastCompletedStepBeforeCancel = isCanceled 
    ? ORDER_STEPS.findIndex(s => s.key === "ORDER_ACCEPTED")
    : -1;

  const title = formatStatusTitle(type);

  // Check if productNames is array of objects or strings (backward compatibility)
  const isProductObjects = productNames.length > 0 && typeof productNames[0] === 'object';
  const productItems: ProductItem[] = isProductObjects 
    ? (productNames as ProductItem[])
    : (productNames as string[]).map(name => ({ name, price: 0, quantity: 1, logo: undefined }));

  // Calculate subtotal if not provided
  const calculatedSubTotal = subTotal ?? productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Determine if items are loading
  // Show loading if explicitly set, or if productNames is undefined/not yet loaded (but not for terminal statuses with no items)
  const itemsLoading = isLoading || (data.productNames === undefined && !isTerminal);

  return (
    <View style={styles.card}>
      {/* -------- STEPPER / STATUS -------- */}
      {isTerminal ? (
        <View style={[styles.statusPill, { backgroundColor: config.color }]}>
          <Text style={styles.statusPillText}>
            {config.icon} {title}
          </Text>
        </View>
      ) : (
        <View style={styles.stepper}>
          {(() => {
            // First, collect all visible steps with their original indices
            const visibleSteps = ORDER_STEPS.map((step, originalIndex) => {
              // Skip showing ORDER_CANCELED as a step in the stepper if it's not the current status
              if (step.key === "ORDER_CANCELED" && !isCanceled) {
                return null;
              }

              const isCanceledStep = step.key === "ORDER_CANCELED" && isCanceled;
              
              // For canceled orders, hide steps that come after the last completed step
              if (isCanceled && !isCanceledStep && originalIndex > lastCompletedStepBeforeCancel) {
                return null;
              }

              return { step, originalIndex, isCanceledStep };
            }).filter(item => item !== null) as Array<{ step: typeof ORDER_STEPS[0], originalIndex: number, isCanceledStep: boolean }>;

            // Now render the visible steps
            return visibleSteps.map(({ step, originalIndex, isCanceledStep }, visibleIndex) => {
              const isLastVisible = visibleIndex === visibleSteps.length - 1;
              
              // Determine step states
              let completed = false;
              let active = false;
              
              if (isCanceled) {
                // For canceled orders: only show steps up to last completed as completed
                if (isCanceledStep) {
                  active = true;
                } else {
                  // Only steps up to lastCompletedStepBeforeCancel are shown as completed
                  completed = originalIndex <= lastCompletedStepBeforeCancel;
                }
              } else {
                // Normal flow: show steps up to current as completed, current as active
                completed = originalIndex < currentStepIndex;
                active = originalIndex === currentStepIndex;
              }

              return (
                <View key={step.key} style={styles.stepItem}>
                  <View style={styles.stepContent}>
                    <View
                      style={[
                        styles.dot,
                        completed && !isCanceledStep && styles.dotCompleted,
                        active && !isCanceledStep && styles.dotActive,
                        isCanceledStep && styles.dotCanceled,
                      ]}
                    >
                      {active && !isCanceledStep && (
                        <View style={styles.dotInner} />
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
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      adjustsFontSizeToFit={false}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {!isLastVisible && step.key !== "ORDER_CANCELED" && (
                    <View
                      style={[
                        styles.line,
                        completed && styles.lineCompleted,
                        !completed && styles.lineIncomplete,
                      ]}
                    />
                  )}
                </View>
              );
            });
          })()}
        </View>
      )}

      {/* -------- HEADER -------- */}
      {/* <Text style={styles.title}>{title}</Text> */}

      {/* -------- MESSAGE -------- */}
      <Text style={styles.message}>
        {renderBold(cleanMessage(message))}
      </Text>

      {/* -------- ITEMS -------- */}
      <View style={styles.itemsBox}>
        {itemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.itemsTitle}>
              {productItems.length} {productItems.length === 1 ? 'item' : 'items'}
            </Text>

            {productItems.slice(0, 2).map((item, i) => {
              const isLast = i === Math.min(productItems.length, 2) - 1;
              const hasSubtotal = calculatedSubTotal > 0;
              const hasMoreItems = productItems.length > 2;
              // Remove border if it's the last item AND there's no subtotal AND no "more items" link
              const shouldRemoveBorder = isLast && !hasSubtotal && !hasMoreItems;
              
              // Handle choiceNames - show 2-3 items, then "..."
              const displayChoices = item.choiceNames && item.choiceNames.length > 0
                ? item.choiceNames.slice(0, 3)
                : [];
              const hasMoreChoices = item.choiceNames && item.choiceNames.length > 3;
              
              return (
                <View 
                  key={i} 
                  style={[
                    styles.itemRow,
                    shouldRemoveBorder && styles.itemRowLast
                  ]}
                >
                  {/* Item Image */}
                  <View style={styles.itemImageContainer}>
                    {item.logo ? (
                      <Image
                        source={{ uri: item.logo }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                        <Text style={styles.itemImagePlaceholderText}>📦</Text>
                      </View>
                    )}
                  </View>

                  {/* Item Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                      {formatItemName(item.name)}
                    </Text>
                    {displayChoices.length > 0 && (
                      <View style={styles.choicesContainer}>
                        <Text style={styles.itemChoices}>
                          {displayChoices.join(", ")}
                          {hasMoreChoices && (
                            <Text style={styles.itemChoicesMore}>...</Text>
                          )}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Quantity and Price */}
                  <View style={styles.itemQuantityPrice}>
                    <Text style={styles.itemQuantity}>Quantity {item.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}

            {productItems.length > 2 && (
              <TouchableOpacity
                onPress={() => onViewDetails?.(orderId!!,type)}
                style={styles.moreItemsContainer}
              >
                <Text style={styles.moreItems}>
                  +{productItems.length - 2} more items
                </Text>
              </TouchableOpacity>
            )}

            {/* Subtotal */}
            {calculatedSubTotal > 0 && (
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalAmount}>
                  ₹{calculatedSubTotal.toFixed(2)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* -------- FOOTER -------- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => onViewDetails?.(orderId!!,type)}
        >
          <Text style={styles.detailsText}>View Order</Text>
        </TouchableOpacity>

        <Text style={styles.time}>
          {date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
};

export default OrderReceiptMessage;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    width: "75%",
    maxWidth: "75%",
    alignSelf: "flex-start",
  },

  /* Stepper */
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
    position: "relative",
    zIndex: 1,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  stepContent: {
    alignItems: "center",
    zIndex: 2,
    width: "100%",
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dotCompleted: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  checkIcon: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  dotActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dotCanceled: {
    backgroundColor: "#d32f2f",
    borderColor: "#d32f2f",
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  canceledIcon: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  stepLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
    minHeight: 32,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  stepLabelActive: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 9,
  },
  stepLabelCanceled: {
    color: "#d32f2f",
    fontWeight: "700",
    fontSize: 9,
  },
  stepLabelCompleted: {
    color: "#22c55e",
    fontWeight: "600",
  },
  line: {
    position: "absolute",
    top: 10,
    left: "50%",
    right: "-50%",
    height: 1.5,
    backgroundColor: "#e5e7eb",
    zIndex: 0,
  },
  lineCompleted: {
    backgroundColor: "#22c55e",
  },
  lineCanceled: {
    backgroundColor: "#fca5a5",
  },
  lineIncomplete: {
    backgroundColor: "#e5e7eb",
  },

  /* Terminal pill */
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusPillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },

  message: {
    fontSize: 14,
    color: "#444",
    lineHeight: 17,
    marginBottom: 8,
  },
  bold: {
    fontWeight: "700",
    color: "#000",
  },

  itemsBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
  },
  itemsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  itemRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  itemImageContainer: {
    marginRight: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  itemImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },
  itemImagePlaceholderText: {
    fontSize: 18,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
    justifyContent: "flex-start",
  },
  itemName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
    lineHeight: 15,
  },
  choicesContainer: {
    marginTop: 1,
  },
  itemChoices: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 14,
  },
  itemChoicesMore: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  itemQuantityPrice: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minWidth: 70,
  },
  itemQuantity: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  moreItemsContainer: {
    marginTop: 2,
    paddingTop: 4,
  },
  moreItems: {
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "600",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  subtotalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  subtotalAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  footer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
    backgroundColor: "#2563eb",
  },
  detailsText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  time: {
    fontSize: 9,
    color: "#9ca3af",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#6b7280",
  },
});

function cleanMessage(msg: string) {
  return msg
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<hr\s*\/?>/g, "")
    .trim();
}

function renderBold(text: string) {
  const parts = text.split(/<b>(.*?)<\/b>/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={styles.bold}>{p}</Text>
    ) : (
      p
    )
  );
}

function formatStatusTitle(status: string) {
  return status
    .replace("ORDER_", "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

function formatItemName(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) {
    return name;
  }
  // Insert line break after first two words
  return words.slice(0, 2).join(" ") + "\n" + words.slice(2).join(" ");
}

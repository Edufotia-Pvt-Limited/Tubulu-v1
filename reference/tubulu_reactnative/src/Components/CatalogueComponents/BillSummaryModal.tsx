
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import ReactNativeModal from "react-native-modal";
import { colors } from "../../Utils/Colors";

const screenHeight = Dimensions.get("window").height;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


interface BillSummaryProps {
  visible: boolean;
  onClose: () => void;
  itemsTotal: string;
  cgst: string;
  sgst: string;
  otherTaxes: string;
  totalPrice: number;
  billPrice: string;
  totalSavings: string;
}

 const BillSummaryModal: React.FC<BillSummaryProps> = ({
   visible,
  onClose,
  itemsTotal,
  cgst,
 sgst,
  otherTaxes,
  totalPrice, 
  billPrice,
  totalSavings
 }) => {


  const insets = useSafeAreaInsets();

  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.55}
      deviceHeight={Dimensions.get("screen").height}
      statusBarTranslucent
    >
      <View
        style={[
          styles.modalContainer,
          { paddingBottom: insets.bottom + 10 }
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bill Summary</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Text style={styles.sectionTitle}>Order Breakdown</Text>

          <View style={styles.billCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Items Total</Text>
              <Text style={styles.value}>₹{itemsTotal}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>CGST</Text>
              <Text style={styles.value}>₹{cgst}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>SGST</Text>
              <Text style={styles.value}>₹{sgst}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Other Taxes</Text>
              <Text style={styles.value}>₹{otherTaxes}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{billPrice}</Text>
            </View>

            {Number(totalSavings) > 0 && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: "#1E88E5" }]}>
                  You Saved
                </Text>
                <Text style={[styles.value, { color: "#1E88E5" }]}>
                  - ₹{totalSavings}
                </Text>
              </View>
            )}

            <View style={styles.mainDivider} />

            <View style={[styles.row, { marginTop: 6 }]}>
              <Text style={[styles.totalLabel, { fontSize: 17 }]}>
                To Pay
              </Text>
              <Text style={[styles.totalValue, { fontSize: 18 }]}>
                ₹{totalPrice}
              </Text>
            </View>
          </View>

          {Number(totalSavings) > 0 && (
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsBannerText}>
                🎉 You saved ₹{totalSavings} on this order!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ReactNativeModal>
  );
};

export default BillSummaryModal;

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: screenHeight * 0.75, 
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },

  header: {
    backgroundColor: colors.backgroundColorHeader,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },

  closeBtn: {
    backgroundColor: "#ffffff33",
    padding: 6,
    borderRadius: 50,
  },

  sectionTitle: {
    paddingHorizontal: 22,
    marginTop: 16,
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },

  billCard: {
    backgroundColor: "#f7f8fa",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 18,
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  label: {
    fontSize: 15,
    color: "#444",
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  mainDivider: {
    height: 1,
    backgroundColor: "#dcdcdc",
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },

  savingsBanner: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    marginTop: 14,
    marginHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  savingsBannerText: {
    color: "#2E7D32",
    fontSize: 14.5,
    fontWeight: "700",
    textAlign: "center",
  },
});

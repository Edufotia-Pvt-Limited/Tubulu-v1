
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  UIManager,
  Clipboard,
  ScrollView,
} from "react-native";
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

interface CouponDetailsProps {
  visible: boolean;
  onClose: () => void;
  deal: {
    dealName: string;
    couponCode?: string;
    descriptions: string[];
  };
}

const CouponDetailsModal: React.FC<CouponDetailsProps> = ({
  visible,
  onClose,
  deal,
}) => {
  const copyCode = () => {
    if (deal?.couponCode) {
      Clipboard.setString(deal.couponCode);
    }
  };

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
      <View style={styles.modalContainer}>

          {/* HEADER */}
          <Text style={styles.headerTitle}>Coupon Details</Text>
        {/* SCROLLABLE CONTENT */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
        

          {/* MAIN CARD */}
          <View style={styles.card}>
            {/* ICON + COUPON NAME */}
            <View style={styles.rowTop}>
              <Icon
                name="redeem"
                size={22}
                color={colors.backgroundColorHeader}
              />
              <Text numberOfLines={2} style={styles.mainTitle}>
                {deal.dealName}
              </Text>
            </View>

            {/* CODE + COPY */}
            {deal.couponCode && (
              <View style={styles.codeRow}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{deal.couponCode}</Text>
                </View>

                <TouchableOpacity onPress={copyCode}>
                  <Text style={styles.copyText}>TAP TO COPY</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* DESCRIPTION LIST */}
            <View style={{ marginTop: 16 }}>
              {deal.descriptions.map((line, index) => (
                <View key={index} style={styles.descRow}>
                  <Icon name="check-circle" size={18} color="#28a745" />
                  <Text style={styles.descText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* FIXED OK BUTTON */}
        <View style={{  paddingHorizontal: 20,}}>
        <TouchableOpacity style={styles.okBtn} onPress={onClose}>
          <Text style={styles.okBtnText}>Okay</Text>
        </TouchableOpacity>
        </View>
      </View>
    </ReactNativeModal>
  );
};

export default CouponDetailsModal;

const styles = StyleSheet.create({
  modalContainer: {
    height: screenHeight * 0.45,   
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // paddingTop: 22,
    // paddingHorizontal: 20,
    overflow: "hidden",

  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
    color: "#FFF",
    backgroundColor: colors.backgroundColorHeader,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#f7f8fa",
    borderRadius: 14,
    padding: 16,
    paddingHorizontal: 20,
  },

  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
  },

  mainTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    color: "#222",
    flex: 1,
  },

  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  codeBox: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
  },

  codeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.6,
  },

  copyText: {
    color: colors.backgroundColorHeader,
    fontWeight: "700",
    fontSize: 14,
  },

  descRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  descText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  okBtn: {
    backgroundColor: colors.backgroundColorHeader,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 40,
    alignItems: "center",
  },

  okBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

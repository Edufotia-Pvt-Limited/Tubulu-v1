
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ReactNativeModal from "react-native-modal";
import { colors } from "../../Utils/Colors";

const screenHeight = Dimensions.get("window").height;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface Deal {
  name: string;
  couponCode: string;
  descriptions: string[];
}

interface OffersModalProps {
  visible: boolean;
  onClose: () => void;
  deals: Deal[];
  storeName: string;
}

const OffersModal: React.FC<OffersModalProps> = ({ visible, onClose, deals, storeName }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

console.log("deal", deals)

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Offers at {storeName}</Text>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Store Coupons</Text>

        <ScrollView showsVerticalScrollIndicator={false}
         contentContainerStyle={{
    paddingBottom: expandedIndex !== null ? 40 : 20, 
  }}
        >
          {deals?.map((item, index) => {
            const isOpen = expandedIndex === index;

            return (
              <View key={index} style={styles.offerCard}>
                
                {/* ROW TOP */}
                <TouchableOpacity
                  onPress={() => toggleExpand(index)}
                  style={styles.topRow}
                  activeOpacity={0.85}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconCircle}>
                      <Icon name="verified" size={18} color="#4BA3FF" />
                    </View>

                    <Text style={styles.offerTitle}>{item.name}</Text>
                  </View>

                  <Icon
                    name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={26}
                    color="#333"
                  />
                </TouchableOpacity>

          

                {/* USE CODE AREA (moved closer) */}
                {item.couponCode &&
             
                <View style={[styles.contentAligned]}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.backgroundColorHeader,
                      marginBottom: 4,
                      marginLeft: 2,
                    }}
                  >
                    Use code {item.couponCode}
                  </Text>

                  <View style={styles.codeBox}>
                    <Text style={styles.couponCode}>{item.couponCode}</Text>
                  </View>
                </View>
          }

                {isOpen && item.descriptions.length > 0 &&(
                  <View style={styles.contentAligned}>

              
                    <View style={styles.divider} />

                    <View style={styles.expandedArea}>
                      <Text style={styles.detailTitle}>Details</Text>

                      {item.descriptions.map((desc, i) => (
                        <View key={i} style={styles.descRow}>
                          <Icon name="check" size={18} color={colors.deliveryFree} />
                          <Text style={styles.descText}>{desc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              </View>
            );
          })}
        </ScrollView>
      </View>
    </ReactNativeModal>
  );
};

export default OffersModal;

const styles = StyleSheet.create({
  modalContainer: {
    height: screenHeight * 0.7,
    backgroundColor: colors.backgroundWhite,
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryTextColor,
  },

  offerCard: {
    padding: 18,
    marginHorizontal: 22,
    marginTop: 18,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FCFCFC",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  offerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryTextColor,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#E6E6E6",
    marginTop: 16,
    marginBottom: 12,
  },

  contentAligned: {
    paddingLeft: 38,
  },

  codeBox: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F6F6F7",
    borderWidth: 1,
    borderColor: colors.productsBorder,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  couponCode: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.backgroundColorHeader,
    letterSpacing: 0.5,
  },

  expandedArea: {
    marginTop: 10,
  },

  detailTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryTextColor,
    marginBottom: 10,
  },

  descRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  descText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.primaryTextColor,
    flex: 1,
    lineHeight: 20,
  },
});



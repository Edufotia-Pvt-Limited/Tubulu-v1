import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../Utils/Colors";
import CouponDetailsModal from "./CouponDetailsModal";

const DealRow = ({
  deal,
  onApply,
  onRemove,
  disabledApply,
}: {
  deal: any;
  onApply: (d: any) => void;
  onRemove: (d: any) => void;
  disabledApply?: boolean;
}) => {

  const [detailsOpen, setDetailsOpen] = useState<boolean>(false)

  // const [selectedDealInfo, setSelectedDealInfo] = useState({
  //   dealName: "",
  //   couponCode: "",
  //   descriptions: [],
  // });

  return (
    <View style={styles.dealRow}>

      {/* LEFT SIDE — ICON + TITLE + INFO */}
      <View style={styles.dealLeft}>

        {/* Redeem icon */}
        <Icon
          name="redeem"
          size={16}
          color="#548dc5ff"
          style={{ marginRight: 6 }}
        />

        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.titleRow} onPress={() => setDetailsOpen(true)}>
            <Text
              style={styles.dealName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {deal.dealName}
            </Text>

            {/* Info icon */}
            <Icon
              name="info-outline"
              size={15}
              color="#444"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          {/* {Array.isArray(deal.descriptions) && deal.descriptions.length > 0 && (
            <Text
              style={styles.dealDesc}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {deal.descriptions.join(" ")}
            </Text>
          )} */}
        </View>
      </View>

      {/* RIGHT SIDE — APPLY / REMOVE */}
      <View style={styles.dealActions}>
        {!deal.alreadyApplied ? (
          <TouchableOpacity
            style={[
              styles.applyBtn,
              styles.fixedWidthBtn,
              disabledApply && styles.disabledApplyBtn,
            ]}
            onPress={() => onApply(deal)}
          >
            <Text
              style={[
                styles.applyBtnText,
                disabledApply && { opacity: 0.7 },
              ]}
            >
              APPLY
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.applyBtn,
              styles.fixedWidthBtn,
              { borderColor: "red" },
            ]}
            onPress={() => onRemove(deal)}
          >
            <Text
              style={[
                styles.applyBtnText,
                { color: "red" },
              ]}
            >
              REMOVE
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {setDetailsOpen &&
        <CouponDetailsModal
          visible={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          deal={{
            dealName: deal.dealName,
            couponCode: deal.couponCode,
            descriptions: deal.descriptions,
          }}
        />
      }

    </View>
  );
};


export default DealRow;

const styles = StyleSheet.create({

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

  dealRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  dealName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#363434ff",
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  dealDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  dealActions: {
    marginLeft: 8,
    alignItems: "flex-end",
  },
  applyBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.backgroundColorHeader,
  },
  disabledApplyBtn: {
    backgroundColor: '#fff',
    borderColor: colors.backgroundColorHeader,
    borderWidth: 1,
  },
  applyBtnText: {
    color: colors.backgroundColorHeader,
    fontWeight: "700",
    fontSize: 11,
  },
})
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  label: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  onRemove?: () => void
  selectedFiltersCount: number
  itemFilter?: boolean
}

const CatalogueChip = ({ label, itemFilter, leftElement, rightElement, onPress, selected, onRemove, selectedFiltersCount }: Props) => {

  function renderleftElement() {
    if (leftElement) {
      return leftElement;
    }
  }

  function renderRightElement() {
    if (rightElement) {
      return rightElement;
    }
  }

  return (

    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 38,
        height: 33,
        borderWidth: 1,
        paddingHorizontal: 12,
        borderColor: selected || selectedFiltersCount ? "#007AFF" : "#C5C5C7",
        backgroundColor: selected || selectedFiltersCount ? "#EAF3FF" : "white",
      }}
    >
      {/* Left Element (icon) */}
      {leftElement && (
        <View style={{ marginRight: 6 }}>
          {leftElement}
        </View>
      )}

      {/* Label + Count + Close grouped together */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Label */}
        <Text
          style={{
            fontFamily: "Roboto",
            fontWeight: "400",
            fontSize: 14,
            color: selected ? "#2c4055ff" : "#000000",
          }}
        >
          {label}
        </Text>

        {/* Circular Count Badge */}
        {selectedFiltersCount > 0 && (
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#007AFF",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 6,
            }}
          >
            <Text style={{ color: "white", fontSize: 11, fontWeight: "500" }}>
              {selectedFiltersCount}
            </Text>
          </View>
        )}

        {/* Close Button */}
        {/* {(selectedFiltersCount > 0 || selected ) &&  ( */}
        {(selectedFiltersCount > 0 || itemFilter) && (
          <TouchableOpacity
            onPress={onRemove}
            style={{
              marginLeft: 4,
              width: 12,
              height: 18,
              borderRadius: 9,
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="close" size={14} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>



  );
};

export default React.memo(CatalogueChip)






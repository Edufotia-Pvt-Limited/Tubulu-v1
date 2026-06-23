import React from "react";
import { View } from "react-native";
import { SkeletonBox } from "./ProductCardSkeleton";


const AddressSkeleton = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: "white",
      }}
    >
      
      <SkeletonBox style={{ width: 42, height: 42, borderRadius: 10 }} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <SkeletonBox style={{ width: "40%", height: 14, marginBottom: 6 }} />
        <SkeletonBox style={{ width: "80%", height: 12 }} />
      </View>
    </View>
  );
};

export default AddressSkeleton;

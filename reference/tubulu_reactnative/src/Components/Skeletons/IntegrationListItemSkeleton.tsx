import React, { useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";

export const SkeletonBox = ({ style }: { style?: any }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [shimmerAnim]);

  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e0e0e0", "#f5f5f5"],
  });

  return <Animated.View style={[{ backgroundColor, borderRadius: 8 }, style]} />;
};

const IntegrationListItemSkeleton = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      {/* Logo Skeleton */}
      <SkeletonBox style={{ width: 55, height: 55, borderRadius: 28 }} />

      {/* Text Section */}
      <View style={{ flex: 1, paddingLeft: 14 }}>
        <SkeletonBox
          style={{ width: "60%", height: 16, marginBottom: 8, borderRadius: 4 }}
        />
        <SkeletonBox
          style={{ width: "40%", height: 12, borderRadius: 4 }}
        />
      </View>

      {/* Cart Icon Placeholder */}
      {/* <SkeletonBox
        style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 10 }}
      /> */}
    </View>
  );
};

export default IntegrationListItemSkeleton;

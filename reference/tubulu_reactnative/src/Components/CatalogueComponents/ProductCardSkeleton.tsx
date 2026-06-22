import { useRef, useEffect } from "react";
import { View, Animated, Easing, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

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

const ProductCardSkeleton = () => {
  return (
    <View
      style={{
        width: (width - 48) / 2,
        marginBottom: 16,
      }}
    >
      <SkeletonBox style={{ width: "100%", height: 120, marginBottom: 10 }} />
      <SkeletonBox style={{ width: "80%", height: 14, marginBottom: 6 }} />
      <SkeletonBox style={{ width: "60%", height: 14, marginBottom: 6 }} />
      <SkeletonBox style={{ width: "40%", height: 14 }} />
    </View>
  );
};

export default ProductCardSkeleton;

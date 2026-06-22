import { useRef, useEffect } from "react";
import { View, ScrollView, Dimensions, Animated, Easing } from "react-native";

const { width } = Dimensions.get("window");

const CatalogueSkeleton = () => {
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

  const SkeletonBox = ({ style }: { style?: any }) => (
    <Animated.View style={[{ backgroundColor, borderRadius: 8 }, style]} />
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <SkeletonBox style={{ width: width, height: 130, marginBottom: 20 }} />

      {/* Store Logo + Info */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
        <SkeletonBox style={{ width: 100, height: 100, borderRadius: 8 }} />
        <View style={{ marginLeft: 16, flex: 1, justifyContent: "center" }}>
          <SkeletonBox style={{ width: "60%", height: 20, marginBottom: 8 }} />
          <SkeletonBox style={{ width: "40%", height: 14, marginBottom: 8 }} />
          <SkeletonBox style={{ width: "80%", height: 14 }} />
        </View>
      </View>

      {/* Chips Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 20 }}
      >
        {[1, 2, 3, 4].map((chip, idx) => (
          <SkeletonBox
            key={idx}
            style={{
              width: 90,
              height: 30,
              borderRadius: 16,
              marginRight: 12,
            }}
          />
        ))}
      </ScrollView>

      {/* Product Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        {[1, 2, 3, 4].map((prod, idx) => (
          <View
            key={idx}
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
        ))}
      </View>
    </ScrollView>
  );
};

export default CatalogueSkeleton;

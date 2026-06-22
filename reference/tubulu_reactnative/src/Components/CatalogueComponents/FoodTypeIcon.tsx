import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";

type FoodType = "Veg" | "Non Veg" | "Egg" | "Other";

interface FoodTypeIconProps {
  type: FoodType;
  size?: number;        
  dotSize?: number;     
  style?: StyleProp<ViewStyle>;
}

const FOOD_TYPE_COLORS: Record<FoodType, string> = {
  Veg: "#0A8A25",
  "Non Veg": "#C62828",
  Egg: "#FF9800",
  Other: "#9E9E9E",
};

const FoodTypeIcon: React.FC<FoodTypeIconProps> = ({
  type,
  size = 16,
  dotSize = 7,
  style,
}) => {
  const color = FOOD_TYPE_COLORS[type];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: 3,
          borderWidth: 1.5,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        },
        style,
      ]}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

export default FoodTypeIcon;

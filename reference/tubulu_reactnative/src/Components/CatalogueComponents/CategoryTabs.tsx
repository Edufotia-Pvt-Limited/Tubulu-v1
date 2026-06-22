
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  Animated,
  Easing,
} from "react-native";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const MAX_TEXT_WIDTH = 120;

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelect,
}) => {
  const [tabOffsets, setTabOffsets] = useState<Record<string, number>>({});
  const [tabWidths, setTabWidths] = useState<Record<string, number>>({});

  const scrollRef = useRef<ScrollView>(null);

  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  // Measure tab position and width
  const handleTabLayout = (cat: string, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabOffsets((prev) => ({ ...prev, [cat]: x }));
    setTabWidths((prev) => ({ ...prev, [cat]: width }));
  };

  // Animate underline & auto scroll
  useEffect(() => {
    const width = tabWidths[selectedCategory] || 0;
    const offset = tabOffsets[selectedCategory] || 0;

    Animated.parallel([
      Animated.timing(underlineX, {
        toValue: offset,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(underlineWidth, {
        toValue: width,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Auto-scroll selected tab into view
    scrollRef.current?.scrollTo({
      x: Math.max(offset - 60, 0),
      animated: true,
    });
  }, [selectedCategory, tabOffsets, tabWidths]);

  return (
    <View style={styles.wrapper}>
      {/* Divider line */}
      <View style={styles.ruler} />

      {/* Animated underline */}
      <Animated.View
        style={[
          styles.animatedUnderline,
          {
            width: underlineWidth,
            transform: [
              {
                translateX: Animated.subtract(underlineX, scrollX),
              },
            ],
          },
        ]}
      />

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {categories.map((cat, index) => {
          const isSelected = selectedCategory === cat;

          return (
            <TouchableOpacity
              key={index}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => onSelect(cat)}
              onLayout={(e) => handleTabLayout(cat, e)}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.categoryText,
                  isSelected && styles.selectedCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

export default CategoryTabs;


const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    paddingTop: 14,
    paddingBottom: 10,
    position: "relative",
    marginTop: 10,
  },

  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  tabItem: {
    marginRight: 30,
  },

  categoryText: {
    fontSize: 16.5,
    fontWeight: "600",
    color: "#444",
    maxWidth: MAX_TEXT_WIDTH,
  },

  selectedCategoryText: {
    color: "#0d6efd",
    //  color: "#444",
    fontWeight: "700",
  },

  ruler: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.7,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  animatedUnderline: {
    position: "absolute",
    bottom: 0,
    height: 4,
    backgroundColor: "#0d6efd",
    borderRadius: 4,
  },
});

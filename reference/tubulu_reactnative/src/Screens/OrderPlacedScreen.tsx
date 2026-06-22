
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../Utils/Colors";

interface OrderPlacedProps {
  navigation: any;
  route: RouteProp<{
    OrderPlacedScreen: {
      orderId: string;
      totalAmount: number;
      estimatedDeliveryMinutes?: number;
      integrationItem: any
    }
  }, 'OrderPlacedScreen'>;
}

const { height, width } = Dimensions.get("window");

const OrderPlacedScreen = ({ navigation, route }: OrderPlacedProps) => {
  const { orderId, totalAmount, estimatedDeliveryMinutes, integrationItem } = route.params;
  const [loading, setLoading] = useState(true);
  const totalInRupees = totalAmount / 100;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const navigateToChat = () => {

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "ChatScreen",
          params: {
            integrationItem,
          },
        },
      ],
    });

  }


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.backgroundColorHeader}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Success Icon with animated background */}
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <View style={styles.iconInnerCircle}>
                <Icon name="check-circle" color={colors.deliveryFree} size={64} />
              </View>
            </View>
          </Animated.View>

          {/* Success Message */}
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subTitle}>
            Your order <Text style={styles.highlight}>#{orderId}</Text> has been placed successfully.
          </Text>

          {/* Order summary card */}
          <View style={styles.orderSummaryCard}>
            <View style={styles.summaryHeader}>
              <Icon name="receipt" color={colors.backgroundColorHeader} size={22} />
              <Text style={styles.summaryTitle}>Order Summary</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryAmount}>₹{totalInRupees.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order ID</Text>
              <Text style={styles.orderIdText}>#{orderId}</Text>
            </View>
          </View>

          {/* Estimated Delivery card */}
          {/* <View style={styles.deliveryCard}>
            <View style={styles.deliveryIconContainer}>
              <Icon name="timer" color={colors.screenColor} size={24} />
            </View>
            <View style={styles.deliveryContent}>
              <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
              <Text style={styles.deliveryTime}>
                {estimatedDeliveryMinutes || 'N/A'} minutes
              </Text>
            </View>
          </View> */}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.trackBtn]}
              onPress={() => navigateToChat()}
              activeOpacity={0.8}
            >
              <Icon name="location-on" color={colors.screenColor} size={20} style={styles.buttonIcon} />
              <Text style={styles.trackBtnText}>Track Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.continueBtn]}
              onPress={() => navigation.navigate("HomeScreen")}
              activeOpacity={0.8}
            >
              <Icon name="shopping-bag" color={colors.backgroundColorHeader} size={20} style={styles.buttonIcon} />
              <Text style={styles.continueBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.screenColor,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.titleBlackColor,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  highlight: {
    fontWeight: "700",
    color: colors.backgroundColorHeader,
  },
  orderSummaryCard: {
    width: "100%",
    backgroundColor: colors.screenColor,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.titleBlackColor,
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.backgroundColorHeader,
    letterSpacing: 0.5,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.titleBlackColor,
    letterSpacing: 0.5,
  },
  deliveryCard: {
    width: "100%",
    backgroundColor: colors.backgroundColorHeader,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.backgroundColorHeader,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  deliveryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deliveryTime: {
    fontSize: 20,
    color: colors.screenColor,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 8,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonIcon: {
    marginRight: 8,
  },
  trackBtn: {
    backgroundColor: colors.backgroundColorHeader,
  },
  trackBtnText: {
    color: colors.screenColor,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  continueBtn: {
    borderWidth: 2,
    borderColor: colors.backgroundColorHeader,
    backgroundColor: colors.screenColor,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.05,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  continueBtnText: {
    color: colors.backgroundColorHeader,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    height,
    width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundWhite,
  },
});

export default OrderPlacedScreen;

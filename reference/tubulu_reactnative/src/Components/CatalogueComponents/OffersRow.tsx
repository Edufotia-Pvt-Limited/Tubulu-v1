
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Deals = {
  name : string
  description : String[]
  couponCode: string;
}

interface Props {

  onOpen : ()=>void
  deals : Deals[]

}

 const OfferRow: React.FC<Props>=({ deals, onOpen })=> {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const animateNext = () => {
    Animated.timing(animatedValue, {
      toValue: -40,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      animatedValue.setValue(40);
      setCurrentIndex(prev => (prev + 1) % deals.length);

      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    if (deals?.length > 1) {
      const interval = setInterval(animateNext, 2500);
      return () => clearInterval(interval);
    }
  }, []);

 const activeDeal = deals && deals.length > 0 ? deals[currentIndex] : null;


  return (
    <TouchableOpacity
      style={styles.offerRow}
      activeOpacity={0.8}
      onPress={onOpen}
    >
      {/* <Icon name="verified" size={18} color="#4BA3FF" /> */}

     

      <View style={styles.textWrapper}>

          <Animated.View style={{ transform: [{ translateY: animatedValue }] }}>
    <Icon name="verified" size={18} color="#4BA3FF" />
  </Animated.View>
        <Animated.View
          style={{ transform: [{ translateY: animatedValue }] }}
        >
          <Text style={styles.offerText}>
  {activeDeal?.name ?? "No offers available"}
</Text>

        </Animated.View>
      </View>

      <Text style={styles.offerCount}>{deals.length} offers</Text>
      <Icon name="keyboard-arrow-down" size={24} color="#555" />
    </TouchableOpacity>
  );
}

export default OfferRow

const styles = StyleSheet.create({
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "white",
    marginTop: 18,
  },
  textWrapper: {
    height: 20,
    overflow: "hidden",
    flex: 1,
    // marginLeft: 4,
    alignItems:"center",
    flexDirection: "row",
    gap:5
  },
  offerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  offerCount: {
    color: "#666",
    marginRight: 2,
    fontSize: 13,
  },
});
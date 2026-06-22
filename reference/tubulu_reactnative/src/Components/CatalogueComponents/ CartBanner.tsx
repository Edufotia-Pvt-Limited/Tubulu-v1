import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, Animated } from 'react-native';

interface CartProps {
  cartCount : number
  onViewCart : ()=>void
}
const CartBanner = ({ cartCount, onViewCart }: CartProps) => {
  const [visible, setVisible] = useState(false);

  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (cartCount > 0) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        slideAnim.setValue(100);
      });
    }
  }, [cartCount]);



  if (!visible) return null;

  return (
   <Pressable onPress={onViewCart} style={{ position: 'absolute', bottom: "4%", left: 0, right: 0, width: "100%" }}>
  <Animated.View
    style={{
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      transform: [{ translateY: slideAnim }],
      width: "100%",
    }}
  >
    <View style={{
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 16,
      backgroundColor: '#1E47A1',
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between"
    }}>
      <Text style={{ color: 'white', fontSize: 16 }}>
        {cartCount} {cartCount === 1 ? 'Item' : 'Items'} added
      </Text>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>View Cart</Text>
    </View>
  </Animated.View>
</Pressable>
  );
};

export default CartBanner
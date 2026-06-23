
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface InlineLoaderProps {
  color?: string; 
  height?: number;
}

const InlineLoader: React.FC<InlineLoaderProps>= ({color = 'white',height= 3} ) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 150],
  });

  return (
    <View style={styles.loaderContainer}>
      <Animated.View
        style={[
          styles.loaderLine,
          {
            transform: [{ translateX }],
             backgroundColor: color, 
              height: height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    bottom: 0,
    // height: 2,
    width: '100%',
    overflow: 'hidden',
  },
  loaderLine: {
    height: '100%',
    width: 50,
    // backgroundColor: 'blue',
    opacity: 0.7,
    borderRadius: 1,
  },
});

export default InlineLoader;

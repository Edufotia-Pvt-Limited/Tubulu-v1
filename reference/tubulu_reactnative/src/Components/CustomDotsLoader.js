import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const DotsLoader = ({ color = '#000', size = 10, dotCount = 3, duration = 600 }) => {
  const [activeDot, setActiveDot] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % dotCount);
    }, duration);

    return () => clearInterval(interval);
  }, [dotCount, duration]);

  const dots = [];
  const dotSize = size;
  const dotSpacing = size * 1.5;

  for (let i = 0; i < dotCount; i++) {
    const scale = i === activeDot ? 1.2 : 0.8;
    const opacity = i === activeDot ? 1 : 0.5;
    
    dots.push(
      <Circle
        key={i}
        cx={i * dotSpacing + dotSize / 2}
        cy={dotSize / 2}
        r={dotSize / 2 * scale}
        fill={color}
        opacity={opacity}
      />
    );
  }

  return (
    <View style={{ height: size, width: dotCount * dotSpacing }}>
      <Svg height={size} width={dotCount * dotSpacing}>
        {dots}
      </Svg>
    </View>
  );
};

export default DotsLoader;

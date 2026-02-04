import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiProps {
  count?: number;
}

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  color: string;
}

export const Confetti: React.FC<ConfettiProps> = ({ count = 50 }) => {
  const confettiPieces = useRef<ConfettiPiece[]>([]).current;

  useEffect(() => {
    // Initialize confetti pieces
    const colors = ['#e8a838', '#f0c860', '#d4b892', '#00ff00', '#5a8a40', '#c4a882'];

    for (let i = 0; i < count; i++) {
      const startX = Math.random() * width;
      const startY = height;
      const endY = -50 - Math.random() * 300;
      const endX = startX + (Math.random() - 0.5) * 200;

      const x = new Animated.Value(startX);
      const y = new Animated.Value(startY);
      const rotate = new Animated.Value(0);
      const scale = new Animated.Value(0);
      const color = colors[Math.floor(Math.random() * colors.length)];

      confettiPieces.push({ x, y, rotate, scale, color });

      // Animate
      const delay = Math.random() * 200;
      const duration = 1500 + Math.random() * 1000;

      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(y, {
            toValue: endY,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(x, {
            toValue: endX,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(rotate, {
            toValue: Math.random() * 720 - 360,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                { rotate: piece.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })
                },
                { scale: piece.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

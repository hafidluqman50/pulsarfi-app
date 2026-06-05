// ─── PulsarDot ────────────────────────────────────────────────
// Animated pulsing red dot with two expanding rings.
// Uses react-native-reanimated v4 (Worklets built-in).

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface PulsarDotProps {
  size?: number;
}

export default function PulsarDot({ size = 12 }: PulsarDotProps) {
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.6);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.4);

  useEffect(() => {
    // Ring 1 — starts immediately
    ring1Scale.value = withRepeat(
      withTiming(2.2, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    ring1Opacity.value = withRepeat(
      withTiming(0, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );

    // Ring 2 — delayed so rings feel staggered
    ring2Scale.value = withRepeat(
      withDelay(
        500,
        withTiming(2.8, { duration: 1600, easing: Easing.out(Easing.ease) }),
      ),
      -1,
      false,
    );
    ring2Opacity.value = withRepeat(
      withDelay(
        500,
        withTiming(0, { duration: 1600, easing: Easing.out(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [ring1Opacity, ring1Scale, ring2Opacity, ring2Scale]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const dotRadius = size;
  const containerSize = size * 3.5;

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer ring */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: dotRadius,
            height: dotRadius,
            borderRadius: dotRadius / 2,
            backgroundColor: '#c8102e',
          },
          ring2Style,
        ]}
      />
      {/* Inner ring */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: dotRadius,
            height: dotRadius,
            borderRadius: dotRadius / 2,
            backgroundColor: '#c8102e',
          },
          ring1Style,
        ]}
      />
      {/* Solid dot */}
      <View
        style={{
          width: dotRadius,
          height: dotRadius,
          borderRadius: dotRadius / 2,
          backgroundColor: '#c8102e',
        }}
      />
    </View>
  );
}

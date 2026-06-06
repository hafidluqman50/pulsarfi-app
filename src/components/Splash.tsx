import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '@/components/CoreUI';
import { useColors } from '@/lib/theme';

export function Splash({ onDone, isReady }: { onDone: () => void; isReady?: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let timer: any;
    if (isReady !== false) {
      const delay = isReady === undefined ? 3000 : 2200;
      timer = setTimeout(onDone, delay);
    } else {
      timer = setTimeout(onDone, 6000);
    }
    return () => clearTimeout(timer);
  }, [onDone, isReady]);

  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      exiting={FadeOut.duration(320)}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 80,
        backgroundColor: colors.canvas,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
        {[132, 96, 64].map((size, index) => (
          <View
            key={size}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: colors.merah,
              opacity: 0.08 + index * 0.1,
            }}
          />
        ))}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            backgroundColor: colors.merah,
            borderWidth: 8,
            borderColor: colors.merahSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.displayMed, fontSize: 30, color: '#fff', lineHeight: 34 }}>P</Text>
        </View>
      </View>

      <View style={{ marginTop: 14, alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, color: colors.ink, letterSpacing: -0.6 }}>PulsarFi</Text>
        <Text
          style={{
            fontFamily: fonts.sansSemi,
            fontSize: 10,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: colors.body,
            marginTop: 8,
          }}
        >
          Tokenized IDX equities
        </Text>
      </View>

      <View style={{ position: 'absolute', bottom: Math.max(38, insets.bottom + 16), alignItems: 'center', gap: 12 }}>
        <ActivityIndicator color={colors.merah} />
        <Text
          style={{
            fontFamily: fonts.sansSemi,
            fontSize: 11,
            letterSpacing: 1.54,
            textTransform: 'uppercase',
            color: colors.body,
          }}
        >
          Securing on Arbitrum
        </Text>
      </View>
    </Animated.View>
  );
}

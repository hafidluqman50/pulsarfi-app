// ─── FontLoader ───────────────────────────────────────────────
// Loads all PulsarFi custom fonts and renders children once ready.
// Show nothing while loading (Expo SplashScreen handles the gap).

import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_400Regular_Italic,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import React from 'react';
import { View } from 'react-native';

interface FontLoaderProps {
  children: React.ReactNode;
}

export default function FontLoader({ children }: FontLoaderProps) {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    // Return an empty view to hold layout while fonts load
    return <View className="flex-1 bg-canvas" />;
  }

  return <>{children}</>;
}

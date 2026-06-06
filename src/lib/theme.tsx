import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

export type Colors = {
  canvas: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  body: string;
  hairline: string;
  hairlineStrong: string;
  accent: string;
  merah: string;
  merahSoft: string;
  positive: string;
  negative: string;
};

export const lightColors: Colors = {
  canvas: '#fbfaf7',
  surface: '#ffffff',
  surface2: '#f6f3ed',
  ink: '#16110e',
  inkSoft: '#2a231e',
  body: '#6b635c',
  hairline: '#e7e1d6',
  hairlineStrong: '#c8bfb0',
  accent: '#c8102e',
  merah: '#c8102e',
  merahSoft: '#fbeceb',
  positive: '#1f7a4b',
  negative: '#c8102e',
};

export const darkColors: Colors = {
  canvas: '#111009',
  surface: '#1a1714',
  surface2: '#221f1a',
  ink: '#f0ede8',
  inkSoft: '#d4cec7',
  body: '#8f867d',
  hairline: '#2e2925',
  hairlineStrong: '#3d3830',
  accent: '#c8102e',
  merah: '#c8102e',
  merahSoft: 'rgba(200,16,46,0.22)',
  positive: '#25a867',
  negative: '#c8102e',
};

type ThemeContextValue = {
  isDark: boolean;
  colors: Colors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

import AsyncStorage from '@react-native-async-storage/async-storage';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  React.useEffect(() => {
    AsyncStorage.getItem('theme').then((stored) => {
      if (stored === 'dark') setIsDark(true);
      else if (stored === 'light') setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  return useContext(ThemeContext).colors;
}

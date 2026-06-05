import 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Easing, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createBlankStackNavigator } from 'react-native-screen-transitions/blank-stack';
import { interpolate } from 'react-native-reanimated';
import Transition, { type ScreenTransitionConfig } from 'react-native-screen-transitions';

import FontLoader from '@/components/FontLoader';
import ActivityScreen from '@/app/activity/page';
import CustodianScreen from '@/app/custodian/page';
import MarketsScreen from '@/app/markets/page';
import OnboardingScreen from '@/app/onboarding/page';
import PortfolioScreen from '@/app/portfolio/page';
import SwapScreen from '@/app/swap/page';
import StockDetailScreen from '@/app/detail/page';
import { BottomNav } from '@/components/BottomNav';
import { DEFAULT_PORTFOLIO, DEFAULT_COST_BASIS, seedActivity } from '@/lib/mockData';
import { ThemeProvider, useTheme } from '@/lib/theme';

const queryClient = new QueryClient();
const Stack = createBlankStackNavigator();
const DEVICE_CORNER_RADIUS = 38;

const iosCardStackTransition: ScreenTransitionConfig = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: Transition.Specs.DefaultSpec,
    close: Transition.Specs.DefaultSpec,
  },
  screenStyleInterpolator: ({ active, current, progress }) => {
    'worklet';
    const width = current.layouts.screen.width;
    const translateX = interpolate(
      progress,
      [0, 1, 2],
      [width, 0, -width * 0.3],
      'clamp'
    );
    return {
      content: {
        borderRadius: active.settled ? 0 : DEVICE_CORNER_RADIUS,
        borderCurve: active.settled ? 'continuous' : 'circular',
        overflow: 'hidden',
        transform: [{ translateX }],
      },
      backdrop: {
        backgroundColor: 'rgba(0,0,0,1)',
        opacity: interpolate(active.progress, [0, 1], [0, 0.1], 'clamp'),
      },
    };
  },
};

const Tab = createBottomTabNavigator();

function MainTabs({ balances, costBasis, activity }: any) {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 90,
            easing: Easing.out(Easing.quad),
          },
        },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="markets">
        {(props: any) => <MarketsScreen {...props} onOpen={(tk: string) => props.navigation.navigate('Detail', { ticker: tk })} />}
      </Tab.Screen>
      <Tab.Screen name="swap">
        {(props: any) => <SwapScreen {...props} balances={balances} onSwap={() => {}} preset={props.route.params?.preset as any} clearPreset={() => props.navigation.setParams({ preset: undefined })} />}
      </Tab.Screen>
      <Tab.Screen name="portfolio">
        {(props: any) => <PortfolioScreen {...props} balances={balances} costBasis={costBasis} onOpen={(tk: string) => props.navigation.navigate('Detail', { ticker: tk })} />}
      </Tab.Screen>
      <Tab.Screen name="activity">
        {(props: any) => <ActivityScreen {...props} activity={activity} />}
      </Tab.Screen>
      <Tab.Screen name="custodian" component={CustodianScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [wallet, setWallet] = useState<any>(null);
  const [balances] = useState(DEFAULT_PORTFOLIO);
  const [costBasis] = useState(DEFAULT_COST_BASIS);
  const [activity] = useState(() => seedActivity());
  const { isDark, colors } = useTheme();

  if (!wallet) return <OnboardingScreen onConnect={setWallet} />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main">
          {(props: any) => <MainTabs {...props} balances={balances} costBasis={costBasis} activity={activity} />}
        </Stack.Screen>
        <Stack.Screen
          name="Detail"
          options={iosCardStackTransition}
        >
          {(props: any) => (
            <StockDetailScreen
              ticker={props.route.params?.ticker as string}
              balances={balances}
              costBasis={costBasis}
              onBack={() => props.navigation.goBack()}
              onTrade={(side: string, tk: string) => {
                props.navigation.dispatch(
                  StackActions.popTo('Main', {
                    screen: 'swap',
                    params: { preset: { side, ticker: tk } },
                  })
                );
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

function ThemedApp() {
  const { isDark, colors } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <FontLoader>
              <View style={{ flex: 1, backgroundColor: colors.canvas }}>
                <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.canvas} />
                <AppContent />
              </View>
            </FontLoader>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

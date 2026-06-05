import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Icon, IconName, fonts } from './CoreUI';
import { useColors } from '@/lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export type Tab = 'markets' | 'swap' | 'portfolio' | 'activity' | 'custodian';

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pressedRouteRef = React.useRef<string | null>(null);

  const items: { id: Tab; label: string; icon: IconName }[] = [
    { id: 'markets', label: 'Markets', icon: 'globe' },
    { id: 'swap', label: 'Swap', icon: 'swap' },
    { id: 'portfolio', label: 'Holdings', icon: 'wallet' },
    { id: 'activity', label: 'Activity', icon: 'spark' },
    { id: 'custodian', label: 'Vault', icon: 'terminal' },
  ];

  return (
    <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.hairline }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingTop: 6, paddingBottom: Math.max(8, insets.bottom) }}>
        {state.routes.map((route, index) => {
          const item = items.find(i => i.id === route.name);
          if (!item) return null;
          const active = state.index === index;

          const onPressTab = () => {
            if (active || pressedRouteRef.current === route.key) return;
            pressedRouteRef.current = route.key;
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
            requestAnimationFrame(() => {
              pressedRouteRef.current = null;
            });
          };

          return (
            <Pressable key={item.id} onPressIn={onPressTab} style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 5 }}>
              <View style={{ width: 44, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 99, backgroundColor: active ? colors.merahSoft : 'transparent' }}>
                <Icon name={item.icon} size={20} color={active ? colors.merah : colors.body} stroke={active ? 2 : 1.6} />
              </View>
              <Text style={{ fontFamily: active ? fonts.sansSemi : fonts.sansMed, fontSize: 10.5, color: active ? colors.merah : colors.body }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

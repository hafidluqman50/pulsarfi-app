import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ScreenHeader, SearchBox, Segmented, TokenAvatar, Spark, Mono, Icon } from '@/components/CoreUI';
import PulsarDot from '@/components/PulsarDot';
import { PSTOCKS, fmtUSD, fmtPct, seriesFor, Token } from '@/lib/mockData';
import { useColors, useTheme } from '@/lib/theme';
import { makeStyles } from './style';

function PriceTicker() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const tickerTokens = [...PSTOCKS, ...PSTOCKS, ...PSTOCKS];
  const animationOffset = useSharedValue(0);

  useEffect(() => {
    animationOffset.value = withRepeat(
      withTiming(-1000, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );
  }, [animationOffset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animationOffset.value }],
  }));

  return (
    <View style={styles.tickerRow}>
      <Animated.View style={[styles.tickerTrack, animatedStyle]}>
        {tickerTokens.map((token, index) => (
          <View key={`${token.ticker}-${index}`} style={styles.tickerItem}>
            <Mono style={{ fontSize: 11.5, fontWeight: '700' }}>{token.ticker}</Mono>
            <Mono style={{ color: colors.body, fontSize: 11.5 }}>{fmtUSD(token.price, { min: 4, max: 4 })}</Mono>
            <Mono style={{ color: (token.change24h ?? 0) >= 0 ? colors.positive : colors.merah, fontSize: 11.5, fontWeight: '700' }}>{fmtPct(token.change24h)}</Mono>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function MarketsUI({
  marketsList,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onNavigateToDetail,
}: {
  marketsList: Token[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: 'all' | 'gainers' | 'losers';
  setActiveFilter: (filterValue: 'all' | 'gainers' | 'losers') => void;
  onNavigateToDetail: (ticker: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 28) }]}>
      <ScreenHeader
        title="Markets"
        eyebrow="8 IDX equities · open 24/7"
        right={
          <View style={styles.headerRight}>
            <View style={styles.liveBadge}>
              <PulsarDot size={7} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Pressable onPress={toggleTheme} style={styles.themeToggle}>
              <Icon name={isDark ? 'sun' : 'moon'} size={16} color={colors.body} />
            </Pressable>
          </View>
        }
      />
      <View style={styles.filters}>
        <SearchBox value={searchQuery} onChange={setSearchQuery} />
        <Segmented
          value={activeFilter}
          onChange={setActiveFilter as any}
          size="sm"
          options={[{ value: 'all', label: 'All' }, { value: 'gainers', label: 'Gainers' }, { value: 'losers', label: 'Losers' }]}
        />
      </View>
      <PriceTicker />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        showsVerticalScrollIndicator={false}
      >
        {marketsList.map((token, index) => {
          const isPriceUp = (token.change24h ?? 0) >= 0;
          return (
            <Pressable
              key={token.ticker}
              onPress={() => onNavigateToDetail(token.ticker)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View style={[styles.row, { borderBottomWidth: index < marketsList.length - 1 ? 1 : 0 }]}>
                <TokenAvatar ticker={token.ticker} size={42} />
                <View style={styles.flex1}>
                  <View style={styles.nameRow}>
                    <Text style={styles.tickerText}>{token.ticker}</Text>
                    <Mono style={styles.ipoText}>{token.ipo}</Mono>
                  </View>
                  <Text numberOfLines={1} style={styles.nameText}>{token.name.replace('Pulsar ', '')}</Text>
                </View>
                <View style={styles.sparkBox}>
                  <Spark data={seriesFor(token.ticker, 20)} w={52} h={24} color={isPriceUp ? colors.positive : colors.merah} />
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceText}>{fmtUSD(token.price, { min: 4, max: 4 })}</Text>
                  <Text style={[styles.changeText, { color: isPriceUp ? colors.positive : colors.merah }]}>{fmtPct(token.change24h)}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
        {marketsList.length === 0 && (
          <View style={styles.emptyStateBox}>
            <Icon name="search" size={26} color={colors.body} />
            <Text style={styles.emptyStateText}>No equities match "{searchQuery}"</Text>
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

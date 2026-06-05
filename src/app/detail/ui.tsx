import React, { useMemo } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ScreenHeader, Eyebrow, Mono, Icon, Card, TokenAvatar, AreaChart, Segmented } from '@/components/CoreUI';
import { fmtUSD, fmtPct, fmtNum } from '@/lib/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';
import { makeStyles } from './style';

export function DetailUI({
  ticker, token,
  selectedRange, setSelectedRange,
  chartData, isPriceUp,
  quantity, totalValue, averageCost, profitAndLoss, profitAndLossPercent,
  onNavigateBack, onExecuteTrade,
}: any) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const buyScale = useSharedValue(1);
  const sellScale = useSharedValue(1);
  const buyStyle = useAnimatedStyle(() => ({ transform: [{ scale: buyScale.value }] }));
  const sellStyle = useAnimatedStyle(() => ({ transform: [{ scale: sellScale.value }] }));

  const pressTrade = (side: 'buy' | 'sell') => {
    if (side === 'sell' && quantity <= 0) return;
    onExecuteTrade?.(side, ticker);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 28) }]}>
      <ScreenHeader
        onBack={onNavigateBack}
        title={ticker}
        eyebrow={`${token.sector} · ${token.ipo}`}
        right={<TokenAvatar ticker={ticker} size={40} />}
        large={false}
      />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 14 }}
      >
        <View style={styles.pad}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLarge}>{fmtUSD(token.price, { min: 4, max: 4 })}</Text>
            <Text style={[styles.priceChange, { color: isPriceUp ? colors.positive : colors.merah }]}>
              {isPriceUp ? '▲' : '▼'} {fmtPct(token.change24h)}
            </Text>
          </View>
          <Text style={styles.priceDesc}>{token.name} · backed 1:1 at KSEI</Text>
        </View>

        <View style={styles.chartBox}>
          <AreaChart
            data={chartData}
            range={selectedRange}
            height={196}
            valueFormatter={(value) => `$${value.toFixed(4)}`}
          />
        </View>

        <View style={styles.segmentedBox}>
          <Segmented
            value={selectedRange}
            onChange={setSelectedRange}
            options={['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((rangeValue) => ({ value: rangeValue as typeof selectedRange, label: rangeValue }))}
          />
        </View>

        {quantity > 0 && (
          <View style={styles.posBox}>
            <Card pad={15}>
              <Eyebrow style={{ marginBottom: 10 }}>Your position</Eyebrow>
              <View style={styles.posRow}>
                <View>
                  <Mono style={styles.posVal}>{fmtUSD(totalValue)}</Mono>
                  <Text style={styles.posQty}>{fmtNum(quantity, 0)} {ticker}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Mono style={[styles.posPnl, { color: profitAndLoss >= 0 ? colors.positive : colors.merah }]}>
                    {profitAndLoss >= 0 ? '+' : ''}{fmtUSD(profitAndLoss)}
                  </Mono>
                  <Text style={[styles.posSub, { color: profitAndLoss >= 0 ? colors.positive : colors.merah }]}>
                    {fmtPct(profitAndLossPercent)} · avg {fmtUSD(averageCost, { min: 4, max: 4 })}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.gridBox}>
          {[
            ['24h change', fmtPct(token.change24h), isPriceUp ? colors.positive : colors.merah],
            ['Sector', token.sector ?? '—', colors.ink],
            ['Token supply', fmtNum(token.supply, 0), colors.ink],
            ['IDX ref', token.ipo ?? '—', colors.ink],
          ].map(([label, value, textColor], index) => (
            <View key={String(label)} style={[styles.gridItem, { flexGrow: 1 }]}>
              <Eyebrow style={styles.gridEyebrow}>{label}</Eyebrow>
              <Mono style={[styles.gridValue, { color: textColor as string }]}>{value}</Mono>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Icon name="check" color="#fff" size={16} />
            </View>
            <Text style={styles.infoText}>
              Every {ticker} is a real {token.ipo} share held by a licensed custodian. Price comes from the on-chain pool — no oracle to game.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(34, insets.bottom + 16) }]}>
        <Pressable
          onPressIn={() => { buyScale.value = withTiming(0.97, { duration: 70 }); pressTrade('buy'); }}
          onPressOut={() => { buyScale.value = withTiming(1, { duration: 120 }); }}
          style={{ flex: 1 }}
        >
          <Animated.View style={[styles.tradeButton, styles.tradeButtonBuy, buyStyle]}>
            <Text style={styles.tradeButtonBuyText}>Buy</Text>
          </Animated.View>
        </Pressable>
        <Pressable
          disabled={quantity <= 0}
          onPressIn={() => { sellScale.value = withTiming(0.97, { duration: 70 }); pressTrade('sell'); }}
          onPressOut={() => { sellScale.value = withTiming(1, { duration: 120 }); }}
          style={{ flex: 1, opacity: quantity <= 0 ? 0.5 : 1 }}
        >
          <Animated.View style={[styles.tradeButton, styles.tradeButtonSell, sellStyle]}>
            <Text style={styles.tradeButtonSellText}>Sell</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

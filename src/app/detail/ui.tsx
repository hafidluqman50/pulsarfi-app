import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ScreenHeader, Eyebrow, Mono, Icon, Card, TokenAvatar, AreaChart, Segmented } from '@/components/CoreUI';
import { fmtIDRX, fmtPct, fmtNum } from '@/lib/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';
import { makeStyles } from './style';

function SkeletonPulse({ style }: { style: any }) {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[style, anim]} />;
}

export function DetailUI({
  ticker, tokenMeta, currentPrice, change24hPct, tokenSupply, isReservesLoading,
  selectedRange, setSelectedRange,
  chartData, isPriceUp,
  quantity, totalValue, averageCost, profitAndLoss, profitAndLossPercent,
  isLoading,
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

  const sectorText = tokenMeta?.sector ?? '—';
  const idxTicker = tokenMeta?.idx_ticker ?? '—';
  const stockName = tokenMeta?.stock_name ?? '—';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 28) }]}>
      <ScreenHeader
        onBack={onNavigateBack}
        title={ticker}
        eyebrow={isLoading ? 'Loading...' : `${sectorText} · ${idxTicker}`}
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
            {isLoading && currentPrice === 0 ? (
              <SkeletonPulse style={{ width: 150, height: 42, borderRadius: 8, backgroundColor: colors.surface2 }} />
            ) : (
              <Text style={styles.priceLarge}>{fmtIDRX(currentPrice)}</Text>
            )}
            
            {isLoading && currentPrice === 0 ? (
              <SkeletonPulse style={{ width: 60, height: 24, borderRadius: 6, backgroundColor: colors.surface2, marginLeft: 10 }} />
            ) : (
              <Text style={[styles.priceChange, { color: isPriceUp ? colors.positive : colors.merah }]}>
                {isPriceUp ? '▲' : '▼'} {fmtPct(change24hPct)}
              </Text>
            )}
          </View>
          
          {isLoading && currentPrice === 0 ? (
            <SkeletonPulse style={{ width: 220, height: 16, borderRadius: 4, backgroundColor: colors.surface2, marginTop: 8 }} />
          ) : (
            <Text style={styles.priceDesc}>{stockName} · backed 1:1 at KSEI</Text>
          )}
        </View>

        <View style={styles.chartBox}>
          {isLoading || chartData.length === 0 ? (
            <View style={{ height: 196, justifyContent: 'center', alignItems: 'center' }}>
              <SkeletonPulse style={{ width: '100%', height: 196, backgroundColor: colors.surface }} />
            </View>
          ) : (
            <AreaChart
              data={chartData}
              range={selectedRange}
              height={196}
              valueFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
            />
          )}
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
                  {isLoading && currentPrice === 0 ? (
                    <SkeletonPulse style={{ width: 100, height: 24, borderRadius: 4, backgroundColor: colors.surface2, marginBottom: 4 }} />
                  ) : (
                    <Mono style={styles.posVal}>{fmtNum(quantity, 0)} {ticker}</Mono>
                  )}
                  {isLoading && currentPrice === 0 ? (
                    <SkeletonPulse style={{ width: 120, height: 16, borderRadius: 4, backgroundColor: colors.surface2 }} />
                  ) : (
                    <Text style={styles.posQty}>
                      avg {fmtIDRX(averageCost)}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {isLoading && currentPrice === 0 ? (
                    <SkeletonPulse style={{ width: 80, height: 20, borderRadius: 4, backgroundColor: colors.surface2, marginBottom: 6 }} />
                  ) : (
                    <Mono style={styles.posVal}>
                      {fmtIDRX(totalValue)}
                    </Mono>
                  )}
                  
                  {isLoading && currentPrice === 0 ? (
                    <SkeletonPulse style={{ width: 60, height: 16, borderRadius: 4, backgroundColor: colors.surface2 }} />
                  ) : (
                    <Text style={[styles.posSub, { color: profitAndLoss >= 0 ? colors.positive : colors.merah }]}>
                      {profitAndLoss >= 0 ? '+' : ''}{fmtIDRX(profitAndLoss)} ({fmtPct(profitAndLossPercent)})
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.gridBox}>
          {[
            ['24h change', isLoading && currentPrice === 0 ? '—' : fmtPct(change24hPct), isPriceUp ? colors.positive : colors.merah],
            ['Sector', isLoading ? '—' : sectorText, colors.ink],
            ['Token supply', isReservesLoading ? 'Loading...' : (tokenSupply != null ? `${fmtNum(tokenSupply, 0)} ${ticker}` : '—'), colors.ink],
            ['Pool price', isLoading ? '—' : (tokenMeta?.pool_price ? fmtIDRX(tokenMeta.pool_price) : '—'), colors.ink],
            ['IDX ref', isLoading ? '—' : idxTicker, colors.ink],
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
              Every {ticker} is a real {idxTicker !== '—' ? idxTicker : 'share'} held by a licensed custodian. Price comes from the on-chain pool — no oracle to game.
            </Text>
          </View>
        </View>
      </ScrollView>

      {ticker !== 'IHSG' && (
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
      )}
    </View>
  );
}

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, Eyebrow, Mono, Icon, Card, Donut, AreaChart, Segmented, TokenAvatar, fonts } from '@/components/CoreUI';
import { fmtAmt, fmtUSD, fmtPct } from '@/lib/mockData';
import { useColors } from '@/lib/theme';
import { makeStyles } from './style';

export function PortfolioUI({
  selectedRange, setSelectedRange,
  holdingsList,
  totalPortfolioValue,
  totalProfitLoss,
  totalProfitLossPercent,
  chartData,
  dailyChange,
  dailyChangePercent,
  colorPalette,
  onNavigateToToken,
}: any) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 28) }]}>
      <ScreenHeader
        title="Holdings"
        eyebrow="Your tokenized portfolio"
        right={
          <Pressable style={{ width: 38, height: 38, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline, borderRadius: 99, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="copy" color={colors.ink} size={16} />
          </Pressable>
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pad}>
          <Text style={styles.heroAmount}>{fmtUSD(totalPortfolioValue)}</Text>
          <View style={styles.heroRow}>
            <Text style={[styles.heroChange, { color: dailyChange >= 0 ? colors.positive : colors.merah }]}>
              {dailyChange >= 0 ? '▲' : '▼'} {fmtUSD(Math.abs(dailyChange))} ({fmtPct(dailyChangePercent)})
            </Text>
            <Text style={styles.heroRange}>{selectedRange}</Text>
          </View>
        </View>

        <View style={styles.chartBox}>
          <AreaChart
            data={chartData}
            range={selectedRange}
            height={150}
            valueFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
          />
        </View>

        <View style={styles.segmentedBox}>
          <Segmented
            value={selectedRange}
            onChange={setSelectedRange}
            options={['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((r) => ({ value: r as typeof selectedRange, label: r }))}
          />
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard} pad={14}>
            <Eyebrow style={styles.statTitle}>Total P&L</Eyebrow>
            <Mono style={[styles.statValue, { color: totalProfitLoss >= 0 ? colors.positive : colors.merah }]}>
              {totalProfitLoss >= 0 ? '+' : ''}{fmtUSD(totalProfitLoss)}
            </Mono>
            <Text style={[styles.statSub, { color: totalProfitLoss >= 0 ? colors.positive : colors.merah }]}>
              {fmtPct(totalProfitLossPercent)}
            </Text>
          </Card>
          <Card style={styles.statCard} pad={14}>
            <Eyebrow style={styles.statTitle}>Positions</Eyebrow>
            <Mono style={styles.statValue}>{holdingsList.filter((h: any) => !h.isStable).length}</Mono>
            <Text style={styles.stableText}>
              + {holdingsList.filter((h: any) => h.isStable).length} stable
            </Text>
          </Card>
        </View>

        <View style={styles.allocBox}>
          <Card>
            <Eyebrow style={{ marginBottom: 12 }}>Allocation</Eyebrow>
            <View style={styles.allocRow}>
              <View>
                <Donut data={holdingsList.map((h: any) => ({ label: h.tk, v: h.value }))} palette={colorPalette} />
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCount}>{holdingsList.length}</Text>
                  <Eyebrow style={styles.donutLabel}>assets</Eyebrow>
                </View>
              </View>
              <View style={styles.legendCol}>
                {holdingsList.slice(0, 5).map((holding: any, index: number) => (
                  <View key={holding.tk} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: colorPalette[index % colorPalette.length] }]} />
                    <Text style={styles.legendToken}>{holding.tk}</Text>
                    <Mono style={styles.legendPct}>{((holding.value / totalPortfolioValue) * 100).toFixed(0)}%</Mono>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.posTitle}>
          <Eyebrow>Positions</Eyebrow>
        </View>

        <View style={styles.posList}>
          {holdingsList.map((holding: any, index: number) => (
            <Pressable
              key={holding.tk}
              disabled={holding.isStable}
              onPress={() => onNavigateToToken(holding.tk)}
              style={[styles.posItem, { borderBottomWidth: index < holdingsList.length - 1 ? 1 : 0, borderBottomColor: colors.hairline }]}
            >
              <TokenAvatar ticker={holding.tk} size={38} />
              <View style={styles.posFlex}>
                <Text style={styles.posTicker}>{holding.tk}</Text>
                <Mono style={styles.posSub}>{fmtAmt(holding.qty)} · {fmtUSD(holding.t.price, { min: 4, max: 4 })}</Mono>
              </View>
              <View style={styles.posRight}>
                <Mono style={styles.posValue}>{fmtUSD(holding.value)}</Mono>
                {!holding.isStable && (
                  <Mono style={[styles.posPnl, { color: holding.pnl >= 0 ? colors.positive : colors.merah }]}>
                    {holding.pnl >= 0 ? '+' : ''}{fmtPct(holding.pnlPct)}
                  </Mono>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

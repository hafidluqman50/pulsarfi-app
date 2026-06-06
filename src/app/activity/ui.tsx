import React, { useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, Segmented, Eyebrow, Mono, Icon, IconName } from '@/components/CoreUI';
import { ActivityItem, fmtAmt, fmtIDRX } from '@/lib/mockData';
import { useColors } from '@/lib/theme';
import { makeStyles } from './style';

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getSwapMeta(item: ActivityItem, colors: any): { label: string; icon: IconName; tint: string } {
  const isBuy = item.payTicker === 'IDRX';
  const isSell = item.recvTicker === 'IDRX';
  if (isBuy) return { label: 'Buy', icon: 'arrow-down', tint: colors.positive };
  if (isSell) return { label: 'Sell', icon: 'arrow-up', tint: colors.merah };
  return { label: 'Swap', icon: 'swap', tint: colors.ink };
}

export function ActivityUI({
  activeFilter,
  setActiveFilter,
  activityGroups,
}: {
  activeFilter: 'all' | 'swaps' | 'custody';
  setActiveFilter: (value: 'all' | 'swaps' | 'custody') => void;
  activityGroups: { key: string; items: ActivityItem[] }[];
}) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Activity" eyebrow="On-chain · Arbitrum" />
      <View style={styles.filters}>
        <Segmented
          value={activeFilter}
          onChange={setActiveFilter as any}
          options={[{ value: 'all', label: 'All' }, { value: 'swaps', label: 'Swaps' }, { value: 'custody', label: 'Custody' }]}
          size="sm"
        />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={activeFilter} entering={FadeIn.duration(180)}>
          {activityGroups.map((group) => (
            <View key={group.key}>
              <Eyebrow style={styles.groupLabel}>{group.key}</Eyebrow>
              <View style={styles.card}>
                {group.items.map((item, index) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    isLast={index === group.items.length - 1}
                    colors={colors}
                    styles={styles}
                  />
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

function ActivityRow({ item, isLast, colors, styles }: { item: ActivityItem; isLast: boolean; colors: any; styles: any }) {
  const swapMeta = item.kind === 'swap' ? getSwapMeta(item, colors) : null;

  const metaMap: Record<Exclude<ActivityItem['kind'], 'swap'>, { label: string; icon: IconName; tint: string }> = {
    mint: { label: 'Mint', icon: 'arrow-down', tint: colors.positive },
    redeem: { label: 'Redeem', icon: 'arrow-up', tint: colors.merah },
    receive: { label: 'Received', icon: 'arrow-down', tint: colors.positive },
  };

  const meta = item.kind === 'swap' ? swapMeta! : metaMap[item.kind];
  const isBuy = item.kind === 'swap' && item.payTicker === 'IDRX';
  const isSell = item.kind === 'swap' && item.recvTicker === 'IDRX';

  let title: string;
  if (item.kind === 'swap') {
    if (isBuy) title = `Buy ${item.recvTicker}`;
    else if (isSell) title = `Sell ${item.payTicker}`;
    else title = `${item.payTicker} → ${item.recvTicker}`;
  } else if (item.kind === 'redeem') {
    title = `${item.payTicker} → IDX shares`;
  } else if (item.kind === 'mint') {
    title = `Minted ${item.recvTicker}`;
  } else {
    title = `${item.recvTicker}`;
  }

  let primaryAmount: string;
  if (item.kind === 'swap') {
    if (isBuy) primaryAmount = `+${fmtAmt(item.recvAmt)} ${item.recvTicker}`;
    else primaryAmount = `-${fmtAmt(item.payAmt)} ${item.payTicker}`;
  } else if (item.kind === 'redeem') {
    primaryAmount = `-${fmtAmt(item.payAmt)} ${item.payTicker}`;
  } else {
    primaryAmount = `+${fmtAmt(item.recvAmt)} ${item.recvTicker}`;
  }

  const amountColor = isBuy || item.kind === 'mint' || item.kind === 'receive'
    ? colors.positive
    : colors.merah;

  return (
    <View style={[styles.row, { borderBottomWidth: isLast ? 0 : 1 }]}>
      <View style={[styles.iconBox, { borderColor: meta.tint + '33' }]}>
        <Icon name={meta.icon} color={meta.tint} size={18} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          <Text style={{ color: meta.tint }}>● </Text>
          {meta.label} · {formatTime(item.time)}
        </Text>
      </View>
      <View style={styles.rightAligned}>
        <Mono style={[styles.primaryValue, { color: amountColor }]}>{primaryAmount}</Mono>
        <Mono style={styles.usdValue}>{fmtIDRX(item.idrx)}</Mono>
      </View>
    </View>
  );
}

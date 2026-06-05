import React, { useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, Segmented, Eyebrow, Mono, Icon, IconName } from '@/components/CoreUI';
import { ActivityItem, fmtAmt, fmtUSD } from '@/lib/mockData';
import { useColors } from '@/lib/theme';
import { makeStyles } from './style';

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 28) }]}>
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
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

function ActivityRow({ item, isLast, colors, styles }: { item: ActivityItem; isLast: boolean; colors: any; styles: any }) {
  const metadata: Record<ActivityItem['kind'], { label: string; icon: IconName; tint: string }> = {
    swap: { label: 'Swap', icon: 'swap', tint: colors.ink },
    mint: { label: 'Mint', icon: 'arrow-down', tint: colors.positive },
    redeem: { label: 'Redeem', icon: 'arrow-up', tint: colors.merah },
    receive: { label: 'Received', icon: 'arrow-down', tint: colors.positive },
  };
  const meta = metadata[item.kind];

  const title = item.kind === 'swap' ? `${item.payTicker} → ${item.recvTicker}` : item.kind === 'redeem' ? `${item.payTicker} → IDX shares` : item.kind === 'mint' ? `Minted ${item.recvTicker}` : `${item.recvTicker}`;
  const primaryAmount = item.kind === 'swap' ? `+${fmtAmt(item.recvAmt)} ${item.recvTicker}` : item.kind === 'redeem' ? `-${fmtAmt(item.payAmt)} ${item.payTicker}` : `+${fmtAmt(item.recvAmt)} ${item.recvTicker}`;

  return (
    <View style={[styles.row, { borderBottomWidth: isLast ? 0 : 1 }]}>
      <View style={styles.iconBox}>
        <Icon name={meta.icon} color={meta.tint} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}><Text style={{ color: colors.positive }}>● </Text>{meta.label} · {formatTime(item.time)}</Text>
      </View>
      <View style={styles.rightAligned}>
        <Mono style={[styles.primaryValue, { color: item.kind === 'redeem' ? colors.merah : colors.ink }]}>{primaryAmount}</Mono>
        <Mono style={styles.usdValue}>{fmtUSD(item.usd)}</Mono>
      </View>
    </View>
  );
}

import { StyleSheet } from 'react-native';
import { fonts } from '@/components/CoreUI';
import type { Colors } from '@/lib/theme';

export const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas },
  pad: { paddingHorizontal: 18 },
  filters: { paddingHorizontal: 18, gap: 10, paddingTop: 4, paddingBottom: 10 },
  tickerRow: { backgroundColor: c.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.hairline, paddingVertical: 8, overflow: 'hidden' },
  tickerTrack: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 9, borderBottomColor: c.hairline },
  flex1: { flex: 1, minWidth: 0 },
  sparkBox: { width: 52 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7 },
  tickerText: { fontFamily: fonts.sansSemi, color: c.ink, fontSize: 15 },
  ipoText: { fontFamily: fonts.mono, color: c.body, fontSize: 9, letterSpacing: 2 },
  nameText: { fontFamily: fonts.sans, color: c.body, fontSize: 12.5 },
  priceBox: { minWidth: 76, alignItems: 'flex-end' },
  priceText: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: c.ink },
  changeText: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { fontFamily: fonts.sansSemi, color: c.positive, fontSize: 11 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  themeToggle: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 99, borderWidth: 1, borderColor: c.hairline, backgroundColor: c.surface },
  emptyStateBox: { paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center' },
  emptyStateText: { marginTop: 10, fontSize: 14, fontFamily: fonts.sans, color: c.body },
  bottomPadding: { height: 10 },
});

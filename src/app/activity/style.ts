import { StyleSheet } from 'react-native';
import { fonts } from '@/components/CoreUI';
import type { Colors } from '@/lib/theme';

export const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas },
  filters: { paddingHorizontal: 18, paddingBottom: 10 },
  groupLabel: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 },
  card: { marginHorizontal: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.hairline, borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomColor: c.hairline },
  iconBox: { width: 38, height: 38, borderRadius: 11, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.hairline, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1, marginLeft: 13 },
  title: { fontFamily: fonts.sansSemi, color: c.ink, fontSize: 14 },
  subtitle: { fontFamily: fonts.sans, color: c.body, fontSize: 12 },
  rightAligned: { alignItems: 'flex-end' },
  primaryValue: { fontSize: 13.5, fontWeight: '700' },
  usdValue: { color: c.body, fontSize: 11.5 },
  bottomPadding: { height: 12 },
});

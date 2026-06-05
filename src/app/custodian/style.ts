import { StyleSheet } from 'react-native';
import { fonts } from '@/components/CoreUI';
import type { Colors } from '@/lib/theme';

export const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas },
  pad: { paddingHorizontal: 18 },
  reserveCard: { marginHorizontal: 18, backgroundColor: '#16110e', borderColor: '#16110e', padding: 16 },
  reserveValue: { fontFamily: fonts.display, color: '#fff', fontSize: 34, marginTop: 6, letterSpacing: -0.68 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 14 },
  statVal: { fontFamily: fonts.mono, fontSize: 16, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,.5)', marginTop: 2 },
  custodiansScroll: { paddingHorizontal: 18, gap: 8 },
  custodianPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 8, paddingRight: 12, backgroundColor: c.surface, borderWidth: 1, borderRadius: 99 },
  custodianDot: { width: 26, height: 26, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  proposalCard: { marginHorizontal: 18, padding: 15, marginBottom: 10 },
  pRow1: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 },
  pIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.hairline },
  pTitle: { fontFamily: fonts.sansSemi, color: c.ink, fontSize: 15 },
  pNote: { fontFamily: fonts.sans, color: c.body, fontSize: 12 },
  pRow2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  signerPips: { flexDirection: 'row', gap: 5 },
  pip: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  pipText: { fontFamily: fonts.mono, fontSize: 9.5, fontWeight: '700' },
  pProgressBg: { height: 5, borderRadius: 99, backgroundColor: c.surface2, overflow: 'hidden', marginBottom: 13 },
});

import { StyleSheet } from 'react-native';
import { fonts } from '@/components/CoreUI';
import type { Colors } from '@/lib/theme';

export const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.canvas },
  pad: { paddingHorizontal: 18, paddingBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  priceLarge: { fontFamily: fonts.display, color: c.ink, fontSize: 38, lineHeight: 38, letterSpacing: -0.76 },
  priceChange: { fontFamily: fonts.sansSemi, fontSize: 15, paddingBottom: 5 },
  priceDesc: { fontFamily: fonts.sans, color: c.body, fontSize: 13, marginTop: 4 },
  chartBox: { paddingHorizontal: 6, paddingTop: 4 },
  segmentedBox: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  posBox: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 2 },
  posRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  posVal: { fontSize: 22, fontWeight: '700' },
  posQty: { fontFamily: fonts.sans, color: c.body, fontSize: 12.5, marginTop: 2 },
  posPnl: { fontSize: 15, fontWeight: '700' },
  posSub: { fontFamily: fonts.sansSemi, fontSize: 12 },
  gridBox: { marginHorizontal: 18, marginTop: 12, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: c.hairline, backgroundColor: c.hairline, flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  gridItem: { backgroundColor: c.surface, width: '49.8%', paddingHorizontal: 15, paddingVertical: 13 },
  gridEyebrow: { fontSize: 9, marginBottom: 5 },
  gridValue: { fontSize: 14, fontWeight: '700' },
  infoBox: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 0 },
  infoCard: { flexDirection: 'row', backgroundColor: c.surface2, borderWidth: 1, borderColor: c.hairline, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, gap: 11 },
  infoIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#16110e', alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, fontFamily: fonts.sans, color: c.inkSoft, fontSize: 12.5, lineHeight: 18.75 },
  bottomBar: { flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.hairline, paddingHorizontal: 18, paddingTop: 12, gap: 10 },
  tradeButton: { height: 56, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tradeButtonBuy: { backgroundColor: '#16110e', borderColor: '#16110e' },
  tradeButtonSell: { backgroundColor: 'transparent', borderColor: c.hairlineStrong },
  tradeButtonBuyText: { color: '#fbfaf7', fontFamily: fonts.sansSemi, fontSize: 15 },
  tradeButtonSellText: { color: c.ink, fontFamily: fonts.sansSemi, fontSize: 15 },
});

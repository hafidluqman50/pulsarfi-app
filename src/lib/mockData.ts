export type Token = {
  ticker: string;
  name: string;
  sector?: string;
  price: number;
  change24h?: number;
  supply?: number;
  ipo?: string;
  isStable?: boolean;
};

export type Portfolio = Record<string, number>;

export type ActivityItem = {
  id: string;
  kind: 'swap' | 'mint' | 'redeem' | 'receive';
  payTicker?: string;
  payAmt?: number;
  recvTicker?: string;
  recvAmt?: number;
  usd: number;
  time: Date;
  status: 'confirmed' | 'pending';
  hash: string;
};

export const PSTOCKS: Token[] = [
  { ticker: 'pBUMI', name: 'Pulsar Bumi Resources', sector: 'Energy', price: 0.0152, change24h: 4.21, supply: 18240000, ipo: 'BUMI' },
  { ticker: 'pENRG', name: 'Pulsar Energi Mega', sector: 'Energy', price: 0.0234, change24h: 1.84, supply: 12400000, ipo: 'ENRG' },
  { ticker: 'pKIJA', name: 'Pulsar Kawasan Industri', sector: 'Infrastructure', price: 0.0089, change24h: -0.61, supply: 9120000, ipo: 'KIJA' },
  { ticker: 'pTLKM', name: 'Pulsar Telkom Indonesia', sector: 'Telecom', price: 0.1842, change24h: 0.42, supply: 6800000, ipo: 'TLKM' },
  { ticker: 'pBBRI', name: 'Pulsar Bank Rakyat', sector: 'Financial', price: 0.2961, change24h: -1.12, supply: 5240000, ipo: 'BBRI' },
  { ticker: 'pGOTO', name: 'Pulsar GoTo Gojek Tokopedia', sector: 'Technology', price: 0.0061, change24h: 7.93, supply: 28900000, ipo: 'GOTO' },
  { ticker: 'pASII', name: 'Pulsar Astra International', sector: 'Industrials', price: 0.3214, change24h: 0.18, supply: 4120000, ipo: 'ASII' },
  { ticker: 'pUNVR', name: 'Pulsar Unilever Indonesia', sector: 'Consumer', price: 0.1487, change24h: -0.34, supply: 3840000, ipo: 'UNVR' },
];

export const STABLES: Token[] = [
  { ticker: 'USDC', name: 'USD Coin', price: 1, isStable: true },
  { ticker: 'USDT', name: 'Tether', price: 1, isStable: true },
];

export const ALL_TOKENS = [...STABLES, ...PSTOCKS];

export const DEFAULT_PORTFOLIO: Portfolio = {
  USDC: 12480.42,
  pBUMI: 84320,
  pENRG: 21500,
  pTLKM: 4120,
  pGOTO: 156400,
};

export const DEFAULT_COST_BASIS: Portfolio = {
  USDC: 1,
  USDT: 1,
  pBUMI: 0.01248,
  pENRG: 0.0251,
  pTLKM: 0.1892,
  pBBRI: 0.3042,
  pGOTO: 0.00481,
  pKIJA: 0.0094,
  pASII: 0.325,
  pUNVR: 0.151,
};

export function tokenByTicker(ticker: string) {
  return ALL_TOKENS.find((token) => token.ticker === ticker) ?? ALL_TOKENS[0];
}

export function seriesFor(ticker: string, points = 24) {
  let seed = 0;
  for (const c of ticker) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rng = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 0xffffffff;
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < points; i += 1) {
    v += (rng() - 0.5) * 6 + (rng() - 0.45) * 2;
    out.push(v);
  }
  return out;
}

export function priceSeries(ticker: string, price: number, days = 365) {
  let seed = 0;
  for (const c of ticker) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rng = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 0xffffffff;
  const out: { t: number; v: number }[] = [];
  const today = new Date(2026, 4, 23);
  let v = price * (0.78 + rng() * 0.12);
  const drift = (price - v) / days;
  for (let i = 0; i < days; i += 1) {
    const noise = (rng() - 0.5) * price * 0.03;
    const event = rng() < 0.02 ? (rng() - 0.45) * price * 0.07 : 0;
    v = Math.max(price * 0.4, v + drift + noise + event);
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    out.push({ t: d.getTime(), v });
  }
  out[out.length - 1].v = price;
  return out;
}

export function portfolioTimeSeries(seedTicker = 'PORTFOLIO', days = 365, start = 18000, end = 26840) {
  let seed = 0;
  for (const c of seedTicker) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rng = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 0xffffffff;
  const out: { t: number; v: number }[] = [];
  const trend = (end - start) / days;
  let v = start;
  const today = new Date(2026, 4, 23);
  for (let i = 0; i < days; i += 1) {
    const noise = (rng() - 0.5) * v * 0.018;
    const event = rng() < 0.015 ? (rng() - 0.4) * v * 0.06 : 0;
    v = Math.max(start * 0.6, v + trend + noise + event);
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    out.push({ t: d.getTime(), v });
  }
  return out;
}

export function sliceRange(series: { t: number; v: number }[], range: string) {
  const map: Record<string, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, ALL: series.length };
  const n = Math.min(series.length, map[range] || 30);
  if (range === '1D') {
    const last = series[series.length - 1].v;
    const prev = series[series.length - 2]?.v ?? last;
    const today = new Date(2026, 4, 23);
    return Array.from({ length: 24 }, (_, h) => {
      const frac = h / 23;
      const drift = prev + (last - prev) * frac;
      const noise = Math.sin(h * 0.6) * last * 0.004;
      const d = new Date(today);
      d.setHours(h, 0, 0, 0);
      return { t: d.getTime(), v: drift + noise };
    });
  }
  return series.slice(series.length - n);
}

export function seedActivity(): ActivityItem[] {
  const now = new Date(2026, 4, 23, 9, 30);
  const mk = (mins: number, o: Omit<ActivityItem, 'id' | 'time' | 'status' | 'hash'>): ActivityItem => ({
    id: Math.random().toString(36).slice(2),
    time: new Date(now.getTime() - mins * 60000),
    status: 'confirmed',
    hash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
    ...o,
  });
  return [
    mk(52, { kind: 'swap', payTicker: 'USDC', payAmt: 500, recvTicker: 'pGOTO', recvAmt: 81530, usd: 500 }),
    mk(220, { kind: 'swap', payTicker: 'pTLKM', payAmt: 1200, recvTicker: 'USDC', recvAmt: 220.4, usd: 221.04 }),
    mk(1490, { kind: 'mint', recvTicker: 'pBUMI', recvAmt: 12000, usd: 182.4 }),
    mk(1750, { kind: 'receive', recvTicker: 'USDC', recvAmt: 2000, usd: 2000 }),
    mk(2880, { kind: 'swap', payTicker: 'USDC', payAmt: 1500, recvTicker: 'pENRG', recvAmt: 63800, usd: 1500 }),
    mk(7200, { kind: 'redeem', payTicker: 'pUNVR', payAmt: 800, usd: 119 }),
  ];
}

export function fmtUSD(n: number | undefined, opts: { min?: number; max?: number } = {}) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts.min ?? 2,
    maximumFractionDigits: opts.max ?? 2,
  });
}

export function fmtAmt(n: number | undefined) {
  if (!n || Number.isNaN(n)) return '0';
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

export function fmtNum(n: number | undefined, max = 4) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: max });
}

export function fmtPct(n: number | undefined) {
  if (n == null || Number.isNaN(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function shortAddr(a: string) {
  if (!a) return '';
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function fmtAxisDate(t: number, range: string) {
  const d = new Date(t);
  if (range === '1D') return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (range === '1W') return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit' });
  if (range === '1Y' || range === 'ALL') return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export const TOKEN_STYLE: Record<string, { fill: string; glyph: string }> = {
  pBUMI: { fill: '#16110e', glyph: 'B' },
  pENRG: { fill: '#c8102e', glyph: 'E' },
  pKIJA: { fill: '#2a231e', glyph: 'K' },
  pTLKM: { fill: '#1f4d8a', glyph: 'T' },
  pBBRI: { fill: '#9a0c24', glyph: 'R' },
  pGOTO: { fill: '#16110e', glyph: 'G' },
  pASII: { fill: '#5a4a3a', glyph: 'A' },
  pUNVR: { fill: '#1a3a6e', glyph: 'U' },
  USDC: { fill: '#2775ca', glyph: '$' },
  USDT: { fill: '#26a17b', glyph: 'T' },
};

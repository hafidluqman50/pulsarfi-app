export type Token = {
	ticker: string;
	name: string;
	sector?: string;
	price: number;
	change24h?: number;
	supply?: number;
	ipo?: string;
	isStable?: boolean;
	sparkline?: number[];
	contractAddress?: string;
};

export type Portfolio = Record<string, number>;

export type ActivityItem = {
	id: string;
	kind: "swap" | "mint" | "redeem" | "receive";
	payTicker?: string;
	payAmt?: number;
	recvTicker?: string;
	recvAmt?: number;
	idrx: number;
	time: Date;
	status: "confirmed" | "pending";
	hash: string;
};

export const PSTOCKS: Token[] = [
	{
		ticker: "BBCAP",
		name: "Pulsar Bank Central Asia",
		sector: "Financial",
		price: 10025,
		change24h: 0.54,
		supply: 4200000,
		ipo: "BBCA",
	},
	{
		ticker: "BMRIP",
		name: "Pulsar Bank Mandiri",
		sector: "Financial",
		price: 5650,
		change24h: -0.88,
		supply: 5100000,
		ipo: "BMRI",
	},
	{
		ticker: "BBRIP",
		name: "Pulsar Bank Rakyat Indonesia",
		sector: "Financial",
		price: 4150,
		change24h: -1.12,
		supply: 5240000,
		ipo: "BBRI",
	},
	{
		ticker: "BDMNP",
		name: "Pulsar Bank Danamon",
		sector: "Financial",
		price: 1810,
		change24h: 1.34,
		supply: 3100000,
		ipo: "BDMN",
	},
	{
		ticker: "PTROP",
		name: "Pulsar Petrosea",
		sector: "Energy",
		price: 3150,
		change24h: 2.71,
		supply: 2800000,
		ipo: "PTRO",
	},
	{
		ticker: "BRPTP",
		name: "Pulsar Barito Pacific",
		sector: "Energy",
		price: 965,
		change24h: 0.18,
		supply: 6300000,
		ipo: "BRPT",
	},
	{
		ticker: "ENRGP",
		name: "Pulsar Energi Mega Persada",
		sector: "Energy",
		price: 78,
		change24h: 1.84,
		supply: 12400000,
		ipo: "ENRG",
	},
	{
		ticker: "BUMIP",
		name: "Pulsar Bumi Resources",
		sector: "Energy",
		price: 90,
		change24h: 4.21,
		supply: 18240000,
		ipo: "BUMI",
	},
];

export const STABLES: Token[] = [
	{ ticker: "IDRX", name: "IDRX Stablecoin", price: 1, isStable: true },
];

export const ALL_TOKENS = [...STABLES, ...PSTOCKS];

export const DEFAULT_PORTFOLIO: Portfolio = {
	IDRX: 18_750_000,
	BBCAP: 500,
	BMRIP: 1200,
	BBRIP: 4120,
	ENRGP: 21500,
	BUMIP: 84320,
};

export const DEFAULT_COST_BASIS: Portfolio = {
	IDRX: 1,
	BBCAP: 9500,
	BMRIP: 5200,
	BBRIP: 3920,
	BDMNP: 1680,
	PTROP: 2900,
	BRPTP: 910,
	ENRGP: 71,
	BUMIP: 82,
};

export function tokenByTicker(ticker: string) {
	return ALL_TOKENS.find((token) => token.ticker === ticker) ?? ALL_TOKENS[0];
}

export function seriesFor(ticker: string, points = 24) {
	let seed = 0;
	for (const c of ticker) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
	const rng = () => {
		seed = (seed * 1103515245 + 12345) >>> 0;
		return seed / 0xffffffff;
	};
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
	const rng = () => {
		seed = (seed * 1103515245 + 12345) >>> 0;
		return seed / 0xffffffff;
	};
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

export function portfolioTimeSeries(
	seedTicker = "PORTFOLIO",
	days = 365,
	start = 270_000_000,
	end = 402_600_000,
) {
	let seed = 0;
	for (const c of seedTicker) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
	const rng = () => {
		seed = (seed * 1103515245 + 12345) >>> 0;
		return seed / 0xffffffff;
	};
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
	const map: Record<string, number> = {
		"1D": 1,
		"1W": 7,
		"1M": 30,
		"3M": 90,
		"1Y": 365,
		ALL: series.length,
	};
	const n = Math.min(series.length, map[range] || 30);
	if (range === "1D") {
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
	const mk = (
		mins: number,
		o: Omit<ActivityItem, "id" | "time" | "status" | "hash">,
	): ActivityItem => ({
		id: Math.random().toString(36).slice(2),
		time: new Date(now.getTime() - mins * 60000),
		status: "confirmed",
		hash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
		...o,
	});
	return [
		mk(52, {
			kind: "swap",
			payTicker: "IDRX",
			payAmt: 7_500_000,
			recvTicker: "BBRIP",
			recvAmt: 1807,
			idrx: 7_500_000,
		}),
		mk(220, {
			kind: "swap",
			payTicker: "BMRIP",
			payAmt: 200,
			recvTicker: "IDRX",
			recvAmt: 1_127_000,
			idrx: 1_130_000,
		}),
		mk(1490, {
			kind: "mint",
			recvTicker: "BUMIP",
			recvAmt: 12000,
			idrx: 1_080_000,
		}),
		mk(1750, {
			kind: "receive",
			recvTicker: "IDRX",
			recvAmt: 30_000_000,
			idrx: 30_000_000,
		}),
		mk(2880, {
			kind: "swap",
			payTicker: "IDRX",
			payAmt: 22_500_000,
			recvTicker: "ENRGP",
			recvAmt: 288461,
			idrx: 22_500_000,
		}),
		mk(7200, {
			kind: "redeem",
			payTicker: "BBCAP",
			payAmt: 100,
			idrx: 1_002_500,
		}),
	];
}

export function fmtIDRX(
	n: number | undefined,
	opts: { min?: number; max?: number } = {},
) {
	if (n == null || Number.isNaN(n)) return "—";
	return (
		n.toLocaleString("id-ID", {
			minimumFractionDigits: opts.min ?? 0,
			maximumFractionDigits: opts.max ?? 0,
		}) + " IDRX"
	);
}

/** Compact IDRX: 1.500.000 → "1,5M IDRX" */
export function fmtIDRXCompact(n: number | undefined): string {
	if (n == null || Number.isNaN(n)) return "—";
	if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B IDRX`;
	if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M IDRX`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K IDRX`;
	return `${n.toFixed(0)} IDRX`;
}

export function fmtAmt(n: number | undefined) {
	if (!n || Number.isNaN(n)) return "0";
	if (n >= 1000) return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
	if (n >= 1) return n.toLocaleString("id-ID", { maximumFractionDigits: 4 });
	return n.toLocaleString("id-ID", { maximumFractionDigits: 6 });
}

export function fmtNum(n: number | undefined, max = 4) {
	if (n == null || Number.isNaN(n)) return "—";
	return n.toLocaleString("id-ID", { maximumFractionDigits: max });
}

export function fmtPct(n: number | undefined) {
	if (n == null || Number.isNaN(n)) return "—";
	return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function shortAddr(a: string) {
	if (!a) return "";
	return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function fmtAxisDate(t: number, range: string) {
	const d = new Date(t);
	if (range === "1D")
		return d.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		});
	if (range === "1W")
		return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" });
	if (range === "1Y" || range === "ALL")
		return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
	return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export const TOKEN_STYLE: Record<string, { fill: string; glyph: string }> = {
	BBCAP: { fill: "#003f8a", glyph: "C" },
	BMRIP: { fill: "#f0a500", glyph: "M" },
	BBRIP: { fill: "#003087", glyph: "R" },
	BDMNP: { fill: "#e31e2d", glyph: "D" },
	PTROP: { fill: "#c47d1a", glyph: "P" },
	BRPTP: { fill: "#1d5c1d", glyph: "B" },
	ENRGP: { fill: "#c8102e", glyph: "E" },
	BUMIP: { fill: "#16110e", glyph: "B" },
	IDRX: { fill: "#00897b", glyph: "₹" },
};

import { useQuery } from '@tanstack/react-query';
import http, { ApiResponse } from '../index';

// ─── Types ────────────────────────────────────────────────────

export interface Stock {
  id: string;
  /** Token ticker, e.g. BUMIP */
  ticker: string;
  /** Human-readable stock name */
  name: string;
  /** Underlying IDX ticker, e.g. BUMI */
  idx_ticker: string;
  /** On-chain ERC-20 contract address — null if not yet deployed */
  contract_address: string | null;
  created_at: string;
}

export interface StockPrice {
  ticker: string;
  /** IDRX price stored as a NUMERIC — returned as a decimal string */
  price_idrx: string;
  price_usd?: number;
  change_24h_pct?: number;
}

export interface PriceHistoryPoint {
  timestamp: string;
  /** IDRX price at this timestamp, returned as a decimal string */
  price_idrx: string;
}

export interface PlatformStats {
  total_volume_idrx: string;
  total_swaps: number;
  total_stocks: number;
  total_supply_idrx: string;
}

// ─── Query Keys ───────────────────────────────────────────────

export const stockKeys = {
  all: ['stocks'] as const,
  list: () => [...stockKeys.all, 'list'] as const,
  price: (ticker: string) => [...stockKeys.all, 'price', ticker] as const,
  history: (ticker: string, range: string) =>
    [...stockKeys.all, 'history', ticker, range] as const,
  stats: () => ['platform', 'stats'] as const,
};

// ─── API Functions ────────────────────────────────────────────

/** GET /api/v1/public/stocks */
async function getStocks(): Promise<Stock[]> {
  const { data } = await http.get<ApiResponse<Stock[]>>(
    '/api/v1/public/stocks',
  );
  return data.data;
}

/** GET /api/v1/public/prices/:ticker */
async function getStockPrice(ticker: string): Promise<StockPrice> {
  const { data } = await http.get<ApiResponse<StockPrice>>(
    `/api/v1/public/prices/${ticker}`,
  );
  return data.data;
}

/** GET /api/v1/public/prices/:ticker/history?range=:range */
async function getStockHistory(
  ticker: string,
  range: string,
): Promise<PriceHistoryPoint[]> {
  const { data } = await http.get<ApiResponse<PriceHistoryPoint[]>>(
    `/api/v1/public/prices/${ticker}/history`,
    { params: { range } },
  );
  return data.data;
}

/** GET /api/v1/public/stats */
async function getPlatformStats(): Promise<PlatformStats> {
  const { data } = await http.get<ApiResponse<PlatformStats>>(
    '/api/v1/public/stats',
  );
  return data.data;
}

// ─── React Query Hooks ────────────────────────────────────────

/**
 * All listed stock tokens (public).
 * Refreshes every 60 s — price-independent metadata changes rarely.
 */
export function useStocks() {
  return useQuery({
    queryKey: stockKeys.list(),
    queryFn: getStocks,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

/**
 * Real-time price for a single stock token.
 * Refreshes every 15 s to give a live-price feel without hammering the API.
 */
export function useStockPrice(ticker: string) {
  return useQuery({
    queryKey: stockKeys.price(ticker),
    queryFn: () => getStockPrice(ticker),
    enabled: !!ticker,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

/**
 * OHLCV-style price history for chart rendering.
 * `range` is a free-form string passed through to the backend (e.g. '1D', '1W', '1M').
 */
export function useStockHistory(ticker: string, range: string) {
  return useQuery({
    queryKey: stockKeys.history(ticker, range),
    queryFn: () => getStockHistory(ticker, range),
    enabled: !!ticker && !!range,
    staleTime: 60_000,
  });
}

/**
 * Platform-wide stats: total volume, total swaps, total supply.
 * Used on the Markets / home stats banner.
 */
export function usePlatformStats() {
  return useQuery({
    queryKey: stockKeys.stats(),
    queryFn: getPlatformStats,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

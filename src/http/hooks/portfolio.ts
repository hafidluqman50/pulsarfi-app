import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '../index';

// ─── Types ────────────────────────────────────────────────────
export interface PortfolioSummary {
  totalValueUsd: number;
  totalPnlUsd: number;
  totalPnlPct: number;
  holdings: Holding[];
}

export interface Holding {
  ticker: string;
  name: string;
  qty: number;
  avgBuyPrice: number;
  currentPrice: number;
  valueUsd: number;
  pnlUsd: number;
  pnlPct: number;
}

export interface TransferPayload {
  ticker: string;
  qty: number;
  toAddress: string;
}

// ─── Query Keys ───────────────────────────────────────────────
// Centralize keys untuk menghindari typo dan memudahkan invalidation
export const portfolioKeys = {
  all:     ['portfolio'] as const,
  summary: () => [...portfolioKeys.all, 'summary'] as const,
  history: (range: string) => [...portfolioKeys.all, 'history', range] as const,
};

// ─── API Functions ────────────────────────────────────────────

/** GET /portfolio/summary */
async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await http.get('/portfolio/summary');
  return data;
}

/** GET /portfolio/history?range=1D|1W|1M|1Y */
async function getPortfolioHistory(range: string): Promise<{ t: number; v: number }[]> {
  const { data } = await http.get('/portfolio/history', { params: { range } });
  return data;
}

/** POST /portfolio/transfer */
async function postTransfer(payload: TransferPayload): Promise<{ txHash: string }> {
  const { data } = await http.post('/portfolio/transfer', payload);
  return data;
}

// ─── React Query Hooks ────────────────────────────────────────

/** Hook: ambil portfolio summary */
export function usePortfolioSummary() {
  return useQuery({
    queryKey: portfolioKeys.summary(),
    queryFn:  getPortfolioSummary,
    staleTime: 30_000,        // cache 30 detik sebelum refetch
    refetchInterval: 60_000,  // auto-refetch tiap 1 menit (live price feel)
  });
}

/** Hook: ambil chart history berdasarkan range */
export function usePortfolioHistory(range: string) {
  return useQuery({
    queryKey: portfolioKeys.history(range),
    queryFn:  () => getPortfolioHistory(range),
    staleTime: 60_000,
  });
}

/** Hook: transfer token */
export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTransfer,
    onSuccess: () => {
      // Invalidate portfolio supaya data fresh setelah transfer
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
    onError: (error) => {
      console.error('[portfolio] Transfer failed:', error);
    },
  });
}

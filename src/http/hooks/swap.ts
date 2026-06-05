import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http, { ApiResponse } from '../index';

// ─── Types ────────────────────────────────────────────────────

export interface StockTransaction {
  id: string;
  tx_hash: string;
  wallet_address: string;
  /** Token ticker, e.g. BUMIP */
  ticker: string;
  side: 'buy' | 'sell';
  /** Raw IDRX amount — uint256 string (18 decimals) */
  idrx_amount: string;
  /** Raw stock token amount — uint256 string (18 decimals) */
  stock_amount: string;
  created_at: string;
}

export interface RecordSwapPayload {
  /** On-chain transaction hash */
  tx_hash: string;
  wallet_address: string;
  ticker: string;
  side: 'buy' | 'sell';
  /** Raw uint256 IDRX amount as decimal string */
  idrx_amount: string;
  /** Raw uint256 stock token amount as decimal string */
  stock_amount: string;
}

// ─── Query Keys ───────────────────────────────────────────────

export const transactionKeys = {
  all: ['transactions'] as const,
  list: () => [...transactionKeys.all, 'list'] as const,
};

// ─── API Functions ────────────────────────────────────────────

/** GET /api/v1/public/stock-transactions */
async function getStockTransactions(): Promise<StockTransaction[]> {
  const { data } = await http.get<ApiResponse<StockTransaction[]>>(
    '/api/v1/public/stock-transactions',
  );
  return data.data;
}

/** POST /api/v1/public/stock-transactions */
async function postStockTransaction(
  payload: RecordSwapPayload,
): Promise<StockTransaction> {
  const { data } = await http.post<ApiResponse<StockTransaction>>(
    '/api/v1/public/stock-transactions',
    payload,
  );
  return data.data;
}

// ─── React Query Hooks ────────────────────────────────────────

/**
 * Fetches the global public list of on-chain stock transactions.
 * Used for the activity feed / transaction history screen.
 */
export function useStockTransactions() {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: getStockTransactions,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

/**
 * Records a completed on-chain swap to the backend.
 * Call this AFTER the on-chain transaction is confirmed.
 * Invalidates the transactions list on success so the activity feed refreshes.
 */
export function useRecordSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postStockTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
    onError: (error) => {
      console.error('[swap] Failed to record swap transaction:', error);
    },
  });
}

import type { StockTransaction } from '../http/hooks/swap';
import type { ActivityItem } from './mockData';

type CostLot = {
  qty: number;
  cost: number;
};

function rawAmount(raw: string, decimals: number): number {
  try {
    const valueStr = String(raw).replace(/[^0-9]/g, '') || '0';
    if (valueStr.length <= decimals) {
      const padded = valueStr.padStart(decimals + 1, '0');
      const whole = padded.slice(0, -decimals);
      const frac = padded.slice(-decimals);
      return Number(`${whole}.${frac}`);
    } else {
      const whole = valueStr.slice(0, -decimals);
      const frac = valueStr.slice(-decimals);
      return Number(`${whole}.${frac}`);
    }
  } catch (e) {
    return 0;
  }
}

export function stockLots(raw: string): number {
  return rawAmount(raw, 18);
}

export function idrxAmount(raw: string): number {
  return rawAmount(raw, 2);
}

export function buildCostBasis(transactions: StockTransaction[]): Record<string, number> {
  const lots: Record<string, CostLot> = {};
  const sorted = [...transactions].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  for (const tx of sorted) {
    const ticker = tx.ticker;
    const stockQty = stockLots(tx.stock_amount);
    const idrx = idrxAmount(tx.idrx_amount);
    const current = lots[ticker] ?? { qty: 0, cost: 0 };

    if (tx.side === 'buy' || (tx.side as string) === 'transfer-in') {
      current.qty += stockQty;
      current.cost += idrx;
    } else if ((tx.side === 'sell' || (tx.side as string) === 'redeemed' || (tx.side as string) === 'transfer-out') && current.qty > 0) {
      const avg = current.cost / current.qty;
      const removedQty = Math.min(stockQty, current.qty);
      current.qty -= removedQty;
      current.cost = Math.max(0, current.cost - avg * removedQty);
    }

    lots[ticker] = current;
  }

  return Object.fromEntries(
    Object.entries(lots)
      .filter(([, lot]) => lot.qty > 0)
      .map(([ticker, lot]) => [ticker, lot.cost / lot.qty]),
  );
}

export function buildActivityItems(transactions: StockTransaction[]): ActivityItem[] {
  return [...transactions]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((tx) => {
      const stockQty = stockLots(tx.stock_amount);
      const idrx = idrxAmount(tx.idrx_amount);
      const time = new Date(tx.created_at);

      switch (tx.side) {
        case 'buy':
          return { id: tx.tx_hash, kind: 'swap' as const, payTicker: 'IDRX', payAmt: idrx, recvTicker: tx.ticker, recvAmt: stockQty, idrx, time, status: 'confirmed' as const, hash: `${tx.tx_hash.slice(0, 6)}...${tx.tx_hash.slice(-4)}` };
        case 'sell':
          return { id: tx.tx_hash, kind: 'swap' as const, payTicker: tx.ticker, payAmt: stockQty, recvTicker: 'IDRX', recvAmt: idrx, idrx, time, status: 'confirmed' as const, hash: `${tx.tx_hash.slice(0, 6)}...${tx.tx_hash.slice(-4)}` };
        case 'transfer-in':
          return { id: tx.tx_hash, kind: 'receive' as const, recvTicker: tx.ticker, recvAmt: stockQty, idrx, time, status: 'confirmed' as const, hash: `${tx.tx_hash.slice(0, 6)}...${tx.tx_hash.slice(-4)}` };
        case 'redeemed':
        case 'request-redeem':
          return { id: tx.tx_hash, kind: 'redeem' as const, payTicker: tx.ticker, payAmt: stockQty, idrx, time, status: 'confirmed' as const, hash: `${tx.tx_hash.slice(0, 6)}...${tx.tx_hash.slice(-4)}` };
        default:
          return { id: tx.tx_hash, kind: 'swap' as const, payTicker: tx.ticker, payAmt: stockQty, recvTicker: 'IDRX', recvAmt: idrx, idrx, time, status: 'confirmed' as const, hash: `${tx.tx_hash.slice(0, 6)}...${tx.tx_hash.slice(-4)}` };
      }
    });
}

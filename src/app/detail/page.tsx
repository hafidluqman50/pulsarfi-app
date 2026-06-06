import React, { useState, useMemo } from 'react';
import { DetailUI } from './ui';
import { useStocks, useStockPrice, useStockHistory, useReserves } from '@/http/hooks/stocks';
import { Portfolio, fmtNum } from '@/lib/mockData';

export default function DetailPage({
  ticker,
  balances,
  costBasis,
  onBack,
  onTrade,
}: {
  ticker: string;
  balances: Portfolio;
  costBasis: Portfolio;
  onBack: () => void;
  onTrade: (side: 'buy' | 'sell', tradeTicker: string) => void;
}) {
  const [selectedRange, setSelectedRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1D');

  const stocksQuery = useStocks();
  const tokenMeta = stocksQuery.data?.find((s) => s.ticker === ticker);

  const reservesQuery = useReserves();
  const reserveEntry = reservesQuery.data?.find((entry) => entry.stock.ticker === ticker);
  const tokenSupply = reserveEntry ? Number(reserveEntry.on_chain_supply) / 1e18 : null;

  const priceQuery = useStockPrice(ticker);
  const currentPrice = priceQuery.data ? priceQuery.data.price : (tokenMeta?.price ?? 0);
  const change24hPct = priceQuery.data?.change_24h ?? tokenMeta?.change_24h ?? 0;

  const historyQuery = useStockHistory(ticker, selectedRange);

  const chartData = useMemo(() => {
    if (!historyQuery.data) return [];
    return historyQuery.data.map(point => ({
      t: point.timestamp,
      v: point.value
    }));
  }, [historyQuery.data]);

  const PORTFOLIO_LOT_SIZE = 100;
  const currentQuantity = balances[ticker] || 0;
  const pricePerToken = currentPrice * PORTFOLIO_LOT_SIZE;
  const totalValue = currentQuantity * pricePerToken;
  const averageCostPerToken = costBasis[ticker];
  const averageCost = averageCostPerToken ? averageCostPerToken / PORTFOLIO_LOT_SIZE : undefined;
  const profitAndLoss = averageCostPerToken ? (pricePerToken - averageCostPerToken) * currentQuantity : 0;
  const profitAndLossPercent = averageCostPerToken ? ((pricePerToken - averageCostPerToken) / averageCostPerToken) * 100 : 0;

  const isPriceUp = change24hPct >= 0;

  const isLoading = stocksQuery.isLoading || priceQuery.isLoading;

  return (
    <DetailUI
      ticker={ticker}
      tokenMeta={tokenMeta}
      currentPrice={currentPrice}
      change24hPct={change24hPct}
      tokenSupply={tokenSupply}
      isReservesLoading={reservesQuery.isLoading}
      selectedRange={selectedRange}
      setSelectedRange={setSelectedRange}
      chartData={chartData}
      isPriceUp={isPriceUp}
      quantity={currentQuantity}
      totalValue={totalValue}
      averageCost={averageCost}
      profitAndLoss={profitAndLoss}
      profitAndLossPercent={profitAndLossPercent}
      isLoading={isLoading}
      onNavigateBack={onBack}
      onExecuteTrade={onTrade}
    />
  );
}

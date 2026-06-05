import React, { useState, useMemo } from 'react';
import { DetailUI } from './ui';
import { tokenByTicker, priceSeries, sliceRange, Portfolio } from '@/lib/mockData';

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
  const tokenData = tokenByTicker(ticker);
  const [selectedRange, setSelectedRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  
  const fullPriceSeries = useMemo(() => priceSeries(ticker, tokenData.price), [ticker, tokenData.price]);
  const slicedChartData = useMemo(() => sliceRange(fullPriceSeries, selectedRange), [fullPriceSeries, selectedRange]);
  const isPriceUp = (tokenData.change24h ?? 0) >= 0;
  
  const currentQuantity = balances[ticker] || 0;
  const totalValue = currentQuantity * tokenData.price;
  const averageCost = costBasis[ticker];
  const profitAndLoss = averageCost ? (tokenData.price - averageCost) * currentQuantity : 0;
  const profitAndLossPercent = averageCost ? ((tokenData.price - averageCost) / averageCost) * 100 : 0;

  return (
    <DetailUI 
      ticker={ticker} 
      token={tokenData}
      selectedRange={selectedRange} 
      setSelectedRange={setSelectedRange}
      chartData={slicedChartData} 
      isPriceUp={isPriceUp}
      quantity={currentQuantity} 
      totalValue={totalValue} 
      averageCost={averageCost} 
      profitAndLoss={profitAndLoss} 
      profitAndLossPercent={profitAndLossPercent}
      onNavigateBack={onBack} 
      onExecuteTrade={onTrade}
    />
  );
}

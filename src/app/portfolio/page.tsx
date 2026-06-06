import React, { useState, useMemo } from 'react';
import { PortfolioUI } from './ui';
import { tokenByTicker, portfolioTimeSeries, sliceRange, Portfolio } from '@/lib/mockData';

export default function PortfolioPage({ balances, costBasis, allTokens, onOpen }: { balances: Portfolio; costBasis: Portfolio; allTokens: any[]; onOpen: (ticker: string) => void }) {
  const [selectedRange, setSelectedRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  
  const PORTFOLIO_LOT_SIZE = 100;
  const holdingsList = Object.keys(balances)
    .map((ticker) => {
      const token = allTokens.find((t: any) => t.ticker === ticker) || { ticker, name: ticker, price: 0, isStable: false };
      const quantity = balances[ticker];
      const pricePerToken = token.isStable ? token.price : token.price * PORTFOLIO_LOT_SIZE;
      const value = quantity * pricePerToken;
      const averageCostPerToken = costBasis[ticker] ?? pricePerToken;
      const averageCostDisplay = token.isStable ? averageCostPerToken : averageCostPerToken / PORTFOLIO_LOT_SIZE;
      const totalCost = quantity * averageCostPerToken;
      const profitAndLoss = value - totalCost;
      const profitAndLossPercent = totalCost > 0 ? (profitAndLoss / totalCost) * 100 : 0;
      return { tk: ticker, t: token, qty: quantity, value, avg: averageCostDisplay, pnl: profitAndLoss, pnlPct: profitAndLossPercent, isStable: !!token.isStable };
    })
    .filter((holding) => holding.qty > 0)
    .sort((a, b) => b.value - a.value);
    
  const totalPortfolioValue = holdingsList.reduce((sum, holding) => sum + holding.value, 0);
  const totalProfitLoss = holdingsList.reduce((sum, holding) => sum + (holding.isStable ? 0 : holding.pnl), 0);
  const totalInvestedCost = holdingsList.reduce((sum, holding) => sum + (holding.isStable ? 0 : holding.qty * holding.avg * PORTFOLIO_LOT_SIZE), 0);
  const totalProfitLossPercent = totalInvestedCost > 0 ? (totalProfitLoss / totalInvestedCost) * 100 : 0;
  
  const chartSeries = useMemo(() => portfolioTimeSeries('PORTFOLIO', 365, totalPortfolioValue * 0.7, totalPortfolioValue), [totalPortfolioValue]);
  const slicedChartData = useMemo(() => sliceRange(chartSeries, selectedRange), [selectedRange, chartSeries]);
  const dailyChange = slicedChartData.length > 1 ? slicedChartData[slicedChartData.length - 1].v - slicedChartData[0].v : 0;
  const dailyChangePercent = slicedChartData.length > 1 && slicedChartData[0].v ? (dailyChange / slicedChartData[0].v) * 100 : 0;
  const colorPalette = ['#c8102e', '#16110e', '#1f4d8a', '#1f7a4b', '#9a0c24', '#5a4a3a', '#2775ca', '#6f2da8'];

  return (
    <PortfolioUI 
      selectedRange={selectedRange} 
      setSelectedRange={setSelectedRange}
      holdingsList={holdingsList}
      totalPortfolioValue={totalPortfolioValue}
      totalProfitLoss={totalProfitLoss}
      totalProfitLossPercent={totalProfitLossPercent}
      chartData={slicedChartData}
      dailyChange={dailyChange}
      dailyChangePercent={dailyChangePercent}
      colorPalette={colorPalette}
      onNavigateToToken={onOpen}
    />
  );
}

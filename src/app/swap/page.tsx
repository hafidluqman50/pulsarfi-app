import React, { useEffect, useMemo, useState } from 'react';
import { SwapUI, SwapActions, SwapViewModel } from './ui';
import { tokenByTicker, STABLES, PSTOCKS, Portfolio, Token } from '@/lib/mockData';
import { useTheme } from '@/lib/theme';

export type TradePreset = { side: 'buy' | 'sell'; ticker: string } | null;
export type SwapSlot = 'pay' | 'recv';

const FEE = 0.003;
const DEFAULT_STABLE = STABLES[0].ticker;
const DEFAULT_STOCK = PSTOCKS[0].ticker;
const isStableTicker = (ticker: string) => STABLES.some((token) => token.ticker === ticker);
const isStockTicker = (ticker: string) => PSTOCKS.some((token) => token.ticker === ticker);

export default function SwapPage({
  balances,
  onSwap,
  preset,
  clearPreset,
}: {
  balances: Portfolio;
  onSwap: (payload: { pay: string; recv: string; payAmt: number; recvAmt: number; usd: number }) => void;
  preset: TradePreset;
  clearPreset: () => void;
}) {
  const [payToken, setPayToken] = useState(DEFAULT_STABLE);
  const [receiveToken, setReceiveToken] = useState(DEFAULT_STOCK);
  const [amount, setAmount] = useState('');
  const [pickingToken, setPickingToken] = useState<SwapSlot | null>(null);
  const [tokenSearch, setTokenSearch] = useState('');
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [swapPhase, setSwapPhase] = useState<'idle' | 'signing' | 'success'>('idle');

  useEffect(() => {
    if (!preset) return;
    if (preset.side === 'buy') {
      setPayToken(DEFAULT_STABLE);
      setReceiveToken(preset.ticker);
    } else {
      setPayToken(preset.ticker);
      setReceiveToken(DEFAULT_STABLE);
    }
    setAmount('');
    clearPreset();
  }, [clearPreset, preset]);

  const payTokenDetails = tokenByTicker(payToken);
  const receiveTokenDetails = tokenByTicker(receiveToken);
  const payTokenBalance = balances[payToken] || 0;
  const amountNumber = parseFloat(amount) || 0;
  const grossOutput = (amountNumber * payTokenDetails.price) / receiveTokenDetails.price;
  const expectedOutput = grossOutput * (1 - FEE);
  const minimumReceivedAmount = expectedOutput * (1 - slippageTolerance / 100);
  const usdValueOfAmount = amountNumber * payTokenDetails.price;
  const isInsufficientBalance = amountNumber > payTokenBalance;
  const isSwapValid = amountNumber > 0 && !isInsufficientBalance;
  const direction = isStableTicker(payToken) ? 'buy' : 'sell';

  const pickerTokens = useMemo<Token[]>(() => {
    if (!pickingToken) return [];
    const oppositeTicker = pickingToken === 'pay' ? receiveToken : payToken;
    const candidates = isStableTicker(oppositeTicker) ? PSTOCKS : STABLES;
    const query = tokenSearch.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter((token) => (
      token.ticker.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.ipo?.toLowerCase().includes(query) ||
      token.sector?.toLowerCase().includes(query)
    ));
  }, [payToken, pickingToken, receiveToken, tokenSearch]);

  const chooseToken = (slot: SwapSlot, ticker: string) => {
    const selectedIsStable = isStableTicker(ticker);

    if (slot === 'pay') {
      setPayToken(ticker);
      if (selectedIsStable && !isStockTicker(receiveToken)) setReceiveToken(DEFAULT_STOCK);
      if (!selectedIsStable && !isStableTicker(receiveToken)) setReceiveToken(DEFAULT_STABLE);
    } else {
      setReceiveToken(ticker);
      if (selectedIsStable && !isStockTicker(payToken)) setPayToken(DEFAULT_STOCK);
      if (!selectedIsStable && !isStableTicker(payToken)) setPayToken(DEFAULT_STABLE);
    }

    setPickingToken(null);
    setTokenSearch('');
    setAmount('');
  };

  const flip = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
    setAmount('');
  };

  const confirmSwap = () => {
    setSwapPhase('signing');
    setTimeout(() => {
      setSwapPhase('success');
      onSwap({ pay: payToken, recv: receiveToken, payAmt: amountNumber, recvAmt: expectedOutput, usd: usdValueOfAmount });
    }, 1100);
  };

  const closeReview = () => {
    if (swapPhase === 'signing') return;
    const completed = swapPhase === 'success';
    setIsReviewing(false);
    setSwapPhase('idle');
    if (completed) setAmount('');
  };

  const vm: SwapViewModel = {
    payToken,
    receiveToken,
    payTokenDetails,
    receiveTokenDetails,
    amount,
    pickingToken,
    tokenSearch,
    pickerTokens,
    pickerTitle: !pickingToken ? 'Select token' : isStableTicker(pickingToken === 'pay' ? receiveToken : payToken) ? 'Select pStock' : 'Select stablecoin',
    slippageTolerance,
    isReviewing,
    swapPhase,
    isSettingsOpen,
    isNightMode: isDark,
    direction,
    isSwapValid,
    isInsufficientBalance,
    payTokenBalance,
    userBalances: balances,
    amountNumber,
    expectedOutput,
    usdValueOfAmount,
    minimumReceivedAmount,
    swapFeePercentage: FEE,
  };

  const actions: SwapActions = {
    setAmount,
    setTokenSearch,
    openPicker: (slot) => {
      setPickingToken(slot);
      setTokenSearch('');
    },
    closePicker: () => {
      setPickingToken(null);
      setTokenSearch('');
    },
    pickToken: (ticker) => pickingToken && chooseToken(pickingToken, ticker),
    setPercent: (percentage) => setAmount(String(+(payTokenBalance * percentage).toFixed(6))),
    flip,
    setSlippageTolerance,
    openReview: () => {
      setSwapPhase('idle');
      setIsReviewing(true);
    },
    closeReview,
    confirmSwap,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    toggleNightMode: toggleTheme,
  };

  return <SwapUI vm={vm} actions={actions} />;
}

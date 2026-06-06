import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useAccount } from "@reown/appkit-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { type Address, parseUnits } from "viem";
import { useExecuteSwap } from "@/http/hooks/executeSwap";
import { useStocks } from "@/http/hooks/stocks";
import type { Portfolio, Token } from "@/lib/mockData";
import { useTheme } from "@/lib/theme";
import { type SwapActions, SwapUI, type SwapViewModel } from "./ui";

export type TradePreset = { side: "buy" | "sell"; ticker: string } | null;
export type SwapSlot = "pay" | "recv";

const FEE = 0.003;

const isStableTicker = (ticker: string) => ticker === "IDRX";
const isStockTicker = (ticker: string) => ticker !== "IDRX";

export default function SwapPage({
	balances,
	onSwap,
	preset,
	clearPreset,
}: {
	balances: Portfolio;
	onSwap: (payload: {
		pay: string;
		recv: string;
		payAmt: number;
		recvAmt: number;
		usd: number;
	}) => void;
	preset: TradePreset;
	clearPreset: () => void;
}) {
	const pickerSheetRef = useRef<BottomSheetModal>(null);
	const reviewSheetRef = useRef<BottomSheetModal>(null);
	const settingsSheetRef = useRef<BottomSheetModal>(null);

	const [payToken, setPayToken] = useState("IDRX");
	const [receiveToken, setReceiveToken] = useState("");
	const [amount, setAmount] = useState("");
	const [pickingToken, setPickingToken] = useState<SwapSlot | null>(null);
	const [tokenSearch, setTokenSearch] = useState("");
	const [slippageTolerance, setSlippageTolerance] = useState(0.5);
	const { isDark, toggleTheme, colors } = useTheme();
	const { address } = useAccount();
	const executeSwap = useExecuteSwap();
	const [swapPhase, setSwapPhase] = useState<"idle" | "signing" | "success">(
		"idle",
	);

	const stocksQuery = useStocks();

	const dynamicSTABLES = useMemo<Token[]>(
		() => [
			{ ticker: "IDRX", name: "IDRX Stablecoin", price: 1, isStable: true },
		],
		[],
	);

	const dynamicPSTOCKS = useMemo<Token[]>(() => {
		return (stocksQuery.data || []).map((s) => ({
			ticker: s.ticker,
			name: s.stock_name,
			sector: s.sector || undefined,
			price: s.pool_price || s.price,
			change24h: s.change_24h,
			ipo: s.idx_ticker,
			contractAddress: s.contract_address as Address,
		}));
	}, [stocksQuery.data]);

	const allTokens = useMemo(
		() => [...dynamicSTABLES, ...dynamicPSTOCKS],
		[dynamicSTABLES, dynamicPSTOCKS],
	);

	useEffect(() => {
		if (!receiveToken && dynamicPSTOCKS.length > 0) {
			setReceiveToken(dynamicPSTOCKS[0].ticker);
		}
	}, [dynamicPSTOCKS, receiveToken]);

	useEffect(() => {
		if (!preset) return;
		if (preset.side === "buy") {
			setPayToken("IDRX");
			setReceiveToken(preset.ticker);
		} else {
			setPayToken(preset.ticker);
			setReceiveToken("IDRX");
		}
		clearPreset();
	}, [preset, clearPreset]);

	const payTokenDetails =
		allTokens.find((t) => t.ticker === payToken) ?? allTokens[0];
	const receiveTokenDetails =
		allTokens.find((t) => t.ticker === receiveToken) ??
		(allTokens.length > 1 ? allTokens[1] : undefined);

	const tokensReady = !!payTokenDetails && !!receiveTokenDetails;
	const amountNumber = parseFloat(amount || "0");
	const rate =
		tokensReady && receiveTokenDetails.price > 0
			? payTokenDetails.price / receiveTokenDetails.price
			: 0;
	const grossOutputAmount = amountNumber * rate;
	const expectedOutput = grossOutputAmount * (1 - 0.003);
	const usdValueOfAmount = amountNumber * (payTokenDetails?.price ?? 0);
	const minimumReceivedAmount = expectedOutput * (1 - slippageTolerance / 100);

	const pickerTokens = useMemo(() => {
		let list =
			pickingToken === "pay"
				? isStockTicker(receiveToken)
					? dynamicSTABLES
					: dynamicPSTOCKS
				: isStockTicker(payToken)
					? dynamicSTABLES
					: dynamicPSTOCKS;
		if (tokenSearch) {
			const q = tokenSearch.toLowerCase();
			list = list.filter(
				(t) =>
					t.ticker.toLowerCase().includes(q) ||
					t.name.toLowerCase().includes(q),
			);
		}
		return list;
	}, [
		pickingToken,
		payToken,
		receiveToken,
		tokenSearch,
		dynamicSTABLES,
		dynamicPSTOCKS,
	]);

	const pickerTitle =
		pickingToken === "pay"
			? isStockTicker(receiveToken)
				? "Select stablecoin"
				: "Select asset"
			: isStockTicker(payToken)
				? "Select stablecoin"
				: "Select asset";

	const direction = isStableTicker(payToken) ? "buy" : "sell";

	const payTokenBalance = balances[payToken] || 0;
	const isInsufficientBalance = amountNumber > payTokenBalance;
	const isExecuting = executeSwap.isPending;
	const isSwapValid =
		amountNumber > 0 && !isInsufficientBalance && !isExecuting;

	const chooseToken = (slot: SwapSlot, ticker: string) => {
		if (slot === "pay") {
			if (ticker === receiveToken) setReceiveToken(payToken);
			setPayToken(ticker);
		} else {
			if (ticker === payToken) setPayToken(receiveToken);
			setReceiveToken(ticker);
		}
		pickerSheetRef.current?.dismiss();
	};

	const flip = () => {
		const temp = payToken;
		setPayToken(receiveToken);
		setReceiveToken(temp);
	};

	const confirmSwap = async () => {
		if (!address) {
			alert("Please connect wallet first");
			return;
		}

		setSwapPhase("signing");
		try {
			const isStable = isStableTicker(payToken);
			const stockTicker = isStable ? receiveToken : payToken;
			const stockTokenDetails = isStable
				? receiveTokenDetails
				: payTokenDetails;

			const decimalsIn = isStable ? 2 : 18;
			const decimalsOut = isStable ? 18 : 2;

			const amountIn = parseUnits(amountNumber.toFixed(decimalsIn), decimalsIn);
			const amountOutMin = parseUnits(
				minimumReceivedAmount.toFixed(decimalsOut),
				decimalsOut,
			);

			const tokenAddress = isStable
				? (process.env.EXPO_PUBLIC_IDRX_ADDRESS as Address)
				: ((stockTokenDetails as Token | undefined)
						?.contractAddress as Address);

			await executeSwap.mutateAsync({
				ticker: stockTicker,
				wallet_address: address as Address,
				token_address: tokenAddress,
				amount_in: amountIn,
				amount_out_min: amountOutMin,
				buy_stock: isStable,
				input_is_stable: isStable,
			});

			setSwapPhase("success");
			onSwap({
				pay: payToken,
				recv: receiveToken,
				payAmt: amountNumber,
				recvAmt: expectedOutput,
				usd: usdValueOfAmount,
			});
		} catch (error) {
			setSwapPhase("idle");
			alert((error as Error).message || "Swap failed");
			reviewSheetRef.current?.dismiss();
		}
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
		pickerTitle,
		slippageTolerance,
		isReviewing: false,
		swapPhase,
		isSettingsOpen: false,
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
			setTokenSearch("");
			pickerSheetRef.current?.present();
		},
		closePicker: () => {
			pickerSheetRef.current?.dismiss();
		},
		pickToken: (ticker) => pickingToken && chooseToken(pickingToken, ticker),
		setPercent: (percentage) =>
			setAmount(String(+(payTokenBalance * percentage).toFixed(6))),
		flip,
		setSlippageTolerance,
		openReview: () => {
			setSwapPhase("idle");
			reviewSheetRef.current?.present();
		},
		closeReview: () => {
			reviewSheetRef.current?.dismiss();
		},
		confirmSwap,
		openSettings: () => settingsSheetRef.current?.present(),
		closeSettings: () => settingsSheetRef.current?.dismiss(),
		toggleNightMode: toggleTheme,
	};

	if (!tokensReady) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<ActivityIndicator color={colors.merah} />
			</View>
		);
	}

	return (
		<SwapUI
			vm={vm}
			actions={actions}
			refs={{ pickerSheetRef, reviewSheetRef, settingsSheetRef }}
		/>
	);
}

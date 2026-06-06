import { useMemo } from "react";
import { useStocks } from "@/http/hooks/stocks";
import { useStockTransactions } from "@/http/hooks/swap";
import { useWalletTokenBalanceState } from "@/http/hooks/wallet";
import type { ActivityItem, Portfolio, Token } from "@/lib/mockData";
import { buildActivityItems, buildCostBasis } from "@/lib/portfolio";

type PortfolioData = {
	allTokens: Token[];
	balances: Portfolio;
	costBasis: Portfolio;
	activity: ActivityItem[];
	total: number;
	isStocksLoading: boolean;
	isBalancesLoading: boolean;
};

export function usePortfolioData(address: string | undefined): PortfolioData {
	const stocksQuery = useStocks();

	const allTokens = useMemo<Token[]>(() => {
		const stocks = (stocksQuery.data || []).map<Token>((stock) => ({
			ticker: stock.ticker,
			name: stock.stock_name,
			sector: stock.sector ?? undefined,
			price: stock.price,
			change24h: stock.change_24h,
			ipo: stock.idx_ticker,
			isStable: false,
			sparkline: stock.sparkline_7d,
			contractAddress: stock.contract_address ?? undefined,
		}));
		return [
			{ ticker: "IDRX", name: "IDRX", price: 1, isStable: true },
			...stocks,
		];
	}, [stocksQuery.data]);

	const { balances, isLoading: isBalancesLoading } =
		useWalletTokenBalanceState(allTokens);

	const { data: transactionsData } = useStockTransactions(address);

	const costBasis = useMemo<Portfolio>(
		() => buildCostBasis(transactionsData || []),
		[transactionsData],
	);

	const activity = useMemo<ActivityItem[]>(
		() => buildActivityItems(transactionsData || []),
		[transactionsData],
	);

	const total = useMemo(
		() =>
			Object.keys(balances).reduce((sum, ticker) => {
				const token = allTokens.find((t) => t.ticker === ticker);
				const price = token?.isStable ? token.price : (token?.price || 0) * 100;
				return sum + (balances[ticker] || 0) * price;
			}, 0),
		[balances, allTokens],
	);

	return {
		allTokens,
		balances,
		costBasis,
		activity,
		total,
		isStocksLoading: stocksQuery.isLoading,
		isBalancesLoading,
	};
}

import { useCallback, useMemo, useState } from "react";
import { useStocks, useReserves, useIhsg } from "@/http/hooks/stocks";
import type { Token } from "@/lib/mockData";
import { MarketsUI } from "./ui";

export default function MarketsPage({
	onOpen,
}: {
	onOpen: (ticker: string) => void;
}) {
	const [activeFilter, setActiveFilter] = useState<
		"all" | "gainers" | "losers"
	>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const stocksQuery = useStocks();
	const reservesQuery = useReserves();
	const ihsgQuery = useIhsg();

	const marketsSource = useMemo<Token[]>(() => {
		if (!stocksQuery.data?.length) return [];

		return stocksQuery.data.map((stock) => {
			const reserve = reservesQuery.data?.find(r => r.stock.ticker === stock.ticker);
			const supply = reserve ? Number(reserve.on_chain_supply) / 1e18 : undefined;

			return {
				ticker: stock.ticker,
				name: stock.stock_name,
				sector: stock.sector ?? undefined,
				price: stock.price || 0,
				change24h: stock.change_24h,
				ipo: stock.idx_ticker,
				supply: supply,
				sparkline: stock.sparkline_7d?.length ? stock.sparkline_7d : undefined,
			};
		});
	}, [stocksQuery.data, reservesQuery.data]);

	const filteredMarketsList = useMemo(() => {
		let outputList = [...marketsSource];

		if (activeFilter === "gainers") {
			outputList = outputList
				.filter((token) => (token.change24h ?? 0) >= 0)
				.sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
		}

		if (activeFilter === "losers") {
			outputList = outputList
				.filter((token) => (token.change24h ?? 0) < 0)
				.sort((a, b) => (a.change24h ?? 0) - (b.change24h ?? 0));
		}

		if (searchQuery.trim()) {
			const lowerCaseQuery = searchQuery.toLowerCase();
			outputList = outputList.filter(
				(token) =>
					token.ticker.toLowerCase().includes(lowerCaseQuery) ||
					token.name.toLowerCase().includes(lowerCaseQuery) ||
					token.ipo?.toLowerCase().includes(lowerCaseQuery),
			);
		}
		return outputList;
	}, [activeFilter, marketsSource, searchQuery]);

	const isRefreshing = stocksQuery.isFetching || reservesQuery.isFetching;

	const onRefresh = useCallback(() => {
		stocksQuery.refetch();
		reservesQuery.refetch();
		ihsgQuery.refetch();
	}, [stocksQuery, reservesQuery, ihsgQuery]);

	return (
		<MarketsUI
			marketsList={filteredMarketsList}
			isLive={!!stocksQuery.data?.length}
			isLoading={stocksQuery.isLoading}
			isError={stocksQuery.isError}
			searchQuery={searchQuery}
			setSearchQuery={setSearchQuery}
			activeFilter={activeFilter}
			setActiveFilter={setActiveFilter}
			onNavigateToDetail={onOpen}
			ihsg={ihsgQuery.data}
			isRefreshing={isRefreshing}
			onRefresh={onRefresh}
		/>
	);
}

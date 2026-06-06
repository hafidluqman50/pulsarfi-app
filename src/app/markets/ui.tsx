import { useEffect, useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, {
	Easing,
	FadeIn,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	Icon,
	Mono,
	ScreenHeader,
	SearchBox,
	Segmented,
	Spark,
	TokenAvatar,
} from "@/components/CoreUI";
import PulsarDot from "@/components/PulsarDot";
import type { IhsgData } from "@/http/hooks/stocks";
import { fmtIDRX, fmtPct, seriesFor, type Token } from "@/lib/mockData";
import { useColors } from "@/lib/theme";
import { makeStyles } from "./style";

// ─── Skeleton row ─────────────────────────────────────────────
function SkeletonRow() {
	const colors = useColors();
	const opacity = useSharedValue(0.4);

	useEffect(() => {
		opacity.value = withRepeat(
			withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		);
	}, [opacity]);

	const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

	return (
		<Animated.View style={[{ flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.hairline }, anim]}>
			<View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: colors.surface2 }} />
			<View style={{ flex: 1, gap: 6 }}>
				<View style={{ width: 80, height: 13, borderRadius: 6, backgroundColor: colors.surface2 }} />
				<View style={{ width: 130, height: 11, borderRadius: 6, backgroundColor: colors.surface2 }} />
			</View>
			<View style={{ width: 52, height: 24, borderRadius: 6, backgroundColor: colors.surface2 }} />
			<View style={{ alignItems: "flex-end", gap: 5 }}>
				<View style={{ width: 76, height: 13, borderRadius: 6, backgroundColor: colors.surface2 }} />
				<View style={{ width: 50, height: 11, borderRadius: 6, backgroundColor: colors.surface2 }} />
			</View>
		</Animated.View>
	);
}

// ─── Scrolling price ticker ────────────────────────────────────
function PriceTicker({ tokens }: { tokens: Token[] }) {
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);
	const tickerTokens = [0, 1, 2].flatMap((cycle) =>
		tokens.map((token) => ({
			...token,
			tickerKey: `${cycle}-${token.ticker}`,
		})),
	);
	const animationOffset = useSharedValue(0);

	useEffect(() => {
		animationOffset.value = withRepeat(
			withTiming(-1000, { duration: 25000, easing: Easing.linear }),
			-1,
			false,
		);
	}, [animationOffset]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: animationOffset.value }],
	}));

	if (!tokens.length) {
		return <View style={[styles.tickerRow, { height: 38 }]} />;
	}

	return (
		<View style={styles.tickerRow}>
			<Animated.View style={[styles.tickerTrack, animatedStyle]}>
				{tickerTokens.map((token) => (
					<View key={token.tickerKey} style={styles.tickerItem}>
						<Mono style={{ fontSize: 11.5, fontWeight: "700" }}>
							{token.ticker}
						</Mono>
						<Mono style={{ color: colors.body, fontSize: 11.5 }}>
							{fmtIDRX(token.price)}
						</Mono>
						<Mono
							style={{
								color:
									(token.change24h ?? 0) >= 0 ? colors.positive : colors.merah,
								fontSize: 11.5,
								fontWeight: "700",
							}}
						>
							{fmtPct(token.change24h)}
						</Mono>
					</View>
				))}
			</Animated.View>
		</View>
	);
}

// ─── IHSG row ─────────────────────────────────────────────────
function IhsgRow({ ihsg, onPress }: { ihsg: IhsgData; onPress: () => void }) {
	const colors = useColors();
	const isUp = ihsg.change24h >= 0;
	const formatted = ihsg.value.toLocaleString("id-ID", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
		>
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				paddingHorizontal: 18,
				paddingVertical: 12,
				borderBottomWidth: 1,
				borderBottomColor: colors.hairline,
			}}
		>
			<View
				style={{
					width: 42,
					height: 42,
					borderRadius: 10,
					backgroundColor: colors.surface2,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Text style={{ fontSize: 11, fontWeight: "700", color: colors.body, letterSpacing: 0.5 }}>
					IDX
				</Text>
			</View>
			<View style={{ flex: 1, minWidth: 0, marginLeft: 13 }}>
				<Text style={{ fontFamily: "Inter_600SemiBold", color: colors.ink, fontSize: 15 }}>
					IHSG
				</Text>
				<Text style={{ fontFamily: "Inter_400Regular", color: colors.body, fontSize: 12.5 }}>
					Jakarta Composite Index
				</Text>
			</View>
			<View style={{ alignItems: "flex-end" }}>
				<Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14.5, color: colors.ink }}>
					{formatted}
				</Text>
				<Text style={{ fontSize: 12, fontWeight: "500", marginTop: 2, color: isUp ? colors.positive : colors.merah }}>
					{fmtPct(ihsg.change24h)}
				</Text>
			</View>
		</View>
		</Pressable>
	);
}

// ─── Section divider ──────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
	const colors = useColors();
	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				paddingHorizontal: 18,
				paddingVertical: 8,
				backgroundColor: colors.surface,
				borderBottomWidth: 1,
				borderBottomColor: colors.hairline,
			}}
		>
			<Text
				style={{
					fontSize: 10,
					fontFamily: "Inter_600SemiBold",
					letterSpacing: 1.2,
					textTransform: "uppercase",
					color: colors.body,
				}}
			>
				{label}
			</Text>
		</View>
	);
}

// ─── Main UI ──────────────────────────────────────────────────
export function MarketsUI({
	marketsList,
	searchQuery,
	setSearchQuery,
	activeFilter,
	setActiveFilter,
	onNavigateToDetail,
	isLive,
	isLoading,
	isError,
	ihsg,
	isRefreshing,
	onRefresh,
}: {
	marketsList: Token[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	activeFilter: "all" | "gainers" | "losers";
	setActiveFilter: (filterValue: "all" | "gainers" | "losers") => void;
	onNavigateToDetail: (ticker: string) => void;
	isLive?: boolean;
	isLoading?: boolean;
	isError?: boolean;
	ihsg?: IhsgData;
	isRefreshing?: boolean;
	onRefresh?: () => void;
}) {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);

	const showSkeleton = isLoading && marketsList.length === 0;

	return (
		<View style={styles.container}>
			<ScreenHeader
				title="Markets"
				eyebrow="IDX equities · open 24/7"
				right={
					<View style={styles.headerRight}>
						<View style={styles.liveBadge}>
							<PulsarDot size={7} />
							<Text style={styles.liveText}>
								{isLoading ? "SYNC" : isLive ? "LIVE" : isError ? "OFFLINE" : "LIVE"}
							</Text>
						</View>
					</View>
				}
			/>
			<View style={styles.filters}>
				<SearchBox value={searchQuery} onChange={setSearchQuery} />
				<Segmented
					value={activeFilter}
					onChange={(value) =>
						setActiveFilter(value as "all" | "gainers" | "losers")
					}
					size="sm"
					options={[
						{ value: "all", label: "All" },
						{ value: "gainers", label: "Gainers" },
						{ value: "losers", label: "Losers" },
					]}
				/>
			</View>

			<PriceTicker tokens={marketsList} />

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing ?? false}
						onRefresh={onRefresh}
						tintColor={colors.merah}
						colors={[colors.merah]}
					/>
				}
			>
				{/* IHSG section */}
				{!!ihsg && !searchQuery.trim() && (
					<>
						<IhsgRow ihsg={ihsg} onPress={() => onNavigateToDetail("IHSG")} />
						<SectionDivider label="Tokenized Stocks" />
					</>
				)}

				{/* Skeleton while loading */}
				{showSkeleton &&
					Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

				{/* Data from API — re-animate on filter change */}
				{!showSkeleton && (
				<Animated.View key={activeFilter} entering={FadeIn.duration(180)}>
				{marketsList.map((token, index) => {
						const isPriceUp = (token.change24h ?? 0) >= 0;
						return (
							<Pressable
								key={token.ticker}
								onPress={() => onNavigateToDetail(token.ticker)}
								style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
							>
								<View
									style={[
										styles.row,
										{ borderBottomWidth: index < marketsList.length - 1 ? 1 : 0 },
									]}
								>
									<TokenAvatar ticker={token.ticker} size={42} />
									<View style={styles.flex1}>
										<View style={styles.nameRow}>
											<Text style={styles.tickerText}>{token.ticker}</Text>
											<Mono style={styles.ipoText}>{token.ipo}</Mono>
										</View>
										<Text numberOfLines={1} style={styles.nameText}>
											{token.name.replace("Pulsar ", "")}
										</Text>
									</View>
									<View style={styles.sparkBox}>
										<Spark
											data={
												token.sparkline?.length
													? token.sparkline
													: seriesFor(token.ticker, 20)
											}
											w={52}
											h={24}
											color={isPriceUp ? colors.positive : colors.merah}
										/>
									</View>
									<View style={styles.priceBox}>
										<Text style={styles.priceText}>
											{fmtIDRX(token.price)}
										</Text>
										<Text
											style={[
												styles.changeText,
												{ color: isPriceUp ? colors.positive : colors.merah },
											]}
										>
											{fmtPct(token.change24h)}
										</Text>
									</View>
								</View>
							</Pressable>
						);
					})}
				</Animated.View>
				)}

				{/* Empty state after search/filter */}
				{!showSkeleton && !isLoading && marketsList.length === 0 && (
					<View style={styles.emptyStateBox}>
						<Icon name="search" size={26} color={colors.body} />
						<Text style={styles.emptyStateText}>
							{searchQuery
								? `Tidak ada hasil untuk "${searchQuery}"`
								: activeFilter === "gainers"
								? "Tidak ada gainers hari ini."
								: activeFilter === "losers"
								? "Tidak ada losers hari ini."
								: "Tidak ada data. Periksa koneksi."}
						</Text>
					</View>
				)}

				<View style={styles.bottomPadding} />
			</ScrollView>
		</View>
	);
}

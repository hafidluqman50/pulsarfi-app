import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Easing, View } from "react-native";
import ActivityScreen from "@/app/activity/page";
import CustodianScreen from "@/app/custodian/page";
import MarketsScreen from "@/app/markets/page";
import PortfolioScreen from "@/app/portfolio/page";
import SwapScreen, { type TradePreset } from "@/app/swap/page";
import { AppBar, type ConnectedWallet } from "@/components/Account";
import { BottomNav } from "@/components/BottomNav";
import type { ActivityItem, Portfolio, Token } from "@/lib/mockData";
import { useTheme } from "@/lib/theme";

const Tab = createBottomTabNavigator();

type SwapTabProps = {
	route: { params?: { preset?: TradePreset } };
	navigation: { setParams: (params: { preset?: undefined }) => void };
};

type MainTabsProps = {
	wallet: ConnectedWallet;
	total: number;
	allTokens: Token[];
	balances: Portfolio;
	costBasis: Portfolio;
	activity: ActivityItem[];
	onAccount: () => void;
	onNavigateToDetail: (ticker: string) => void;
};

export function MainTabs({
	wallet,
	total,
	allTokens,
	balances,
	costBasis,
	activity,
	onAccount,
	onNavigateToDetail,
}: MainTabsProps) {
	const { colors } = useTheme();
	const isCustodian = wallet.role === "custodian";

	return (
		<View style={{ flex: 1, backgroundColor: colors.canvas }}>
			<AppBar wallet={wallet} total={total} onAccount={onAccount} />
			<Tab.Navigator
				screenOptions={{
					headerShown: false,
					lazy: true,
					animation: "shift",
					transitionSpec: {
						animation: "timing",
						config: { duration: 90, easing: Easing.out(Easing.quad) },
					},
					sceneStyle: { backgroundColor: colors.canvas },
				}}
				tabBar={(props) => <BottomNav {...props} role={wallet.role} />}
			>
				<Tab.Screen name="markets">
					{() => <MarketsScreen onOpen={onNavigateToDetail} />}
				</Tab.Screen>

				{!isCustodian && (
					<Tab.Screen name="swap">
						{({ route, navigation }: SwapTabProps) => (
							<SwapScreen
								balances={balances}
								onSwap={() => {}}
								preset={route.params?.preset ?? null}
								clearPreset={() => navigation.setParams({ preset: undefined })}
							/>
						)}
					</Tab.Screen>
				)}

				{!isCustodian && (
					<Tab.Screen name="portfolio">
						{() => (
							<PortfolioScreen
								allTokens={allTokens}
								balances={balances}
								costBasis={costBasis}
								onOpen={onNavigateToDetail}
							/>
						)}
					</Tab.Screen>
				)}

				{!isCustodian && (
					<Tab.Screen name="activity">
						{() => <ActivityScreen activity={activity} />}
					</Tab.Screen>
				)}

				{isCustodian && (
					<Tab.Screen name="custodian" component={CustodianScreen} />
				)}
			</Tab.Navigator>
		</View>
	);
}

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { useAccount, useAppKit, useProvider } from "@reown/appkit-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { createBlankStackNavigator } from "react-native-screen-transitions/blank-stack";
import { toast } from "sonner-native";
import StockDetailScreen from "@/app/detail/page";
import OnboardingScreen from "@/app/onboarding/page";
import type { TradePreset } from "@/app/swap/page";
import { AccountSheet, type ConnectedWallet } from "@/components/Account";
import { SplashFrame } from "@/components/SplashFrame";
import {
	useSiweVerifySession,
	type WalletRequestProvider,
} from "@/http/hooks/auth";
import { useBootstrap } from "@/http/hooks/bootstrap";
import { usePortfolioData } from "@/http/hooks/portfolioData";
import { MainTabs } from "@/navigation/MainTabs";
import { iosCardStackTransition } from "@/navigation/transitions";

const Stack = createBlankStackNavigator();

type MainScreenProps = {
	navigation: {
		navigate: (screen: "Detail", params: { ticker: string }) => void;
		dispatch: (action: unknown) => void;
	};
};

type SwapNavigation = {
	dispatch: (action: unknown) => void;
};

type DetailScreenProps = {
	navigation: {
		dispatch: (action: unknown) => void;
		goBack: () => void;
	};
	route: {
		params?: {
			ticker?: string;
		};
	};
};

export default function AppContent() {
	const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
	const [forceIntro, setForceIntro] = useState(false);
	const accountSheetRef = useRef<BottomSheetModal>(null);

	const { address, isConnected } = useAccount();
	const { provider } = useProvider();
	const { disconnect } = useAppKit();
	const siweSession = useSiweVerifySession();

	const { bootstrapped, onboarded, lastWallet, markOnboarded, setLastWallet } =
		useBootstrap();
	const {
		allTokens,
		balances,
		costBasis,
		activity,
		total,
		isStocksLoading,
		isBalancesLoading,
	} = usePortfolioData(address);

	const persistWallet = useCallback(
		(nextWallet: ConnectedWallet) => {
			setWallet(nextWallet);
			setLastWallet(nextWallet.name);
			setForceIntro(false);
			markOnboarded();
			toast.success("Wallet Connected", {
				description: `${nextWallet.address.slice(0, 6)}...${nextWallet.address.slice(-4)} is ready.`,
			});
			AsyncStorage.multiSet([
				["pf_onboarded", "1"],
				["pf_last_wallet", nextWallet.name],
			]).catch(() => {});
		},
		[markOnboarded, setLastWallet],
	);

	useEffect(() => {
		if (!isConnected || !address || !provider || siweSession.isPending) return;
		if (wallet?.address?.toLowerCase() === address.toLowerCase()) return;

		siweSession.mutate(
			{ address, provider: provider as WalletRequestProvider },
			{
				onSuccess: ({ address: verifiedAddress, name, role }) => {
					persistWallet({ address: verifiedAddress, name, role });
					toast.success("SIWE Verified", {
						description: "Session restored securely.",
					});
				},
				onError: async (err) => {
					console.error("[auth] SIWE verify failed:", err);
					toast.error("Sign-in failed", {
						description: err instanceof Error ? err.message : String(err),
					});
					await disconnect();
					setWallet(null);
				},
			},
		);
	}, [
		address,
		disconnect,
		isConnected,
		persistWallet,
		provider,
		siweSession,
		wallet?.address,
	]);

	const handleDisconnect = async () => {
		accountSheetRef.current?.dismiss();
		await disconnect();
		await AsyncStorage.multiRemove(["access_token", "pf_session_address"]);
		setTimeout(() => setWallet(null), 220);
	};

	const navigateToSwap = useCallback(
		(navigation: SwapNavigation, preset: NonNullable<TradePreset>) => {
			navigation.dispatch(
				StackActions.popTo("Main", {
					screen: "swap",
					params: { preset },
				}),
			);
		},
		[],
	);

	const isReady =
		bootstrapped && !isStocksLoading && (!address || !isBalancesLoading);

	if (!bootstrapped) return <SplashFrame isReady={isReady}>{null}</SplashFrame>;

	if (!wallet) {
		return (
			<SplashFrame isReady={isReady}>
				<OnboardingScreen
					mode={forceIntro || !onboarded ? "intro" : "connect"}
					isSiweLoading={siweSession.isPending}
					onSkip={() => {
						markOnboarded();
						setForceIntro(false);
					}}
					lastWalletName={lastWallet}
					onShowIntro={() => setForceIntro(true)}
				/>
			</SplashFrame>
		);
	}

	return (
		<SplashFrame isReady={isReady}>
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen name="Main">
						{({ navigation }: MainScreenProps) => (
							<MainTabs
								wallet={wallet}
								total={total}
								allTokens={allTokens}
								balances={balances}
								costBasis={costBasis}
								activity={activity}
								onAccount={() => accountSheetRef.current?.present()}
								onNavigateToDetail={(ticker) =>
									navigation.navigate("Detail", { ticker })
								}
							/>
						)}
					</Stack.Screen>
					<Stack.Screen name="Detail" options={iosCardStackTransition}>
						{({ navigation, route }: DetailScreenProps) => (
							<StockDetailScreen
								ticker={route.params?.ticker as string}
								balances={balances}
								costBasis={costBasis}
								onBack={() => navigation.goBack()}
								onTrade={(side: "buy" | "sell", ticker: string) =>
									navigateToSwap(navigation, { side, ticker })
								}
							/>
						)}
					</Stack.Screen>
				</Stack.Navigator>
			</NavigationContainer>
			<AccountSheet
				sheetRef={accountSheetRef}
				wallet={wallet}
				total={total}
				onDisconnect={handleDisconnect}
			/>
		</SplashFrame>
	);
}

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { WagmiProvider } from "wagmi";
import AppContent from "@/app/main";
import FontLoader from "@/components/FontLoader";
import { AppKit, AppKitProvider, appKit, wagmiAdapter } from "@/lib/appKit";
import { ThemeProvider, useTheme } from "@/lib/theme";

const queryClient = new QueryClient();

function ThemedApp() {
	const { isDark, colors } = useTheme();

	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.canvas }}>
			<SafeAreaProvider>
				<AppKitProvider instance={appKit}>
					<WagmiProvider config={wagmiAdapter.wagmiConfig}>
						<QueryClientProvider client={queryClient}>
							<BottomSheetModalProvider>
								<FontLoader>
									<View style={{ flex: 1, backgroundColor: colors.canvas }}>
										<StatusBar
											style={isDark ? "light" : "dark"}
											backgroundColor={colors.canvas}
										/>
										<AppContent />
										<View
											pointerEvents="box-none"
											style={{
												position: "absolute",
												top: 0,
												right: 0,
												bottom: 0,
												left: 0,
											}}
										>
											<AppKit />
										</View>
									</View>
								</FontLoader>
								<Toaster theme={isDark ? "dark" : "light"} />
							</BottomSheetModalProvider>
						</QueryClientProvider>
					</WagmiProvider>
				</AppKitProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

export function RootApp() {
	return (
		<ThemeProvider>
			<ThemedApp />
		</ThemeProvider>
	);
}

import React, { useMemo } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eyebrow, Icon } from "@/components/CoreUI";
import { useColors } from "@/lib/theme";
import { makeStyles } from "./style";

export function OnboardingUI({
	isSheetVisible,
	setIsSheetVisible,
	connectingWalletId,
	availableWallets,
	onConnectWallet,
}: any) {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);

	const closeSheet = React.useCallback(() => {
		if (connectingWalletId) return;
		setIsSheetVisible(false);
	}, [connectingWalletId, setIsSheetVisible]);

	const openSheet = React.useCallback(() => {
		setIsSheetVisible(true);
	}, [setIsSheetVisible]);

	return (
		<View style={styles.container}>
			<View style={[styles.topContent, { paddingTop: Math.max(insets.top, 34) }]}>
				<View style={styles.brandBand}>
					<View style={styles.brandDot} />
					<Text style={styles.brandText}>PulsarFi</Text>
					<View style={styles.chainBadge}>
						<Eyebrow style={styles.chainText}>Arbitrum</Eyebrow>
					</View>
				</View>

				<View style={styles.heroSection}>
					<Eyebrow style={styles.heroEyebrow}>
						The Trading Floor · No. 0142
					</Eyebrow>
					<Text style={styles.heroTitle}>
						{"Indonesia's\nmarket,\n"}
						<Text style={styles.heroTitleItalic}>unbound</Text>
						{"\nfrom its hours."}
					</Text>
					<Text style={styles.heroDesc}>
						Tokenized IDX equities, backed 1:1 in custody. Trade around the
						clock, settle in seconds.
					</Text>
				</View>

				<View style={styles.statStrip}>
					{[
						{ key: "Equities", value: "8" },
						{ key: "Custodians", value: "5" },
						{ key: "Settlement", value: "~2s" },
					].map((stat, index) => (
						<View
							key={stat.key}
							style={[styles.statItem, index ? styles.statItemBorder : null]}
						>
							<Text style={styles.statValue}>{stat.value}</Text>
							<Eyebrow style={styles.statKey}>{stat.key}</Eyebrow>
						</View>
					))}
				</View>
			</View>

			<View style={[styles.ctaDock, { paddingBottom: Math.max(34, insets.bottom + 16) }]}>
				<TouchableOpacity
					onPressIn={openSheet}
					activeOpacity={0.86}
					hitSlop={8}
					style={styles.connectButton}
				>
					<Icon name="wallet" size={18} color="#fff" />
					<Text style={styles.connectButtonText}>Connect wallets</Text>
				</TouchableOpacity>
				<View style={styles.liveBadge}>
					<View style={styles.liveDot} />
					<Text style={styles.liveText}>Live on Arbitrum mainnet · 13M investors waiting</Text>
				</View>
			</View>

			<Modal
				visible={isSheetVisible}
				transparent
				animationType="slide"
				statusBarTranslucent
				onRequestClose={closeSheet}
			>
				<View style={styles.modalRoot}>
					<Pressable onPress={closeSheet} style={styles.modalBackdrop} />
					<View style={styles.modalSheet}>
						<View style={styles.modalHandleWrap}>
							<View style={styles.sheetHandle} />
						</View>
						<ScrollView
							bounces={false}
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={[
								styles.sheetContent,
								{ paddingBottom: Math.max(24, insets.bottom + 10) },
							]}
						>
							<View style={styles.sheetTitleRow}>
								<Text style={styles.sheetTitle}>Connect a wallet</Text>
								<Pressable onPress={closeSheet} style={styles.sheetClose}>
									<Icon name="x" size={16} color={colors.body} />
								</Pressable>
							</View>
							<Text style={styles.sheetDesc}>
								Anyone can hold and trade pStocks. KYC only kicks in at redemption —
								same model as USDC.
							</Text>
							<View style={styles.walletList}>
								{availableWallets.map((wallet: any) => {
									const isBusy = connectingWalletId === wallet.id;
									return (
										<TouchableOpacity
											key={wallet.id}
											disabled={!!connectingWalletId}
											onPressIn={() => onConnectWallet(wallet)}
											activeOpacity={0.7}
											style={[
												styles.walletItem,
												{ opacity: connectingWalletId && !isBusy ? 0.5 : 1 },
											]}
										>
											<View style={[styles.walletIconBox, { backgroundColor: wallet.tint || wallet.color }]}>
												<Text style={styles.walletIconText}>{wallet.glyph || wallet.initial}</Text>
											</View>
											<View style={styles.walletFlex}>
												<Text style={styles.walletName}>{wallet.name}</Text>
												<Text style={styles.walletStatus}>
													{isBusy ? "Approve in wallet..." : "Detected"}
												</Text>
											</View>
											{isBusy ? (
												<ActivityIndicator color={colors.merah} size="small" />
											) : (
												<Icon name="chevron-right" size={18} color={colors.body} />
											)}
										</TouchableOpacity>
									);
								})}
							</View>
							<View style={styles.demoNotice}>
								<Icon name="info" size={16} color={colors.merah} style={styles.demoNoticeIcon} />
								<Text style={styles.demoNoticeText}>
									Testnet demo wallet - no real funds. You'll start with a seeded portfolio.
								</Text>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
}

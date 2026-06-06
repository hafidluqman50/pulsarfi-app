import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eyebrow, fonts, Icon } from "@/components/CoreUI";
import { fmtIDRX, shortAddr } from "@/lib/mockData";
import { type Colors, useColors, useTheme } from "@/lib/theme";

export type ConnectedWallet = {
	address: string;
	name: string;
	role: "user" | "custodian";
};

function hashColor(addr: string, offset = 0) {
	let h = offset;
	for (const char of addr || "0x0") h = (h * 31 + char.charCodeAt(0)) >>> 0;
	const palette = [
		"#c8102e",
		"#1f4d8a",
		"#1f7a4b",
		"#6f2da8",
		"#9a0c24",
		"#2a231e",
	];
	return palette[h % palette.length];
}

export function Identicon({
	address,
	size = 30,
}: {
	address: string;
	size?: number;
}) {
	const color = hashColor(address);
	return (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: 99,
				backgroundColor: color,
				borderWidth: 1,
				borderColor: "rgba(255,255,255,.34)",
			}}
		>
			<View
				style={{
					position: "absolute",
					right: 2,
					bottom: 2,
					width: size * 0.38,
					height: size * 0.38,
					borderRadius: 99,
					backgroundColor: hashColor(address, 17),
					opacity: 0.9,
				}}
			/>
		</View>
	);
}

export function AppBar({
	wallet,
	total,
	onAccount,
}: {
	wallet: ConnectedWallet;
	total: number;
	onAccount: () => void;
}) {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);

	return (
		<View style={[styles.appBar, { paddingTop: Math.max(insets.top, 8) + 20 }]}>
			<View style={styles.brandDot} />
			<Text style={styles.brandText}>PulsarFi</Text>
			<View style={{ flex: 1 }} />
			<TouchableOpacity
				onPressIn={onAccount}
				activeOpacity={0.78}
				style={styles.accountChip}
			>
				<Text style={styles.accountTotal}>
					{fmtIDRX(total, { min: 0, max: 0 })}
				</Text>
				<Text style={styles.accountAddress}>{shortAddr(wallet.address)}</Text>
				<Identicon address={wallet.address} size={26} />
			</TouchableOpacity>
		</View>
	);
}

function AccountRow({
	icon,
	label,
	sub,
	onPress,
	children,
}: {
	icon: React.ComponentProps<typeof Icon>["name"];
	label: string;
	sub?: string;
	onPress?: () => void;
	children?: React.ReactNode;
}) {
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);
	const Wrapper = onPress ? TouchableOpacity : View;

	return (
		<Wrapper
			{...(onPress ? { onPressIn: onPress, activeOpacity: 0.72 } : {})}
			style={styles.row}
		>
			<View style={styles.rowIcon}>
				<Icon name={icon} size={16} color={colors.ink} />
			</View>
			<View style={styles.rowCopy}>
				<Text style={styles.rowLabel}>{label}</Text>
				{sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
			</View>
			{children ??
				(onPress ? (
					<Icon name="chevron-right" size={17} color={colors.body} />
				) : null)}
		</Wrapper>
	);
}

export function AccountSheet({
	sheetRef,
	wallet,
	total,
	onDisconnect,
}: {
	sheetRef: React.RefObject<BottomSheetModal | null>;
	wallet: ConnectedWallet;
	total: number;
	onDisconnect: () => void;
}) {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const { isDark, toggleTheme } = useTheme();
	const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
	const snapPoints = useMemo(() => ["64%", "88%"], []);
	const [copied, setCopied] = useState(false);
	const [confirming, setConfirming] = useState(false);

	const dismissSheet = useCallback(() => {
		sheetRef.current?.dismiss();
	}, [sheetRef]);

	const handleDismiss = useCallback(() => {
		setCopied(false);
		setConfirming(false);
	}, []);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				opacity={0.46}
				pressBehavior="close"
			/>
		),
		[],
	);

	const copyAddress = () => {
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<BottomSheetModal
			ref={sheetRef}
			index={1}
			snapPoints={snapPoints}
			onDismiss={handleDismiss}
			backdropComponent={renderBackdrop}
			enablePanDownToClose
			handleIndicatorStyle={styles.handle}
			backgroundStyle={styles.sheet}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
		>
			<BottomSheetScrollView
				bounces={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={[
					styles.sheetContent,
					{ paddingBottom: Math.max(88, insets.bottom + 72) },
				]}
			>
				<View style={styles.sheetTitleRow}>
					<Text style={styles.sheetTitle}>Account</Text>
					<Pressable onPress={dismissSheet} style={styles.closeButton}>
						<Icon name="x" size={16} color={colors.body} />
					</Pressable>
				</View>

				<View style={styles.identityCard}>
					<Identicon address={wallet.address} size={48} />
					<View style={{ flex: 1, minWidth: 0 }}>
						<View style={styles.identityNameRow}>
							<Text style={styles.identityName}>{wallet.name}</Text>
							<View style={styles.networkBadge}>
								<Text style={styles.networkBadgeText}>Arbitrum</Text>
							</View>
						</View>
						<Text style={styles.identityAddress}>
							{wallet.address.slice(0, 12)}...{wallet.address.slice(-6)}
						</Text>
					</View>
				</View>

				<View style={styles.statRow}>
					<View style={styles.valueCard}>
						<Eyebrow style={styles.valueEyebrow}>Portfolio value</Eyebrow>
						<Text style={styles.valueText}>{fmtIDRX(total)}</Text>
					</View>
					<View style={styles.networkCard}>
						<Eyebrow style={styles.valueEyebrow}>Network</Eyebrow>
						<View style={styles.onlineRow}>
							<View style={styles.onlineDot} />
							<Text style={styles.onlineText}>Online</Text>
						</View>
					</View>
				</View>

				<View style={styles.rowsCard}>
					<AccountRow
						icon={copied ? "check" : "copy"}
						label={copied ? "Copied!" : "Copy address"}
						sub={shortAddr(wallet.address)}
						onPress={copyAddress}
					/>
					<View style={styles.rowDivider} />
					<AccountRow
						icon="external"
						label="View on Arbiscan"
						sub="Block explorer"
						onPress={() => {}}
					/>
					<View style={styles.rowDivider} />
					<AccountRow icon="moon" label="Dark mode">
						<Switch
							value={isDark}
							onValueChange={toggleTheme}
							trackColor={{ false: colors.hairlineStrong, true: colors.merah }}
							thumbColor="#fff"
						/>
					</AccountRow>
				</View>

				<View style={styles.disconnectWrap}>
					{confirming ? (
						<View style={styles.confirmBox}>
							<Text style={styles.confirmText}>
								Disconnect <Text style={styles.confirmBold}>{wallet.name}</Text>
								? Your seeded demo balances will reset.
							</Text>
							<View style={styles.confirmActions}>
								<TouchableOpacity
									onPressIn={() => setConfirming(false)}
									activeOpacity={0.76}
									style={styles.cancelButton}
								>
									<Text style={styles.cancelButtonText}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPressIn={onDisconnect}
									activeOpacity={0.76}
									style={styles.disconnectButton}
								>
									<Icon name="power" size={16} color="#fff" />
									<Text style={styles.disconnectButtonText}>Disconnect</Text>
								</TouchableOpacity>
							</View>
						</View>
					) : (
						<TouchableOpacity
							onPressIn={() => setConfirming(true)}
							activeOpacity={0.76}
							style={styles.outlineDisconnect}
						>
							<Icon name="power" size={17} color={colors.merah} />
							<Text style={styles.outlineDisconnectText}>
								Disconnect wallet
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
}

const makeStyles = (c: Colors, isDark = false) =>
	StyleSheet.create({
		appBar: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			paddingHorizontal: 18,
			paddingBottom: 6,
			backgroundColor: c.canvas,
			zIndex: 6,
		},
		brandDot: {
			width: 12,
			height: 12,
			borderRadius: 99,
			backgroundColor: c.merah,
		},
		brandText: {
			fontFamily: fonts.display,
			fontSize: 17,
			color: c.ink,
			letterSpacing: -0.17,
		},
		accountChip: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			paddingLeft: 12,
			paddingRight: 6,
			paddingVertical: 5,
			backgroundColor: c.surface,
			borderWidth: 1,
			borderColor: c.hairline,
			borderRadius: 99,
		},
		accountTotal: {
			fontFamily: fonts.mono,
			fontSize: 12,
			fontWeight: "700",
			color: c.ink,
		},
		accountAddress: { fontFamily: fonts.mono, fontSize: 11.5, color: c.body },
		modalRoot: { flex: 1, justifyContent: "flex-end" },
		modalBackdrop: {
			position: "absolute",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			backgroundColor: "rgba(8,6,5,.46)",
		},
		sheet: {
			maxHeight: "88%",
			backgroundColor: c.surface,
			borderTopLeftRadius: 26,
			borderTopRightRadius: 26,
			borderTopWidth: 1,
			borderTopColor: c.hairline,
		},
		handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 10 },
		handle: {
			width: 40,
			height: 4.5,
			borderRadius: 99,
			backgroundColor: c.hairlineStrong,
			opacity: 0.7,
		},
		sheetContent: { paddingHorizontal: 20 },
		sheetTitleRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingBottom: 14,
		},
		sheetTitle: {
			fontFamily: fonts.display,
			fontSize: 21,
			color: c.ink,
			letterSpacing: -0.42,
		},
		closeButton: {
			width: 32,
			height: 32,
			borderRadius: 99,
			backgroundColor: c.surface2,
			borderWidth: 1,
			borderColor: c.hairline,
			alignItems: "center",
			justifyContent: "center",
		},
		identityCard: {
			flexDirection: "row",
			alignItems: "center",
			gap: 14,
			padding: 16,
			backgroundColor: isDark ? "#0b0908" : c.ink,
			borderRadius: 18,
			marginBottom: 16,
		},
		identityNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
		identityName: { fontFamily: fonts.sansSemi, fontSize: 16, color: "#fff" },
		networkBadge: {
			borderWidth: 1,
			borderColor: c.merah,
			paddingHorizontal: 7,
			paddingVertical: 2,
			borderRadius: 99,
		},
		networkBadgeText: {
			fontFamily: fonts.sansSemi,
			fontSize: 10,
			letterSpacing: 0.8,
			textTransform: "uppercase",
			color: c.merah,
		},
		identityAddress: {
			fontFamily: fonts.mono,
			fontSize: 12.5,
			color: "rgba(255,255,255,.6)",
			marginTop: 3,
		},
		statRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
		valueCard: {
			flex: 1,
			paddingVertical: 13,
			paddingHorizontal: 15,
			backgroundColor: c.surface2,
			borderWidth: 1,
			borderColor: c.hairline,
			borderRadius: 16,
		},
		networkCard: {
			paddingVertical: 13,
			paddingHorizontal: 15,
			backgroundColor: c.surface2,
			borderWidth: 1,
			borderColor: c.hairline,
			borderRadius: 16,
			alignItems: "center",
		},
		valueEyebrow: { marginBottom: 6 },
		valueText: {
			fontFamily: fonts.mono,
			fontSize: 19,
			fontWeight: "700",
			color: c.ink,
		},
		onlineRow: { flexDirection: "row", alignItems: "center", gap: 6 },
		onlineDot: {
			width: 7,
			height: 7,
			borderRadius: 99,
			backgroundColor: c.positive,
		},
		onlineText: { fontFamily: fonts.sansSemi, fontSize: 13, color: c.positive },
		rowsCard: {
			borderWidth: 1,
			borderColor: c.hairline,
			borderRadius: 16,
			overflow: "hidden",
			backgroundColor: c.surface,
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			gap: 13,
			paddingVertical: 13,
			paddingHorizontal: 15,
		},
		rowIcon: {
			width: 32,
			height: 32,
			borderRadius: 9,
			backgroundColor: c.surface2,
			borderWidth: 1,
			borderColor: c.hairline,
			alignItems: "center",
			justifyContent: "center",
		},
		rowCopy: { flex: 1, minWidth: 0 },
		rowLabel: { fontFamily: fonts.sansSemi, fontSize: 14, color: c.ink },
		rowSub: {
			fontFamily: fonts.mono,
			fontSize: 11.5,
			color: c.body,
			marginTop: 1,
		},
		rowDivider: { height: 1, backgroundColor: c.hairline },
		disconnectWrap: { marginTop: 16 },
		outlineDisconnect: {
			minHeight: 56,
			borderRadius: 14,
			borderWidth: 1,
			borderColor: c.merah,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 9,
		},
		outlineDisconnectText: {
			fontFamily: fonts.sansSemi,
			fontSize: 15,
			color: c.merah,
		},
		confirmBox: {
			padding: 14,
			backgroundColor: c.merahSoft,
			borderWidth: 1,
			borderColor: c.merah,
			borderRadius: 16,
			gap: 10,
		},
		confirmText: {
			fontFamily: fonts.sans,
			fontSize: 13.5,
			lineHeight: 20,
			color: c.inkSoft,
		},
		confirmBold: { fontFamily: fonts.sansSemi, color: c.ink },
		confirmActions: { flexDirection: "row", gap: 10 },
		cancelButton: {
			flex: 1,
			minHeight: 48,
			borderRadius: 14,
			backgroundColor: c.surface2,
			borderWidth: 1,
			borderColor: c.hairline,
			alignItems: "center",
			justifyContent: "center",
		},
		cancelButtonText: {
			fontFamily: fonts.sansSemi,
			fontSize: 14,
			color: c.ink,
		},
		disconnectButton: {
			flex: 1,
			minHeight: 48,
			borderRadius: 14,
			backgroundColor: c.merah,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
		},
		disconnectButtonText: {
			fontFamily: fonts.sansSemi,
			fontSize: 14,
			color: "#fff",
		},
	});

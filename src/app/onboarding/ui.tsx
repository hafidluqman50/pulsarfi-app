import { useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Carousel, {
	type ICarouselInstance,
} from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eyebrow, Icon, TokenAvatar } from "@/components/CoreUI";
import { fmtPct, PSTOCKS } from "@/lib/mockData";
import { useColors } from "@/lib/theme";
import { makeStyles } from "./style";

export type WalletOption = {
	id: string;
	name: string;
	tint: string;
	glyph: string;
};

type IntroSlide = {
	eyebrow: string;
	visual: "hero" | "clock" | "shield";
	head: (string | { it: string })[];
	body: string;
};

const INTRO: IntroSlide[] = [
	{
		eyebrow: "The Trading Floor · No. 0142",
		visual: "hero",
		head: ["Indonesia's", "market,", { it: "unbound" }, "from its hours."],
		body: "Tokenized IDX equities, backed 1:1 in custody. Trade around the clock - long after Jakarta closes.",
	},
	{
		eyebrow: "Always open",
		visual: "clock",
		head: ["Markets that", { it: "never" }, "sleep."],
		body: "BBRIP, BMRIP, BUMIP and more - settle on-chain in seconds, nights and weekends included.",
	},
	{
		eyebrow: "Real backing",
		visual: "shield",
		head: ["Every token is", "a", { it: "real" }, "share."],
		body: "Held 1:1 by licensed custodians under a 3-of-5 multisig. Audited reserves, on-chain proof.",
	},
];

function BrandBar({
	showChain,
	onSkip,
}: {
	showChain?: boolean;
	onSkip?: () => void;
}) {
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.brandBand, { paddingTop: Math.max(insets.top, 8) + 20 }]}>
			<View style={styles.brandDot} />
			<Text style={styles.brandText}>PulsarFi</Text>
			<View style={{ flex: 1 }} />
			{showChain ? (
				<View style={styles.chainBadge}>
					<Eyebrow style={styles.chainText}>Arbitrum</Eyebrow>
				</View>
			) : onSkip ? (
				<Pressable onPress={onSkip} hitSlop={8}>
					<Text style={styles.skipText}>Skip</Text>
				</Pressable>
			) : null}
		</View>
	);
}

function IntroVisual({ kind }: { kind: string }) {
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);

	if (kind === "hero") {
		return (
			<View style={styles.visualTokens}>
				{["BBRIP", "BMRIP", "BUMIP", "PTROP"].map((ticker) => (
					<TokenAvatar key={ticker} ticker={ticker} size={52} />
				))}
			</View>
		);
	}

	return (
		<View style={styles.visualIconBox}>
			<Icon
				name={kind === "clock" ? "clock" : "shield"}
				size={40}
				color={colors.merah}
				stroke={1.6}
			/>
		</View>
	);
}

function HeroTitle({
	parts,
}: {
	parts: readonly (string | { readonly it: string })[];
}) {
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);

	return (
		<Text style={styles.heroTitle}>
			{parts.map((part, index) => {
				const end = index < parts.length - 1 ? "\n" : "";
				if (typeof part === "string") return `${part}${end}`;
				return (
					<Text key={`it-${part.it}`} style={styles.heroTitleItalic}>
						{part.it}
						{end}
					</Text>
				);
			})}
		</Text>
	);
}

export function WalletSheet({
	visible,
	onClose,
	wallets,
	connectingWalletId,
	onConnectWallet,
}: {
	visible: boolean;
	onClose: () => void;
	wallets: WalletOption[];
	connectingWalletId: string | null;
	onConnectWallet: (wallet: WalletOption, done?: () => void) => void;
}) {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);

	const closeSheet = () => {
		if (!connectingWalletId) onClose();
	};

	return (
		<Modal
			visible={visible}
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
							Anyone can hold and trade pStocks. KYC only kicks in at redemption
							- same model as USDC.
						</Text>
						<View style={styles.walletList}>
							{wallets.map((wallet) => {
								const isBusy = connectingWalletId === wallet.id;
								return (
									<TouchableOpacity
										key={wallet.id}
										disabled={!!connectingWalletId}
										onPressIn={() => onConnectWallet(wallet)}
										activeOpacity={0.72}
										style={[
											styles.walletItem,
											{ opacity: connectingWalletId && !isBusy ? 0.5 : 1 },
										]}
									>
										<View
											style={[
												styles.walletIconBox,
												{ backgroundColor: wallet.tint },
											]}
										>
											<Text style={styles.walletIconText}>{wallet.glyph}</Text>
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
											<Icon
												name="chevron-right"
												size={18}
												color={colors.body}
											/>
										)}
									</TouchableOpacity>
								);
							})}
						</View>
						<View style={styles.demoNotice}>
							<Icon
								name="info"
								size={16}
								color={colors.merah}
								style={styles.demoNoticeIcon}
							/>
							<Text style={styles.demoNoticeText}>
								Testnet demo wallet - no real funds. You'll start with a seeded
								portfolio.
							</Text>
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

export function OnboardingUI({
	wallets,
	connectingWalletId,
	onConnectWallet,
	onSkip,
}: {
	wallets: WalletOption[];
	connectingWalletId: string | null;
	onConnectWallet: (wallet: WalletOption, done?: () => void) => void;
	onSkip?: () => void;
}) {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);
	const [step, setStep] = useState(0);
	const [sheetVisible, setSheetVisible] = useState(false);
	const [carouselSize, setCarouselSize] = useState({ width: 0, height: 0 });
	const carouselRef = useRef<ICarouselInstance>(null);
	const last = step === INTRO.length - 1;

	const goToStep = (index: number) => {
		const next = Math.max(0, Math.min(INTRO.length - 1, index));
		setStep(next);
		carouselRef.current?.scrollTo({ index: next, animated: true });
	};

	return (
		<View className="flex-1" style={styles.container}>
			<View style={[styles.introTop, { paddingTop: Math.max(insets.top, 20) }]}>
				<BrandBar onSkip={!last ? onSkip : undefined} />
			</View>

			<View
				style={styles.sliderShell}
				onLayout={(event) => setCarouselSize(event.nativeEvent.layout)}
			>
				{carouselSize.width > 0 && carouselSize.height > 0 ? (
					<Carousel
						ref={carouselRef}
						data={INTRO}
						width={carouselSize.width}
						height={carouselSize.height}
						loop={false}
						pagingEnabled
						snapEnabled
						overscrollEnabled={false}
						scrollAnimationDuration={360}
						onSnapToItem={setStep}
						renderItem={({ item }) => (
							<View style={styles.slide}>
								<View style={styles.visualWrap}>
									<IntroVisual kind={item.visual} />
								</View>
								<View style={styles.heroSection}>
									<Eyebrow style={styles.heroEyebrow}>{item.eyebrow}</Eyebrow>
									<HeroTitle parts={item.head} />
									<Text style={styles.heroDesc}>{item.body}</Text>
								</View>
							</View>
						)}
					/>
				) : null}
			</View>

			<View
				style={[
					styles.introDock,
					{ paddingBottom: Math.max(18, insets.bottom + 12) },
				]}
			>
				<View style={styles.dots}>
					{INTRO.map((item, index) => (
						<Pressable
							key={item.eyebrow}
							onPress={() => goToStep(index)}
							hitSlop={8}
						>
							<View style={[styles.dot, index === step && styles.dotActive]} />
						</Pressable>
					))}
				</View>
				<TouchableOpacity
					onPressIn={() => (last ? setSheetVisible(true) : goToStep(step + 1))}
					activeOpacity={0.86}
					style={styles.connectButton}
				>
					<Icon
						name={last ? "wallet" : "chevron-right"}
						size={18}
						color="#fff"
					/>
					<Text style={styles.connectButtonText}>
						{last ? "Connect wallet" : "Continue"}
					</Text>
				</TouchableOpacity>
				<View style={styles.liveBadge}>
					<View style={styles.liveDot} />
					<Text style={styles.liveText}>
						Live on Arbitrum · 13M investors waiting
					</Text>
				</View>
			</View>

			<WalletSheet
				visible={sheetVisible}
				onClose={() => setSheetVisible(false)}
				wallets={wallets}
				connectingWalletId={connectingWalletId}
				onConnectWallet={onConnectWallet}
			/>
		</View>
	);
}

export function ConnectHomeUI({
	wallets,
	connectingWalletId,
	lastWalletName,
	onConnectWallet,
	onShowIntro,
}: {
	wallets: WalletOption[];
	connectingWalletId: string | null;
	lastWalletName?: string | null;
	onConnectWallet: (wallet: WalletOption, done?: () => void) => void;
	onShowIntro?: () => void;
}) {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const styles = useMemo(() => makeStyles(colors), [colors]);
	const [sheetVisible, setSheetVisible] = useState(false);
	const known = lastWalletName
		? wallets.find((wallet) => wallet.name === lastWalletName)
		: undefined;
	const pulse = PSTOCKS.slice(0, 3);
	const isConnectingKnown = !!known && connectingWalletId === known.id;

	const quickConnect = () => {
		if (!known) {
			setSheetVisible(true);
			return;
		}
		onConnectWallet(known);
	};

	return (
		<View className="flex-1" style={styles.container}>
			<View style={[styles.introTop, { paddingTop: Math.max(insets.top, 20) }]}>
				<BrandBar showChain />
			</View>

			<Animated.View
				entering={FadeIn.duration(220)}
				style={styles.connectHomeCenter}
			>
				<View style={styles.pulseMark}>
					<View style={styles.pulseRing} />
					<View style={styles.pulseRingTwo} />
					<View style={styles.pulseCore}>
						<Text style={styles.pulseCoreText}>P</Text>
					</View>
				</View>
				<Text style={styles.welcomeTitle}>
					Welcome <Text style={styles.heroTitleItalic}>back</Text>
				</Text>
				<Text style={styles.welcomeDesc}>
					Sign back in to pick up your tokenized portfolio. The market never
					closed.
				</Text>
				<View style={styles.pulseChips}>
					{pulse.map((token) => (
						<View key={token.ticker} style={styles.pulseChip}>
							<Text style={styles.pulseChipTicker}>{token.ticker}</Text>
							<Text
								style={[
									styles.pulseChipChange,
									{
										color:
											(token.change24h ?? 0) >= 0
												? colors.positive
												: colors.merah,
									},
								]}
							>
								{fmtPct(token.change24h)}
							</Text>
						</View>
					))}
				</View>
			</Animated.View>

			<View
				style={[
					styles.introDock,
					{ paddingBottom: Math.max(18, insets.bottom + 12) },
				]}
			>
				{known && (
					<View style={styles.lastWalletRow}>
						<View
							style={[styles.lastWalletIcon, { backgroundColor: known.tint }]}
						>
							<Text style={styles.lastWalletGlyph}>{known.glyph}</Text>
						</View>
						<Text style={styles.lastWalletText}>
							Last used <Text style={styles.lastWalletName}>{known.name}</Text>
						</Text>
					</View>
				)}
				<TouchableOpacity
					onPressIn={quickConnect}
					activeOpacity={0.86}
					disabled={!!connectingWalletId}
					style={[
						styles.connectButton,
						{ opacity: connectingWalletId ? 0.55 : 1 },
					]}
				>
					{isConnectingKnown ? (
						<ActivityIndicator color="#fff" size="small" />
					) : (
						<Icon name="wallet" size={18} color="#fff" />
					)}
					<Text style={styles.connectButtonText}>
						{isConnectingKnown
							? "Connecting..."
							: known
								? `Continue with ${known.name}`
								: "Connect wallet"}
					</Text>
				</TouchableOpacity>
				{known && (
					<TouchableOpacity
						onPressIn={() => setSheetVisible(true)}
						activeOpacity={0.74}
						style={styles.ghostButton}
					>
						<Text style={styles.ghostButtonText}>Use another wallet</Text>
					</TouchableOpacity>
				)}
				<Pressable onPress={onShowIntro} style={styles.introLink} hitSlop={8}>
					<Text style={styles.introLinkText}>
						New to PulsarFi?{" "}
						<Text style={styles.introLinkAccent}>View intro</Text>
					</Text>
				</Pressable>
			</View>

			<WalletSheet
				visible={sheetVisible}
				onClose={() => setSheetVisible(false)}
				wallets={wallets}
				connectingWalletId={connectingWalletId}
				onConnectWallet={onConnectWallet}
			/>
		</View>
	);
}

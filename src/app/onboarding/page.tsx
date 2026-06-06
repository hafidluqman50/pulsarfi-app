import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppKit } from "@reown/appkit-react-native";
import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { reownProjectId } from "@/lib/appKit";
import { ConnectHomeUI, OnboardingUI, type WalletOption } from "./ui";

export type WalletData = { address: string; name: string };

const WALLETS: WalletOption[] = [
	{ id: "metamask", name: "MetaMask", tint: "#e2761b", glyph: "M" },
	{ id: "rabby", name: "Rabby", tint: "#7084ff", glyph: "R" },
	{ id: "wc", name: "WalletConnect", tint: "#3b99fc", glyph: "W" },
	{ id: "coinbase", name: "Coinbase Wallet", tint: "#0052ff", glyph: "C" },
];

export default function OnboardingPage({
	mode = "intro",
	onSkip,
	lastWalletName,
	onShowIntro,
}: {
	mode?: "intro" | "connect";
	onSkip?: () => void;
	lastWalletName?: string | null;
	onShowIntro?: () => void;
}) {
	const { open } = useAppKit();
	const [connectingWalletId, setConnectingWalletId] = useState<string | null>(
		null,
	);
	const wallets = useMemo(() => WALLETS, []);

	const handleConnectWallet = async (
		wallet: WalletOption,
		done?: () => void,
	) => {
		if (connectingWalletId) return;
		setConnectingWalletId(wallet.id);
		try {
			if (!reownProjectId) {
				Alert.alert(
					"Wallet config missing",
					"Set EXPO_PUBLIC_REOWN_PROJECT_ID in .env, then restart Expo.",
				);
				return;
			}
			await AsyncStorage.setItem("pf_pending_wallet_name", wallet.name);
			await open();
			done?.();
		} finally {
			setConnectingWalletId(null);
		}
	};

	if (mode === "connect") {
		return (
			<ConnectHomeUI
				wallets={wallets}
				connectingWalletId={connectingWalletId}
				lastWalletName={lastWalletName}
				onConnectWallet={handleConnectWallet}
				onShowIntro={onShowIntro}
			/>
		);
	}

	return (
		<OnboardingUI
			wallets={wallets}
			connectingWalletId={connectingWalletId}
			onConnectWallet={handleConnectWallet}
			onSkip={onSkip}
		/>
	);
}

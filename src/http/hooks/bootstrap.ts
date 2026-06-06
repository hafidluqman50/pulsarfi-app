import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

type BootstrapState = {
	bootstrapped: boolean;
	onboarded: boolean;
	lastWallet: string | null;
	markOnboarded: () => void;
	setLastWallet: (name: string) => void;
};

export function useBootstrap(): BootstrapState {
	const [bootstrapped, setBootstrapped] = useState(false);
	const [onboarded, setOnboarded] = useState(false);
	const [lastWallet, setLastWalletState] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;
		Promise.all([
			AsyncStorage.getItem("pf_onboarded"),
			AsyncStorage.getItem("pf_last_wallet"),
		])
			.then(([savedOnboarded, savedWallet]) => {
				if (!alive) return;
				setOnboarded(savedOnboarded === "1");
				setLastWalletState(savedWallet);
				setBootstrapped(true);
			})
			.catch(() => {
				if (alive) setBootstrapped(true);
			});
		return () => {
			alive = false;
		};
	}, []);

	const markOnboarded = () => {
		setOnboarded(true);
		AsyncStorage.setItem("pf_onboarded", "1").catch(() => {});
	};

	const setLastWallet = (name: string) => {
		setLastWalletState(name);
	};

	return { bootstrapped, onboarded, lastWallet, markOnboarded, setLastWallet };
}

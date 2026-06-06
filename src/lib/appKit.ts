import "@walletconnect/react-native-compat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	AppKit,
	AppKitProvider,
	createAppKit,
	type Storage,
} from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { arbitrumSepolia } from "wagmi/chains";

const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID ?? "";

export const reownProjectId = projectId;

export const appKitStorage: Storage = {
	async getKeys() {
		return [...(await AsyncStorage.getAllKeys())];
	},
	async getEntries<T = unknown>() {
		const keys = await AsyncStorage.getAllKeys();
		const pairs = await AsyncStorage.multiGet(keys);
		return pairs
			.filter((entry): entry is [string, string] => entry[1] != null)
			.map(([key, value]) => {
				try {
					return [key, JSON.parse(value) as T] as [string, T];
				} catch {
					return [key, value as T] as [string, T];
				}
			});
	},
	async getItem<T = unknown>(key: string) {
		const value = await AsyncStorage.getItem(key);
		if (value == null) return undefined;
		try {
			return JSON.parse(value) as T;
		} catch {
			return value as T;
		}
	},
	async setItem<T = unknown>(key: string, value: T) {
		await AsyncStorage.setItem(
			key,
			typeof value === "string" ? value : JSON.stringify(value),
		);
	},
	async removeItem(key: string) {
		await AsyncStorage.removeItem(key);
	},
};

import { http } from "wagmi";

const alchemyRpcUrl = process.env.EXPO_PUBLIC_ALCHEMY_RPC_URL ?? "";

export const wagmiAdapter = new WagmiAdapter({
	projectId,
	networks: [arbitrumSepolia],
	transports: {
		[arbitrumSepolia.id]: http(alchemyRpcUrl || undefined),
	},
});

export const appKit = createAppKit({
	projectId,
	adapters: [wagmiAdapter],
	networks: [arbitrumSepolia],
	defaultNetwork: arbitrumSepolia,
	storage: appKitStorage,
	metadata: {
		name: "PulsarFi",
		description: "Tokenized IDX equities on Arbitrum",
		url: "https://pulsarfi.io",
		icons: ["https://pulsarfi.io/icon.png"],
		redirect: {
			native: "pulsarfi://",
		},
	},
	features: {
		swaps: false,
		onramp: false,
	},
	themeMode: "dark",
});

export { AppKit, AppKitProvider };

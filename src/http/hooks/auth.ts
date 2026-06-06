import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseJwtRole } from "@/lib/jwt";
import http, { type ApiResponse } from "../index";

// ─── Types ────────────────────────────────────────────────────

export interface NonceResponse {
	nonce: string;
}

export interface VerifyPayload {
	address: string;
	message: string;
	signature: string;
	nonce: string;
}

export interface AuthResponse {
	access_token: string;
}

export type WalletRequestProvider = {
	request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export interface SiweVerifyVariables {
	address: string;
	provider: WalletRequestProvider;
}

export interface SiweSession {
	address: string;
	name: string;
	role: "user" | "custodian";
	accessToken: string;
}

// ─── Query Keys ───────────────────────────────────────────────

export const authKeys = {
	nonce: (address: string) => ["auth", "nonce", address] as const,
};

// ─── SIWE Message Builder ─────────────────────────────────────

/**
 * Builds an EIP-4361 Sign-In with Ethereum message.
 *
 * Format:
 * ```
 * pulsarfi.io wants you to sign in with your Ethereum account:
 * {address}
 *
 * Sign in to PulsarFi
 *
 * URI: https://pulsarfi.io
 * Version: 1
 * Chain ID: 421614
 * Nonce: {nonce}
 * Issued At: {issuedAt}
 * ```
 */
export function buildSiweMessage(address: string, nonce: string): string {
	const issuedAt = new Date().toISOString();

	return [
		`pulsarfi.io wants you to sign in with your Ethereum account:`,
		address,
		``,
		`Sign in to PulsarFi`,
		``,
		`URI: https://pulsarfi.io`,
		`Version: 1`,
		`Chain ID: 421614`,
		`Nonce: ${nonce}`,
		`Issued At: ${issuedAt}`,
	].join("\n");
}

// ─── API Functions ────────────────────────────────────────────

/** GET /api/v1/auth/nonce?address=0x... */
export async function getNonce(address: string): Promise<NonceResponse> {
	const { data } = await http.get<ApiResponse<NonceResponse>>(
		"/api/v1/auth/nonce",
		{ params: { address } },
	);
	return data.data;
}

/** POST /api/v1/auth/verify */
export async function postVerify(
	payload: VerifyPayload,
): Promise<AuthResponse> {
	const { data } = await http.post<ApiResponse<AuthResponse>>(
		"/api/v1/auth/verify",
		payload,
	);
	return data.data;
}

// ─── React Query Hooks ────────────────────────────────────────

/**
 * Fetches a nonce for the given wallet address.
 * Only enabled when `address` is non-null.
 * The nonce is used to construct the SIWE message before signing.
 */
export function useNonce(address: string | null) {
	return useQuery({
		queryKey: authKeys.nonce(address ?? ""),
		queryFn: () => getNonce(address ?? ""),
		enabled: !!address,
		// Nonces are one-time-use — don't cache aggressively
		staleTime: 0,
		gcTime: 60_000,
		retry: 1,
	});
}

/**
 * Mutation: POST /api/v1/auth/verify
 * On success → stores the JWT in AsyncStorage under 'access_token'.
 *
 * Usage:
 * ```ts
 * const verify = useVerify();
 * verify.mutate({ address, message, signature, nonce });
 * ```
 *
 * The caller is responsible for:
 * 1. Fetching nonce via `useNonce`
 * 2. Building the message via `buildSiweMessage`
 * 3. Requesting wallet signature via WalletConnect (handled in WalletConnect context)
 * 4. Calling this mutation with the signed payload
 */
export function useVerify() {
	return useMutation({
		mutationFn: postVerify,
		onSuccess: async (authResponse) => {
			try {
				await AsyncStorage.setItem("access_token", authResponse.access_token);
			} catch (e) {
				console.error("[auth] Failed to persist access_token:", e);
			}
		},
		onError: (error) => {
			console.error("[auth] Verify failed:", error);
		},
	});
}

export function useSiweVerifySession() {
	return useMutation({
		mutationFn: async ({
			address,
			provider,
		}: SiweVerifyVariables): Promise<SiweSession> => {
			const normalizedAddress = address.toLowerCase();
			const [savedToken, savedAddress, pendingWalletName] = await Promise.all([
				AsyncStorage.getItem("access_token"),
				AsyncStorage.getItem("pf_session_address"),
				AsyncStorage.getItem("pf_pending_wallet_name"),
			]);

			let accessToken =
				savedAddress?.toLowerCase() === normalizedAddress ? savedToken : null;

			if (!accessToken) {
				const { nonce } = await getNonce(address);
				const message = buildSiweMessage(address, nonce);

				try {
					await provider.request({
						method: "wallet_switchEthereumChain",
						params: [{ chainId: "0x66eee" }],
					});
				} catch {
					// Some wallets do not expose chain switching through WalletConnect.
				}

				const signature = (await provider.request({
					method: "personal_sign",
					params: [message, address],
				})) as string;
				const auth = await postVerify({ address, message, signature, nonce });
				accessToken = auth.access_token;

				await AsyncStorage.multiSet([
					["access_token", accessToken],
					["pf_session_address", address],
				]);
			}

			await AsyncStorage.removeItem("pf_pending_wallet_name");

			return {
				address,
				accessToken,
				name: pendingWalletName ?? "Wallet",
				role: parseJwtRole(accessToken),
			};
		},
		onError: (error) => {
			console.error("[auth] SIWE verify failed:", error);
		},
	});
}

import { useQuery, useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import http, { ApiResponse } from '../index';

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

// ─── Query Keys ───────────────────────────────────────────────

export const authKeys = {
  nonce: (address: string) => ['auth', 'nonce', address] as const,
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
 * Sign in to PulsarFi — tokenized IDX equities on Arbitrum.
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
    `Sign in to PulsarFi — tokenized IDX equities on Arbitrum.`,
    ``,
    `URI: https://pulsarfi.io`,
    `Version: 1`,
    `Chain ID: 421614`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n');
}

// ─── API Functions ────────────────────────────────────────────

/** GET /api/v1/auth/nonce?address=0x... */
async function getNonce(address: string): Promise<NonceResponse> {
  const { data } = await http.get<ApiResponse<NonceResponse>>(
    '/api/v1/auth/nonce',
    { params: { address } },
  );
  return data.data;
}

/** POST /api/v1/auth/verify */
async function postVerify(payload: VerifyPayload): Promise<AuthResponse> {
  const { data } = await http.post<ApiResponse<AuthResponse>>(
    '/api/v1/auth/verify',
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
    queryKey: authKeys.nonce(address ?? ''),
    queryFn: () => getNonce(address!),
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
        await AsyncStorage.setItem('access_token', authResponse.access_token);
      } catch (e) {
        console.error('[auth] Failed to persist access_token:', e);
      }
    },
    onError: (error) => {
      console.error('[auth] Verify failed:', error);
    },
  });
}

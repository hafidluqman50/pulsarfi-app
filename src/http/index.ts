import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Shared Response Envelope ─────────────────────────────────
/**
 * Every PulsarFi backend response is wrapped in this envelope.
 * Use it to type the `data` field returned by axios: `ApiResponse<MyData>`.
 */
export type ApiResponse<T> = {
  status_code: number;
  message: string;
  data: T;
};

// ─── Base URL ─────────────────────────────────────────────────
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

// ─── Axios Instance ───────────────────────────────────────────
const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────
// Read JWT from AsyncStorage and attach as Bearer token on every request.
// The interceptor is async — axios supports async request interceptors.
http.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // AsyncStorage read failure is non-fatal — request proceeds without auth header
      console.warn('[HTTP] Failed to read access_token from AsyncStorage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────
// On 401 → clear stored token so the UI can redirect to onboarding.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      try {
        await AsyncStorage.removeItem('access_token');
      } catch (e) {
        console.warn('[HTTP] Failed to clear access_token on 401:', e);
      }
      console.warn('[HTTP] 401 Unauthorized — session cleared');
    }

    if (status === 403) {
      console.warn('[HTTP] 403 Forbidden');
    }

    if (status >= 500) {
      console.error('[HTTP] Server error:', error.response?.data);
    }

    return Promise.reject(error);
  },
);

export default http;

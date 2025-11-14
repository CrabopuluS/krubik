import { getCookie, setCookie } from '../utils/cookies';

export type SolveResponse = {
  moves: string[];
  source: 'external' | 'local';
};

export type ApiError = {
  code?: string;
  message: string;
};

const globalRuntime = globalThis as typeof globalThis & {
  krubikConfig?: {
    apiUrl?: string;
    csrfCookie?: string;
    csrfHeader?: string;
  };
  process?: { env?: Record<string, string | undefined> };
};

const API_URL =
  globalRuntime.krubikConfig?.apiUrl ??
  globalRuntime.process?.env?.VITE_API_URL ??
  'http://localhost:8000/solve';
const CSRF_COOKIE =
  globalRuntime.krubikConfig?.csrfCookie ??
  globalRuntime.process?.env?.VITE_CSRF_COOKIE ??
  'csrf_token';
const CSRF_HEADER =
  globalRuntime.krubikConfig?.csrfHeader ??
  globalRuntime.process?.env?.VITE_CSRF_HEADER ??
  'X-CSRF-Token';

const ensureCsrfToken = (): string => {
  const existing = getCookie(CSRF_COOKIE);
  if (existing) {
    return existing;
  }
  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  setCookie(CSRF_COOKIE, token);
  return token;
};

export const solveCube = async (state: string, language: string): Promise<SolveResponse> => {
  const csrfToken = ensureCsrfToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [CSRF_HEADER]: csrfToken,
      'Accept-Language': language,
    },
    credentials: 'include',
    body: JSON.stringify({ state }),
  });

  if (!response.ok) {
    let detail: ApiError | undefined;
    try {
      const payload = (await response.json()) as { detail?: ApiError };
      detail = payload.detail;
    } catch (error) {
      detail = undefined;
    }
    const message = detail?.message ?? response.statusText ?? 'Unknown error';
    throw Object.assign(new Error(message), { code: detail?.code });
  }

  const payload = (await response.json()) as SolveResponse;
  if (!Array.isArray(payload.moves)) {
    throw new Error('Malformed response from server');
  }
  return payload;
};

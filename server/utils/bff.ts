/**
 * BFF (Backend-for-Frontend) helpers — the server-only auth layer for the admin
 * dashboard. These run in Nitro (server/api/**) and are the ONLY place the raw
 * access/refresh tokens are ever handled.
 *
 * Security model:
 * - Tokens live ONLY in httpOnly cookies (`at` access, `rt` refresh) set here. The
 *   browser JS never sees them — no localStorage, no readable cookie.
 * - sameSite=lax + a same-origin proxy makes cross-site request forgery a non-issue
 *   for the dashboard's state-changing calls.
 * - `secure` is enabled outside dev so cookies are HTTPS-only in production.
 * - Tokens are never logged.
 */
import type { H3Event } from 'h3';

/** Cookie names. Deliberately terse + non-descriptive (not `auth_token`). */
const AT_COOKIE = 'at';
const RT_COOKIE = 'rt';

/** Cookie lifetimes — mirror the backend JWT config (access 15m, refresh 7d). */
const AT_MAX_AGE = 60 * 15; // 15 minutes
const RT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Raw token pair as returned by the backend `/auth/login` + `/auth/refresh`. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** The minimal authenticated-user shape the dashboard consumes. */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

/** Backend wire-error shape (mirrors the NestJS HttpExceptionFilter). */
export interface WireApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errors?: string[];
}

/**
 * Base URL the BFF uses to reach the backend. Prefers the server-only
 * `apiInternalBase` (e.g. a private network host), falling back to the public
 * `apiBase`. Both already include the `/api/v1` version prefix.
 */
export function internalApiBase(): string {
  const config = useRuntimeConfig();
  return (config.apiInternalBase as string) || (config.public.apiBase as string);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/** Persist a fresh token pair into the httpOnly cookies. */
export function setAuthCookies(event: H3Event, tokens: AuthTokens): void {
  setCookie(event, AT_COOKIE, tokens.accessToken, cookieOptions(AT_MAX_AGE));
  setCookie(event, RT_COOKIE, tokens.refreshToken, cookieOptions(RT_MAX_AGE));
}

/** Remove both auth cookies (logout / failed refresh). */
export function clearAuthCookies(event: H3Event): void {
  deleteCookie(event, AT_COOKIE, { path: '/' });
  deleteCookie(event, RT_COOKIE, { path: '/' });
}

export function getAccessToken(event: H3Event): string | undefined {
  return getCookie(event, AT_COOKIE);
}

export function getRefreshToken(event: H3Event): string | undefined {
  return getCookie(event, RT_COOKIE);
}

/**
 * Exchange the `rt` cookie for a fresh token pair via the backend. Returns the
 * rotated pair on success, or `null` when there is no refresh token or the
 * backend rejects it (expired / reused / revoked). Never throws.
 *
 * The caller is responsible for `setAuthCookies` on success and
 * `clearAuthCookies` on `null`.
 */
export async function refreshTokens(event: H3Event): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken(event);
  if (!refreshToken) return null;

  try {
    const res = await $fetch<{ success: true; data: AuthTokens }>(
      `${internalApiBase()}/auth/refresh`,
      { method: 'POST', body: { refreshToken } },
    );
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Set the response status and return a normalized wire-error body. Use for errors
 * the BFF originates itself (validation, missing session, backend unreachable) so
 * the client always sees the same `{ success: false, ... }` shape the backend emits.
 */
export function wireError(
  event: H3Event,
  status: number,
  message: string,
  errors?: string[],
): WireApiError {
  setResponseStatus(event, status);
  return {
    success: false,
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: event.path,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
  };
}

/**
 * Forward a caught `$fetch` error from the backend to the client, preserving the
 * upstream status and (when present) the backend's wire-error body. Network-level
 * failures (backend down) collapse to a 502.
 */
export function forwardFetchError(event: H3Event, error: unknown): WireApiError {
  const err = error as { status?: number; statusCode?: number; data?: unknown };
  const status = err.status ?? err.statusCode;
  const data = err.data;

  if (
    status &&
    data &&
    typeof data === 'object' &&
    'success' in data &&
    (data as { success: unknown }).success === false
  ) {
    setResponseStatus(event, status);
    return data as WireApiError;
  }

  return wireError(event, status ?? 502, 'Upstream service unavailable');
}

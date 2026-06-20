/**
 * GET /api/auth/me — hydrate the current session.
 *
 * Proxies the backend `/auth/me` with the `at` cookie. If the access token is
 * missing or expired, it transparently refreshes ONCE using the `rt` cookie
 * (rotating the cookies) and retries — so a session survives the full 7-day
 * refresh window across reloads, not just the 15-minute access window. If there is
 * no valid refresh token, the cookies are cleared and a 401 is returned.
 *
 * Returns `{ user }` only; tokens never reach the browser.
 */
import type { AuthUser } from '../../utils/bff';
import {
  clearAuthCookies,
  getAccessToken,
  internalApiBase,
  refreshTokens,
  setAuthCookies,
  wireError,
} from '../../utils/bff';

interface MeResponse {
  success: true;
  data: AuthUser;
}

function fetchMe(accessToken: string) {
  return $fetch<MeResponse>(`${internalApiBase()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export default defineEventHandler(async (event) => {
  const accessToken = getAccessToken(event);

  if (accessToken) {
    try {
      const res = await fetchMe(accessToken);
      return { success: true as const, data: { user: res.data } };
    } catch {
      // Access token rejected — fall through to a refresh attempt.
    }
  }

  const refreshed = await refreshTokens(event);
  if (!refreshed) {
    clearAuthCookies(event);
    return wireError(event, 401, 'Not authenticated');
  }
  setAuthCookies(event, refreshed);

  try {
    const res = await fetchMe(refreshed.accessToken);
    return { success: true as const, data: { user: res.data } };
  } catch {
    clearAuthCookies(event);
    return wireError(event, 401, 'Not authenticated');
  }
});

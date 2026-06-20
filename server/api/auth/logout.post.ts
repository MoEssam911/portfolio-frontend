/**
 * POST /api/auth/logout — BFF logout.
 *
 * Best-effort revokes the refresh token on the backend, then always clears both
 * auth cookies. Logout is idempotent: cookies are cleared even if the backend call
 * fails (e.g. the access token already expired).
 */
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  internalApiBase,
} from '../../utils/bff';

export default defineEventHandler(async (event) => {
  const accessToken = getAccessToken(event);
  const refreshToken = getRefreshToken(event);

  if (accessToken && refreshToken) {
    try {
      await $fetch(`${internalApiBase()}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { refreshToken },
      });
    } catch {
      // Idempotent — clear local session regardless of the backend's response.
    }
  }

  clearAuthCookies(event);
  return { success: true as const, data: { success: true } };
});

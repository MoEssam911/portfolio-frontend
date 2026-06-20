/**
 * /api/admin/** — the central dashboard BFF proxy.
 *
 * Forwards ANY method/path to `${internalApiBase()}/dashboard/<path>`, injecting
 * the access token from the `at` cookie as a Bearer header. This is the ONLY route
 * the dashboard's read/write clients use to reach the backend — composables never
 * see a token or the backend origin.
 *
 * Transparent refresh: on a 401 it refreshes ONCE with the `rt` cookie, sets the
 * rotated cookies, and retries the original request. If refresh fails (no/expired/
 * reused refresh token), it clears the cookies and returns 401.
 *
 * Uploads: the raw request body is forwarded byte-for-byte with its original
 * Content-Type, so multipart/form-data passes straight through unparsed. The body
 * is buffered (not piped) so it can be replayed on the post-refresh retry.
 */
import type { H3Event } from 'h3';

import {
  clearAuthCookies,
  getAccessToken,
  internalApiBase,
  refreshTokens,
  setAuthCookies,
  wireError,
} from '../../utils/bff';

export default defineEventHandler(async (event) => {
  // Private, per-session data — guarantee no-store on every branch (success,
  // refresh-failure 401, and upstream 502) before anything else runs.
  setResponseHeader(event, 'cache-control', 'no-store');

  const path = getRouterParam(event, '_') ?? '';
  const method = event.method;
  const query = getQuery(event);
  const contentType = getRequestHeader(event, 'content-type');

  // Buffer the body once so it can be replayed if we have to retry after a refresh.
  let body: Buffer | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = (await readRawBody(event, false)) as Buffer | undefined;
  }

  const target = `${internalApiBase()}/dashboard/${path}`;

  const send = (token: string | undefined) =>
    $fetch.raw(target, {
      method,
      query,
      ...(body !== undefined ? { body } : {}),
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(contentType ? { 'content-type': contentType } : {}),
      },
      // Inspect the status ourselves rather than throwing on 4xx/5xx.
      ignoreResponseError: true,
    });

  try {
    let res = await send(getAccessToken(event));

    if (res.status === 401) {
      const refreshed = await refreshTokens(event);
      if (!refreshed) {
        clearAuthCookies(event);
        return wireError(event, 401, 'Session expired');
      }
      setAuthCookies(event, refreshed);

      res = await send(refreshed.accessToken);
      if (res.status === 401) {
        clearAuthCookies(event);
        return wireError(event, 401, 'Session expired');
      }
    }

    return forwardResponse(event, res);
  } catch {
    // Network-level failure reaching the backend.
    return wireError(event, 502, 'Upstream service unavailable');
  }
});

/** Mirror the upstream status, content-type, and body back to the caller. */
function forwardResponse(
  event: H3Event,
  res: { status: number; headers: Headers; _data?: unknown },
) {
  setResponseStatus(event, res.status);
  const upstreamContentType = res.headers.get('content-type');
  if (upstreamContentType) {
    setResponseHeader(event, 'content-type', upstreamContentType);
  }
  // Dashboard payloads are per-session and private — never let a browser, proxy,
  // or CDN cache them. Set explicitly here (not just via routeRules) so the
  // security-critical path can't be cached even if route rules change.
  setResponseHeader(event, 'cache-control', 'no-store');
  return res._data ?? null;
}

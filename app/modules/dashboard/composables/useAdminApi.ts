import { normalizeError } from '~/core/api/errors';
import type {
  ApiEnvelope,
  UnwrapEnvelope,
  UseApiFetchOptions,
} from '~/shared/composables/useApiFetch';
import { useApiFetch } from '~/shared/composables/useApiFetch';
import type { AdminMediaList, ApiSuccess } from '~/shared/types/api';

/**
 * Dashboard data access — the two-primitive model, pointed at the BFF.
 *
 *   READS  → `useAdminApiFetch` (thin delegate to the shared `useApiFetch`)
 *   WRITES → `$admin` (a small `$fetch` wrapper) + `useAdminMutation`
 *
 * Both route through the same-origin `/api/admin/**` proxy, which injects the auth
 * cookie. Nothing here ever touches a token or the backend origin directly.
 */
export const ADMIN_BASE = '/api/admin';

/**
 * READS. Identical to {@link useApiFetch} (same envelope unwrap + SWR), but with
 * `baseURL` pinned to the BFF. Use the same generic pattern as public reads:
 *
 *   const { data } = useAdminApiFetch<ApiSuccess<Project[]>>('/projects', {
 *     key: 'admin-projects', default: () => [],
 *   })
 */
export function useAdminApiFetch<ResT extends ApiEnvelope, DataT = UnwrapEnvelope<ResT>>(
  path: string | (() => string),
  options: UseApiFetchOptions<ResT, DataT> = {},
) {
  // A 401 here means the BFF already failed to refresh — the session is dead.
  // Bounce to login (once) with a return-to, then let the caller's error state show.
  const { handleUnauthorized } = useSessionGuard();
  const onResponseError = options.onResponseError;

  return useApiFetch<ResT, DataT>(path, {
    baseURL: ADMIN_BASE,
    ...options,
    onResponseError(ctx) {
      if (ctx.response?.status === 401) void handleUnauthorized();
      if (typeof onResponseError === 'function') return onResponseError(ctx);
    },
  });
}

/**
 * READS — media list. The one endpoint whose payload is `{ items, total }` rather
 * than the paginated `T[]` envelope; this variant types it without callers having
 * to special-case the shape (see {@link AdminMediaList}).
 */
export function useAdminMediaList(
  options: UseApiFetchOptions<ApiSuccess<AdminMediaList>, AdminMediaList> = {},
) {
  return useAdminApiFetch<ApiSuccess<AdminMediaList>>('/media', {
    key: 'admin-media-list',
    default: () => ({ items: [], total: 0 }),
    ...options,
  });
}

/**
 * WRITES. A thin authenticated `$fetch` wrapper for POST/PATCH/DELETE: it unwraps
 * the `{ success, data }` envelope and rethrows any failure as a normalized
 * `ApiError` (so `useAdminMutation` / callers get a consistent shape). Multipart
 * uploads work transparently — pass a `FormData` body and it streams through the BFF.
 */
type AdminFetchOptions = Parameters<typeof $fetch>[1];

export async function $admin<T>(path: string, options: AdminFetchOptions = {}): Promise<T> {
  try {
    const res = await $fetch<ApiSuccess<T>>(path, { baseURL: ADMIN_BASE, ...options });
    return res.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

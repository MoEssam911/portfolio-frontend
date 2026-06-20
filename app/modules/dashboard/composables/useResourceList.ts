import { useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import type { ResourceListResult } from '~/modules/dashboard/types';
import type { ApiPaginated, PaginationMeta } from '~/shared/types/api';

export interface UseResourceListOptions {
  /** Initial page (1-based). Default 1. */
  page?: number;
  /** Page size. Default 20. */
  limit?: number;
  /** Extra query params merged into every request (reactive-friendly). */
  query?: Record<string, unknown>;
  /** Override the useAsyncData key. Defaults to `admin-<resource>-list`. */
  key?: string;
}

/**
 * useResourceList — the standard paginated LIST read for a dashboard resource.
 *
 * A thin layer over the Phase-2 read primitive (`useAdminApiFetch`, itself the
 * shared `useApiFetch` pointed at the BFF). It does NOT introduce a new fetch
 * pattern — it just standardizes paginated list state (items + meta + reactive
 * page/limit) so every resource index page looks the same.
 *
 * Reads are client-only (`server: false`) because dashboard data is private and
 * must never land in the SSR payload. SWR caching is disabled (a constant key
 * with reactive `page`/`limit` must always refetch on change).
 *
 * NOTE: the media list endpoint uses a nonstandard `{ items, total }` shape — use
 * `useAdminMediaList` for that, not this.
 *
 *   const { items, meta, page, pending, refresh } = useResourceList<Project>('projects')
 */
export function useResourceList<T>(
  resource: string,
  options: UseResourceListOptions = {},
): ResourceListResult<T> {
  const page = ref(options.page ?? 1);
  const limit = ref(options.limit ?? 20);

  const { data, pending, error, refresh } = useAdminApiFetch<
    ApiPaginated<T>,
    ApiPaginated<T> | null
  >(`/${resource}`, {
    key: options.key ?? `admin-${resource}-list`,
    query: { page, limit, ...options.query },
    transform: (res) => res,
    getCachedData: undefined,
    default: () => null,
    server: false,
  });

  const items = computed<T[]>(() => data.value?.data ?? []);
  const meta = computed<PaginationMeta | null>(() => data.value?.meta ?? null);

  return {
    items,
    meta,
    page,
    limit,
    pending,
    error,
    refresh: async () => {
      await refresh();
    },
  };
}

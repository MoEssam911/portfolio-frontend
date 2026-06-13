import type { Ref } from 'vue';

import type { Project } from '~/modules/projects/types';
import type { ApiPaginated, PaginationMeta } from '~/shared/types/api';

/**
 * Paginated public projects list for the index page. `page` is a ref so changing
 * it re-runs the fetch (useFetch watches reactive query params). Keeps the raw
 * envelope to expose `meta` for the pagination control.
 *
 * Opts out of SWR caching (`getCachedData: undefined`): the key is constant while
 * `query.page` is reactive, so cached data must never short-circuit a page change.
 */
export function useProjectsList(page: Ref<number>, limit = 9) {
  const {
    data: raw,
    pending,
    error,
  } = useApiFetch<ApiPaginated<Project>, ApiPaginated<Project> | null>('/projects', {
    key: 'projects-page',
    query: { page, limit },
    transform: (res) => res,
    getCachedData: undefined,
    default: () => null,
  });

  const projects = computed<Project[]>(() => raw.value?.data ?? []);
  const meta = computed<PaginationMeta | null>(() => raw.value?.meta ?? null);

  return { projects, meta, pending, error };
}

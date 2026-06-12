import type { Ref } from 'vue';

import type { Project } from '~/modules/projects/types';
import type { ApiPaginated, PaginationMeta } from '~/shared/types/api';

/**
 * Paginated public projects list for the index page. `page` is a ref so changing
 * it re-runs the fetch (useFetch watches reactive query params). Keeps the raw
 * envelope to expose `meta` for the pagination control.
 */
export function useProjectsList(page: Ref<number>, limit = 9) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const { data: _raw, pending, error } = useFetch<ApiPaginated<Project>>(
    `${apiBase}/projects`,
    {
      key: 'projects-page',
      query: { page, limit },
    },
  );

  const projects = computed<Project[]>(() => _raw.value?.data ?? []);
  const meta = computed<PaginationMeta | null>(() => _raw.value?.meta ?? null);

  return { projects, meta, pending, error };
}

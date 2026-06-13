import type { MaybeRefOrGetter } from 'vue';

import type { Project } from '~/modules/projects/types';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * Single published project by slug (case-study page). The URL and key are getters
 * so client-side slug changes re-fetch. Returns `null` until resolved; a missing /
 * unpublished slug surfaces as `error` (backend 404).
 */
export function useProject(slug: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const {
    data: _raw,
    pending,
    error,
  } = useFetch<ApiSuccess<Project>>(() => `${apiBase}/projects/${toValue(slug)}`, {
    key: () => `project-${toValue(slug)}`,
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  });

  const project = computed<Project | null>(() => _raw.value?.data ?? null);

  return { project, pending, error };
}

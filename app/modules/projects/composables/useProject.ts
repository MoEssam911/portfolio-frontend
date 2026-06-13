import type { MaybeRefOrGetter } from 'vue';

import type { Project } from '~/modules/projects/types';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * Single published project by slug (case-study page). The URL and key are getters
 * so client-side slug changes re-fetch. Returns `null` until resolved; a missing /
 * unpublished slug surfaces as `error` (backend 404).
 */
export function useProject(slug: MaybeRefOrGetter<string>) {
  const {
    data: project,
    pending,
    error,
  } = useApiFetch<ApiSuccess<Project>, Project | null>(() => `/projects/${toValue(slug)}`, {
    key: () => `project-${toValue(slug)}`,
    default: () => null,
  });

  return { project, pending, error };
}

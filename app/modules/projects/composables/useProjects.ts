import type { Project } from '~/modules/projects/types';
import type { ApiPaginated } from '~/shared/types/api';

export function useProjects(limit = 10) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const { data, pending, error } = useFetch<ApiPaginated<Project>>(`${apiBase}/projects`, {
    key: 'projects-list',
    query: { page: 1, limit },
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  });

  const featuredProjects = computed<Project[]>(
    () => data.value?.data.filter((p) => p.featured) ?? [],
  );

  return { data, pending, error, featuredProjects };
}

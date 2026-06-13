import type { Project } from '~/modules/projects/types';
import type { ApiPaginated } from '~/shared/types/api';

export function useProjects(limit = 10) {
  const { data, pending, error } = useApiFetch<ApiPaginated<Project>, ApiPaginated<Project> | null>(
    '/projects',
    {
      key: 'projects-list',
      query: { page: 1, limit },
      transform: (res) => res,
      default: () => null,
    },
  );

  const featuredProjects = computed<Project[]>(
    () => data.value?.data.filter((p) => p.featured) ?? [],
  );

  return { data, pending, error, featuredProjects };
}

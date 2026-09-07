import projectsData from '~/assets/data/projects.json';
import type { Project } from '~/modules/projects/types';
import type { PaginationMeta } from '~/shared/types/api';

const ALL = projectsData as Project[];

export function useProjects(limit = 10) {
  const data = computed(() => ({
    success: true as const,
    data: ALL.slice(0, limit),
    meta: {
      total: ALL.length,
      page: 1,
      limit,
      totalPages: Math.ceil(ALL.length / limit) || 1,
      hasNextPage: ALL.length > limit,
      hasPrevPage: false,
    } satisfies PaginationMeta,
  }));

  const featuredProjects = computed(() => ALL.filter((p) => p.featured));

  return { data, pending: ref(false), error: ref(null), featuredProjects };
}

import type { Ref } from 'vue';

import projectsData from '~/assets/data/projects.json';
import type { Project } from '~/modules/projects/types';
import type { PaginationMeta } from '~/shared/types/api';

const ALL = projectsData as Project[];

export function useProjectsList(page: Ref<number>, limit = 9) {
  const projects = computed(() => {
    const start = (page.value - 1) * limit;
    return ALL.slice(start, start + limit);
  });

  const meta = computed<PaginationMeta>(() => {
    const total = ALL.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      total,
      page: page.value,
      limit,
      totalPages,
      hasNextPage: page.value < totalPages,
      hasPrevPage: page.value > 1,
    };
  });

  return { projects, meta, pending: ref(false), error: ref(null) };
}

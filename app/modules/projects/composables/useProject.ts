import type { MaybeRefOrGetter } from 'vue';

import projectsData from '~/assets/data/projects.json';
import type { Project } from '~/modules/projects/types';

const ALL = projectsData as Project[];

export function useProject(slug: MaybeRefOrGetter<string>) {
  const project = computed(() => ALL.find((p) => p.slug === toValue(slug)) ?? null);
  const error = computed(() => (project.value === null ? new Error('Not found') : null));

  return { project, pending: ref(false), error };
}

import { useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import { useResourceList } from '~/modules/dashboard/composables/useResourceList';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';
import type { Project, ProjectInput } from '~/modules/projects/types';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * useAdminProjects — the dashboard Projects data layer.
 *
 * Reads and writes both go through the existing two-primitive model
 * (`useResourceList` over `useAdminApiFetch`, `useResourceMutations` over
 * `$admin`); this just binds the `Project`/`ProjectInput` generics and wires the
 * list `refresh` into the mutation `onChange` so the table re-reads after any
 * create/update/delete. List pages call this; the form pages call
 * `useAdminProject` (single read by slug) + the mutations returned here.
 *
 *   const { items, meta, page, pending, error, refresh,
 *           create, update, removeWithConfirm } = useAdminProjects()
 */
export function useAdminProjects(options: { limit?: number } = {}) {
  // A generous page size so the index's client-side search/filter has enough to
  // work with; server pagination still kicks in past it.
  const list = useResourceList<Project>('projects', { limit: options.limit ?? 50 });

  // TUpdate is widened to a partial so inline edits (e.g. a publish toggle from
  // the list) can PATCH a single field; the full form still sends a `ProjectInput`.
  const mutations = useResourceMutations<Project, ProjectInput, Partial<ProjectInput>>('projects', {
    label: 'Project',
    onChange: list.refresh,
  });

  return { ...list, ...mutations };
}

/**
 * useAdminProject — single project read by SLUG (the GET-able key). Returns the
 * full entity (with resolved `thumbnail`/`gallery`) for the edit form to seed
 * from; the form then PATCHes/DELETEs by the entity's `id`. Client-only — admin
 * data must never enter the SSR payload.
 */
export function useAdminProject(slug: string) {
  return useAdminApiFetch<ApiSuccess<Project>, Project | null>(`/projects/${slug}`, {
    key: `admin-project-${slug}`,
    default: () => null,
    getCachedData: undefined,
    server: false,
  });
}

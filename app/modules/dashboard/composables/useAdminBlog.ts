import type { BlogInput, BlogPost } from '~/modules/blog/types';
import { useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import { useResourceList } from '~/modules/dashboard/composables/useResourceList';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * useAdminBlog — the dashboard Blog data layer.
 *
 * Mirrors `useAdminProjects`: reads and writes both go through the two-primitive
 * model (`useResourceList` over `useAdminApiFetch`, `useResourceMutations` over
 * `$admin`), with the list `refresh` wired into the mutation `onChange` so the
 * table re-reads after any create/update/delete. The backend list includes
 * drafts and is newest-first. List pages call this; the form pages call
 * `useAdminBlogPost` (single read by slug) + the mutations returned here.
 *
 *   const { items, meta, pending, error, refresh,
 *           create, update, removeWithConfirm } = useAdminBlog()
 */
export function useAdminBlog(options: { limit?: number } = {}) {
  // A generous page size so the index's client-side search/filter has enough to
  // work with; server pagination still kicks in past it.
  const list = useResourceList<BlogPost>('blogs', { limit: options.limit ?? 50 });

  // TUpdate is widened to a partial so inline edits (e.g. a publish toggle from
  // the list) can PATCH a single field; the full form still sends a `BlogInput`.
  const mutations = useResourceMutations<BlogPost, BlogInput, Partial<BlogInput>>('blogs', {
    label: 'Post',
    onChange: list.refresh,
  });

  return { ...list, ...mutations };
}

/**
 * useAdminBlogPost — single post read by SLUG (the GET-able key). Returns the
 * full entity (with resolved `coverImage`/`tags`) for the edit form to seed
 * from; the form then PATCHes/DELETEs by the entity's `id`. Client-only — admin
 * data must never enter the SSR payload.
 */
export function useAdminBlogPost(slug: string) {
  return useAdminApiFetch<ApiSuccess<BlogPost>, BlogPost | null>(`/blogs/${slug}`, {
    key: `admin-blog-${slug}`,
    default: () => null,
    getCachedData: undefined,
    server: false,
  });
}

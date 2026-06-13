import type { Ref } from 'vue';

import type { BlogPost, ComputedBlogPost } from '~/modules/blog/types';
import type { ApiPaginated, PaginationMeta } from '~/shared/types/api';
import { readingTime } from '~/shared/utils/reading-time';

/**
 * Paginated public blog list for the index page. `page` is a ref so changing it
 * re-runs the fetch (useFetch watches reactive query params). Keeps the raw
 * envelope to expose `meta` for the pagination control and derives readingTime.
 * Mirrors `useProjectsList` (including the SWR opt-out for reactive pagination).
 */
export function useBlogList(page: Ref<number>, limit = 9) {
  const {
    data: raw,
    pending,
    error,
  } = useApiFetch<ApiPaginated<BlogPost>, ApiPaginated<BlogPost> | null>('/blogs', {
    key: 'blog-page',
    query: { page, limit },
    transform: (res) => res,
    getCachedData: undefined,
    default: () => null,
  });

  const posts = computed<ComputedBlogPost[]>(() =>
    (raw.value?.data ?? []).map((post) => ({
      ...post,
      readingTime: readingTime(post.content),
    })),
  );
  const meta = computed<PaginationMeta | null>(() => raw.value?.meta ?? null);

  return { posts, meta, pending, error };
}

import type { BlogPost, ComputedBlogPost } from '~/modules/blog/types';
import type { ApiPaginated } from '~/shared/types/api';
import { readingTime } from '~/shared/utils/reading-time';

export function useBlog(limit = 10) {
  const {
    data: raw,
    pending,
    error,
  } = useApiFetch<ApiPaginated<BlogPost>, ApiPaginated<BlogPost> | null>('/blogs', {
    key: `blog-list-${limit}`,
    query: { page: 1, limit },
    transform: (res) => res,
    default: () => null,
  });

  const data = computed<ApiPaginated<ComputedBlogPost> | null>(() => {
    if (!raw.value) return null;
    return {
      ...raw.value,
      data: raw.value.data.map((post) => ({
        ...post,
        readingTime: readingTime(post.content),
      })),
    };
  });

  return { data, pending, error };
}

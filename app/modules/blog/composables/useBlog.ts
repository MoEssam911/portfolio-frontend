import type { BlogPost, ComputedBlogPost } from '~/modules/blog/types';
import type { ApiPaginated } from '~/shared/types/api';
import { readingTime } from '~/shared/utils/reading-time';

export function useBlog(limit = 10) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const {
    data: _raw,
    pending,
    error,
  } = useFetch<ApiPaginated<BlogPost>>(`${apiBase}/blogs`, {
    key: `blog-list-${limit}`,
    query: { page: 1, limit },
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  });

  const data = computed<ApiPaginated<ComputedBlogPost> | null>(() => {
    if (!_raw.value) return null;
    return {
      ..._raw.value,
      data: _raw.value.data.map((post) => ({
        ...post,
        readingTime: readingTime(post.content),
      })),
    };
  });

  return { data, pending, error };
}

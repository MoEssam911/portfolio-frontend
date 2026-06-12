import type { BlogPost, ComputedBlogPost } from '~/modules/blog/types';
import type { ApiPaginated } from '~/shared/types/api';

function calcReadingTime(content: string): number {
  return Math.ceil(content.split(/\s+/).length / 200);
}

export function useBlog(limit = 10) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const { data: _raw, pending, error } = useFetch<ApiPaginated<BlogPost>>(
    `${apiBase}/blogs`,
    {
      key: 'blog-list',
      query: { page: 1, limit },
    },
  );

  const data = computed<ApiPaginated<ComputedBlogPost> | null>(() => {
    if (!_raw.value) return null;
    return {
      ..._raw.value,
      data: _raw.value.data.map((post) => ({
        ...post,
        readingTime: calcReadingTime(post.content),
      })),
    };
  });

  return { data, pending, error };
}

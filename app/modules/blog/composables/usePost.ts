import type { MaybeRefOrGetter } from 'vue';

import type { BlogPost, ComputedBlogPost } from '~/modules/blog/types';
import type { ApiSuccess } from '~/shared/types/api';
import { readingTime } from '~/shared/utils/reading-time';

/**
 * Single published post by slug (article page). The URL and key are getters so
 * client-side slug changes re-fetch. Returns `null` until resolved; a missing /
 * unpublished slug surfaces as `error` (backend 404). Mirrors `useProject`.
 */
export function usePost(slug: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const { data: _raw, pending, error } = useFetch<ApiSuccess<BlogPost>>(
    () => `${apiBase}/blogs/${toValue(slug)}`,
    { key: () => `post-${toValue(slug)}` },
  );

  const post = computed<ComputedBlogPost | null>(() => {
    if (!_raw.value?.data) return null;
    return { ..._raw.value.data, readingTime: readingTime(_raw.value.data.content) };
  });

  return { post, pending, error };
}

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
  const {
    data: raw,
    pending,
    error,
  } = useApiFetch<ApiSuccess<BlogPost>, BlogPost | null>(() => `/blogs/${toValue(slug)}`, {
    key: () => `post-${toValue(slug)}`,
    default: () => null,
  });

  const post = computed<ComputedBlogPost | null>(() =>
    raw.value ? { ...raw.value, readingTime: readingTime(raw.value.content) } : null,
  );

  return { post, pending, error };
}

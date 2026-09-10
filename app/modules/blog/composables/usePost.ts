import type { MaybeRefOrGetter } from 'vue';

import type { BlogPost } from '~/modules/blog/types';

import { publishedPosts } from './usePosts';

export function usePost(slug: MaybeRefOrGetter<string>) {
  const post = computed(
    () => publishedPosts().find((p) => p.slug === toValue(slug)) ?? null,
  );
  const error = computed(() => (post.value === null ? new Error('Not found') : null));

  const nextPost = computed((): BlogPost | null => {
    const pool = publishedPosts();
    if (pool.length < 2 || !post.value) return null;
    const i = pool.findIndex((p) => p.slug === post.value!.slug);
    if (i === -1) return pool[0] ?? null;
    return pool[(i + 1) % pool.length] ?? null;
  });

  return { post, nextPost, pending: ref(false), error };
}

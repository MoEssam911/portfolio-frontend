import Fuse from 'fuse.js';
import type { MaybeRefOrGetter, Ref } from 'vue';

import type { ComputedBlogPost } from '~/modules/blog/types';

/**
 * Client-side fuzzy search over an in-memory list of posts (the backend has no
 * search endpoint). Rebuilds the Fuse index when the source list changes and
 * returns the original order when the query is blank.
 */
export function useBlogSearch(
  posts: MaybeRefOrGetter<ComputedBlogPost[]>,
): { query: Ref<string>; results: Ref<ComputedBlogPost[]> } {
  const query = ref('');

  const fuse = computed(
    () =>
      new Fuse(toValue(posts), {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'excerpt', weight: 2 },
          { name: 'tags.name', weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
  );

  const results = computed<ComputedBlogPost[]>(() => {
    const q = query.value.trim();
    if (!q) return toValue(posts);
    return fuse.value.search(q).map((r) => r.item);
  });

  return { query, results };
}

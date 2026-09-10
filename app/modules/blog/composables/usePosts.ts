import postsData from '~/assets/data/posts.json';
import type { BlogPost } from '~/modules/blog/types';

const ALL = postsData as BlogPost[];

/** Published posts only (drafts hidden outside development). */
export function publishedPosts(): BlogPost[] {
  const allowDrafts = import.meta.dev;
  return ALL.filter((p) => allowDrafts || !p.draft).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** Rough reading time from Markdown body (~200 wpm). */
export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function usePosts() {
  const posts = computed(() => publishedPosts());
  const featuredPosts = computed(() => posts.value.filter((p) => p.featured));

  const tags = computed(() => {
    const set = new Set<string>();
    for (const p of posts.value) for (const t of p.tags) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  return { posts, featuredPosts, tags, pending: ref(false), error: ref(null) };
}

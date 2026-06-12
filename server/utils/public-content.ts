/**
 * Server-side helpers for the SEO routes (sitemap, RSS). These run in Nitro, so
 * they read the API base from runtime config and talk to the backend directly
 * with `$fetch`. Failures degrade gracefully — a route should still render its
 * static portion if the backend is unreachable.
 */

interface ApiPaginated<T> {
  success: boolean;
  data: T[];
}

export interface SitemapProject {
  slug: string;
  updatedAt: string;
}

export interface FeedPost {
  slug: string;
  title: string;
  excerpt: string | null;
  createdAt: string;
  updatedAt: string;
}

function apiBase(): string {
  return useRuntimeConfig().public.apiBase as string;
}

async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const res = await $fetch<ApiPaginated<T>>(`${apiBase()}${path}`, {
      query: { limit: 200 },
    });
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

export const fetchProjects = () =>
  fetchList<SitemapProject>('/projects');

export const fetchPosts = () =>
  fetchList<FeedPost>('/blogs');

/** Escape a string for safe inclusion in XML text/attribute nodes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

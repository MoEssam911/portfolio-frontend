import postsRaw from '../../app/assets/data/posts.json';
import projectsRaw from '../../app/assets/data/projects.json';
import type { BlogPost } from '../../app/modules/blog/types';
import type { Project } from '../../app/modules/projects/types';

export interface SitemapProject {
  slug: string;
  updatedAt: string;
}

export interface SitemapPost {
  slug: string;
  updatedAt: string;
}

export function fetchProjects(): SitemapProject[] {
  return (projectsRaw as Project[]).map(({ slug, updatedAt }) => ({ slug, updatedAt }));
}

export function fetchPosts(): SitemapPost[] {
  return (postsRaw as BlogPost[])
    .filter((p) => !p.draft)
    .map(({ slug, updatedAt }) => ({ slug, updatedAt }));
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

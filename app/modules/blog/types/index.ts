import type { MediaItem } from '~/shared/types/api';

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  coverImage: MediaItem | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface ComputedBlogPost extends BlogPost {
  readingTime?: number;
}

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

/**
 * The admin write payload — mirrors the backend Create/UpdateBlogDto exactly
 * (read by slug, mutate by id; the slug auto-regenerates when the title changes).
 * Only these whitelisted keys may be sent (the backend uses `forbidNonWhitelisted`).
 * `excerpt`/`coverImageId` are sent as `null` to clear them; `tags` is an array of
 * tag NAMES the backend connects-or-creates (it returns resolved `Tag[]` objects).
 */
export interface BlogInput {
  title: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  coverImageId: string | null;
  tags: string[];
}

import type { MediaItem } from '~/shared/types/api';

export interface ProjectGalleryImage {
  id: string;
  order: number;
  media: MediaItem;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string;
  liveUrl: string | null;
  repoUrl: string | null;
  technologies: string[];
  featured: boolean;
  published: boolean;
  thumbnail: MediaItem | null;
  gallery: ProjectGalleryImage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * The admin write payload — mirrors the backend Create/UpdateProjectDto exactly
 * (read by slug, mutate by id; the entity returns resolved `thumbnail`/`gallery`
 * objects, but writes reference media by id). Only these whitelisted keys may be
 * sent (the backend uses `forbidNonWhitelisted`). Optional fields are sent as
 * `null` to clear them; `galleryImageIds` REPLACES the gallery (ordered).
 */
export interface ProjectInput {
  title: string;
  excerpt: string | null;
  description: string;
  liveUrl: string | null;
  repoUrl: string | null;
  technologies: string[];
  featured: boolean;
  published: boolean;
  thumbnailId: string | null;
  galleryImageIds: string[];
}

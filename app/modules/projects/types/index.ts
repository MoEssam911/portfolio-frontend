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

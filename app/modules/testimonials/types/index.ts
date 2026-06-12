import type { MediaItem } from '~/shared/types/api';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  quote: string;
  avatar: MediaItem | null;
  featured: boolean;
  published: boolean;
  order: number;
}

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

/**
 * The admin write payload — mirrors the backend Create/UpdateTestimonialDto
 * exactly (only these whitelisted keys may be sent; the backend uses
 * `forbidNonWhitelisted`). Empty optionals (`company`/`avatarId`) are sent as
 * `null` to clear them. The entity returns a resolved `avatar` object, but writes
 * reference the media by id. `order` is NOT part of this payload — position is
 * managed exclusively through `PATCH /testimonials/reorder`.
 *
 * NOTE: the backend does NOT ownership-validate `avatarId` (AUDIT §5), so the
 * dashboard only ever offers the owner's own media through the MediaPicker.
 */
export interface TestimonialInput {
  name: string;
  role: string;
  company: string | null;
  quote: string;
  avatarId: string | null;
  featured: boolean;
  published: boolean;
}

import type { Ref } from 'vue';

import type { PaginationMeta } from '~/shared/types/api';

// ── Auth (Phase 2) ───────────────────────────────────────────────────────────

/** The authenticated dashboard user (mirrors the backend `/auth/me` payload). */
export interface DashboardUser {
  id: string;
  email: string;
  username: string;
}

/** Login form credentials. */
export interface LoginCredentials {
  email: string;
  password: string;
}

// ── Navigation ─────────────────────────────────────────────────────────────

/** A single entry in the dashboard sidebar. */
export interface NavItem {
  /** Section label, e.g. "Projects". */
  label: string;
  /** Target route, e.g. "/dashboard/projects". */
  to: string;
  /** Lucide icon name (without the `lucide:` prefix is NOT used — pass the full id). */
  icon: string;
}

// ── DataTable primitive ──────────────────────────────────────────────────────

export type TableAlign = 'start' | 'center' | 'end';

/**
 * A column definition for {@link DataTable}, generic over the row type `T`.
 * Render cells either by providing an `accessor` (plain text) or a `#cell-<key>`
 * slot in the consuming page (slot wins).
 */
export interface DataTableColumn<T> {
  /** Unique key — also the slot name suffix (`#cell-<key>`) and sort key. */
  key: string;
  /** Column header text. */
  label: string;
  /** Show a sort toggle in the header. Emits `update:sort`. */
  sortable?: boolean;
  /** Cell + header alignment. Defaults to `start`. */
  align?: TableAlign;
  /** Extra classes applied to every cell in this column. */
  class?: string;
  /** Fixed column width (CSS value, e.g. `'12rem'`, `'80px'`). */
  width?: string;
  /** Plain-text accessor used when no `#cell-<key>` slot is supplied. */
  accessor?: (row: T) => string | number | null | undefined;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

// ── Resource list/mutation composables ───────────────────────────────────────

/** Reactive list state returned by {@link useResourceList}. */
export interface ResourceListResult<T> {
  items: Ref<T[]>;
  meta: Ref<PaginationMeta | null>;
  page: Ref<number>;
  limit: Ref<number>;
  pending: Ref<boolean>;
  error: Ref<unknown>;
  refresh: () => Promise<void>;
}

/** Re-export resource entity types so dashboard pages import from one place. */
export type { BlogInput, BlogPost, Tag } from '~/modules/blog/types';
export type { ContactMessage, ContactMessageInput } from '~/modules/contact/types';
export type { Project, ProjectGalleryImage, ProjectInput } from '~/modules/projects/types';
export type {
  Certification,
  CertificationInput,
  Education,
  EducationInput,
  Experience,
  ExperienceInput,
  ResumeLink,
  ResumeLinkInput,
  ResumeProfile,
  ResumeProfileInput,
  SkillGroup,
  SkillGroupInput,
  SkillItem,
} from '~/modules/resume/types';
export type { Service, ServiceInput } from '~/modules/services/types';
export type { SettingsInput, SiteSettings } from '~/modules/settings/types';
export type { Testimonial, TestimonialInput } from '~/modules/testimonials/types';
export type { MediaItem, PaginationMeta } from '~/shared/types/api';

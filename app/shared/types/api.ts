export interface MediaItem {
  id: string;
  url: string;
  key: string;
  type: 'IMAGE' | 'VIDEO' | 'FILE';
  size: number | null;
  mimeType: string;
  originalName: string | null;
  alt: string | null;
  caption: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

/**
 * The media-list endpoint is the one backend read that does NOT follow the
 * paginated `{ data: T[], meta }` envelope — it returns `{ data: { items, total } }`.
 * This typed variant lets dashboard reads consume it through the standard
 * `useApiFetch` envelope unwrap (`ApiSuccess<AdminMediaList>` → `AdminMediaList`).
 */
export interface AdminMediaList {
  items: MediaItem[];
  total: number;
}

export interface ApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errors?: string[];
}

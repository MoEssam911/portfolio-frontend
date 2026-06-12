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

export interface ApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errors?: string[];
}

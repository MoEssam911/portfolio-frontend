export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
  class?: string;
  width?: string;
}

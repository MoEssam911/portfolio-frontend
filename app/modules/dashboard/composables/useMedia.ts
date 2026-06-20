import { normalizeError } from '~/core/api/errors';
import { $admin, ADMIN_BASE, useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import { useAdminMutation } from '~/modules/dashboard/composables/useAdminMutation';
import type { ApiPaginated, MediaItem, PaginationMeta } from '~/shared/types/api';

/**
 * useMedia — the data layer for the dashboard media library (Phase 4).
 *
 * LIST   → `useAdminApiFetch` (the BFF-pointed read primitive), identity transform.
 * UPLOAD → `uploadMedia` (a standalone XHR helper, below — XHR rather than `$admin`
 *          because we need upload-progress events that `fetch`/ofetch can't emit).
 * UPDATE / DELETE → `$admin` + `useAdminMutation` (toast + normalized error).
 *
 * NOTE on the list shape: the backend wraps any `{ data, meta }` service return in
 * `{ success, data, meta }`, so `/dashboard/media` actually comes back as the
 * STANDARD `ApiPaginated<MediaItem>` — NOT the `{ items, total }` shape AUDIT.md
 * once noted. This composable normalizes BOTH shapes defensively so it can't drift
 * if the backend envelope changes again.
 */

// ── Client-side validation (mirrors the backend's own rules) ─────────────────

export const MEDIA_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const MEDIA_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;
/** For the `<input accept>` attribute. */
export const MEDIA_ACCEPT_ATTR = MEDIA_ACCEPTED_TYPES.join(',');

/** Returns a human-readable rejection reason, or `null` when the file is valid. */
export function validateMediaFile(file: File): string | null {
  if (!(MEDIA_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return `"${file.name}" isn't a supported type. Use JPEG, PNG, WebP, or PDF.`;
  }
  if (file.size > MEDIA_MAX_SIZE) {
    return `"${file.name}" is ${formatFileSize(file.size)} — over the 10MB limit.`;
  }
  return null;
}

/** Compact byte formatter for media cards / upload rows. */
export function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

// ── Upload (multipart, with progress) ────────────────────────────────────────

export interface UploadMediaOptions {
  /** Called with 0–100 as the upload streams. */
  onProgress?: (percent: number) => void;
  /** Abort the in-flight upload. */
  signal?: AbortSignal;
}

/**
 * Upload one file to `/api/admin/media/upload` (field name `file`). Posts through
 * the same-origin BFF proxy, which forwards the multipart body + httpOnly auth
 * cookie to the backend. Resolves to the created {@link MediaItem}; rejects with a
 * normalized {@link import('~/core/api/errors').ApiError} on failure.
 *
 * Uses `XMLHttpRequest` (not `$admin`) solely to surface `upload.onprogress`.
 */
export function uploadMedia(file: File, options: UploadMediaOptions = {}): Promise<MediaItem> {
  return new Promise<MediaItem>((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${ADMIN_BASE}/media/upload`);
    xhr.responseType = 'json';
    xhr.withCredentials = true;

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      const body = xhr.response as { success?: boolean; data?: MediaItem } | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.success && body.data) {
        options.onProgress?.(100);
        resolve(body.data);
      } else {
        reject(normalizeError({ status: xhr.status, data: body }));
      }
    });

    xhr.addEventListener('error', () =>
      reject(normalizeError({ status: 0, data: { message: 'Network error during upload' } })),
    );
    xhr.addEventListener('abort', () =>
      reject(normalizeError({ status: 0, data: { message: 'Upload cancelled' } })),
    );

    if (options.signal) {
      if (options.signal.aborted) {
        xhr.abort();
        return;
      }
      options.signal.addEventListener('abort', () => xhr.abort());
    }

    xhr.send(form);
  });
}

// ── List + update + delete ───────────────────────────────────────────────────

/** The raw list envelope — typed loosely so both wire shapes normalize cleanly. */
interface MediaListWire {
  data?: MediaItem[] | { items?: MediaItem[]; total?: number; page?: number; limit?: number };
  meta?: PaginationMeta;
}

export interface UseMediaOptions {
  /** Initial page (1-based). Default 1. */
  page?: number;
  /** Page size. Default 24 (a 6-col grid × 4 rows). */
  limit?: number;
  /** Override the useAsyncData key (give the picker its own cache slot). */
  key?: string;
  /** Fetch immediately. Default true; the picker passes false until it opens. */
  immediate?: boolean;
}

export function useMedia(options: UseMediaOptions = {}) {
  const page = ref(options.page ?? 1);
  const limit = ref(options.limit ?? 24);

  const { data, pending, error, refresh } = useAdminApiFetch<
    ApiPaginated<MediaItem>,
    MediaListWire | null
  >('/media', {
    key: options.key ?? 'admin-media',
    query: { page, limit },
    transform: (res) => res as MediaListWire,
    getCachedData: undefined,
    default: () => null,
    server: false,
    immediate: options.immediate ?? true,
  });

  const items = computed<MediaItem[]>(() => {
    const raw = data.value?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') return raw.items ?? [];
    return [];
  });

  const meta = computed<PaginationMeta | null>(() => {
    if (data.value?.meta) return data.value.meta;
    // Fallback for the `{ items, total }` shape (no `meta` alongside).
    const raw = data.value?.data;
    if (raw && !Array.isArray(raw) && typeof raw === 'object') {
      const total = raw.total ?? raw.items?.length ?? 0;
      const p = raw.page ?? page.value;
      const l = raw.limit ?? limit.value;
      const totalPages = l > 0 ? Math.ceil(total / l) : 1;
      return {
        total,
        page: p,
        limit: l,
        totalPages,
        hasNextPage: p < totalPages,
        hasPrevPage: p > 1,
      };
    }
    return null;
  });

  const update = useAdminMutation<
    MediaItem,
    { id: string; input: { alt?: string; caption?: string } }
  >(({ id, input }) => $admin<MediaItem>(`/media/${id}`, { method: 'PATCH', body: input }), {
    successMessage: 'Media details saved',
    onSuccess: () => refresh(),
  });

  const remove = useAdminMutation<{ success?: boolean }, string>(
    (id) => $admin<{ success?: boolean }>(`/media/${id}`, { method: 'DELETE' }),
    { successMessage: 'File deleted', onSuccess: () => refresh() },
  );

  const confirm = useConfirm();

  /**
   * Confirm, then delete. The confirm copy is intentionally a strong WARNING:
   * the backend does NOT check whether a file is still referenced (project
   * thumbnail/gallery, blog cover, testimonial avatar) before destroying it —
   * see AUDIT.md §5. Resolves to the deleted result, or `null` if cancelled/failed.
   */
  async function removeWithConfirm(item: MediaItem): Promise<{ success?: boolean } | null> {
    try {
      await confirm.ask({
        title: 'Delete this file?',
        message:
          `"${item.originalName ?? 'This file'}" will be permanently removed from storage. ` +
          'If it is used anywhere — a project thumbnail or gallery image, a blog cover, ' +
          'or a testimonial avatar — that reference will break. Deletion is NOT checked ' +
          'against usage and cannot be undone.',
        confirmLabel: 'Delete file',
        variant: 'danger',
      });
    } catch {
      return null; // cancelled
    }
    return remove.mutate(item.id);
  }

  return {
    items,
    meta,
    page,
    limit,
    pending,
    error,
    refresh: async () => {
      await refresh();
    },
    update,
    remove,
    removeWithConfirm,
  };
}

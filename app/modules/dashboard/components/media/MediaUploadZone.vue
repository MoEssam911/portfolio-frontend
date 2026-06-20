<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  formatFileSize,
  MEDIA_ACCEPT_ATTR,
  uploadMedia,
  validateMediaFile,
} from '~/modules/dashboard/composables/useMedia';
import type { MediaItem } from '~/shared/types/api';

/**
 * MediaUploadZone — drag-drop + click-to-browse uploader, reused by the media
 * page and the inline upload in MediaPicker. Validates size/type on the client
 * BEFORE sending, uploads each file concurrently with a live progress bar, and
 * emits `uploaded` per successful file so the parent can refresh/select.
 */
withDefaults(
  defineProps<{
    /** Tighter layout for the picker's inline slot. */
    compact?: boolean;
  }>(),
  { compact: false },
);

const emit = defineEmits<{
  /** Fired once per file that finishes uploading. */
  uploaded: [media: MediaItem];
}>();

interface UploadRow {
  id: string;
  name: string;
  size: number;
  percent: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

const rows = ref<UploadRow[]>([]);
const isDragging = ref(false);
const input = ref<HTMLInputElement | null>(null);

function browse() {
  input.value?.click();
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) handleFiles(target.files);
  target.value = ''; // allow re-selecting the same file
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files) handleFiles(event.dataTransfer.files);
}

function handleFiles(fileList: FileList) {
  for (const file of Array.from(fileList)) {
    const rowId = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
    const reason = validateMediaFile(file);

    if (reason) {
      rows.value.push({
        id: rowId,
        name: file.name,
        size: file.size,
        percent: 0,
        status: 'error',
        error: reason,
      });
      continue;
    }

    const row: UploadRow = {
      id: rowId,
      name: file.name,
      size: file.size,
      percent: 0,
      status: 'uploading',
    };
    rows.value.push(row);

    uploadMedia(file, {
      onProgress: (percent) => {
        const current = rows.value.find((r) => r.id === rowId);
        if (current) current.percent = percent;
      },
    })
      .then((media) => {
        const current = rows.value.find((r) => r.id === rowId);
        if (current) {
          current.status = 'done';
          current.percent = 100;
        }
        emit('uploaded', media);
        // Clear the finished row after a beat so the list doesn't accumulate.
        setTimeout(() => {
          rows.value = rows.value.filter((r) => r.id !== rowId);
        }, 1500);
      })
      .catch((err: { message?: string }) => {
        const current = rows.value.find((r) => r.id === rowId);
        if (current) {
          current.status = 'error';
          current.error = err?.message ?? 'Upload failed';
        }
      });
  }
}

function dismiss(id: string) {
  rows.value = rows.value.filter((r) => r.id !== id);
}

const hasRows = computed(() => rows.value.length > 0);
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      role="button"
      tabindex="0"
      class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center transition-colors"
      :class="[
        compact ? 'px-4 py-6' : 'px-6 py-10',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/20 hover:border-primary-border hover:bg-muted/40',
      ]"
      aria-label="Upload files"
      @click="browse"
      @keydown.enter.prevent="browse"
      @keydown.space.prevent="browse"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <div
        class="flex size-10 items-center justify-center rounded-xl border border-border bg-background"
      >
        <Icon name="lucide:cloud-upload" class="size-5 text-muted-foreground" />
      </div>
      <div class="flex flex-col gap-0.5">
        <p class="text-sm text-foreground">
          <span class="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-muted-foreground">JPEG, PNG, WebP or PDF · up to 10MB</p>
      </div>
      <input
        ref="input"
        type="file"
        class="sr-only"
        :accept="MEDIA_ACCEPT_ATTR"
        multiple
        @change="onInputChange"
      />
    </div>

    <!-- Per-file progress / errors -->
    <ul v-if="hasRows" class="flex flex-col gap-2">
      <li
        v-for="row in rows"
        :key="row.id"
        class="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
      >
        <Icon
          :name="
            row.status === 'done'
              ? 'lucide:circle-check'
              : row.status === 'error'
                ? 'lucide:circle-alert'
                : 'lucide:file-up'
          "
          class="size-4 shrink-0"
          :class="[
            row.status === 'done'
              ? 'text-success'
              : row.status === 'error'
                ? 'text-destructive'
                : 'text-muted-foreground',
          ]"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm text-foreground">{{ row.name }}</span>
            <span class="shrink-0 text-xs text-muted-foreground">
              {{ row.status === 'error' ? 'Failed' : `${row.percent}%` }}
            </span>
          </div>
          <!-- Progress track -->
          <div
            v-if="row.status !== 'error'"
            class="mt-1.5 h-1 overflow-hidden rounded-full bg-muted"
          >
            <div
              class="h-full rounded-full transition-all duration-150"
              :class="row.status === 'done' ? 'bg-success' : 'bg-primary'"
              :style="{ width: `${row.percent}%` }"
            />
          </div>
          <p v-else class="mt-0.5 truncate text-xs text-destructive">{{ row.error }}</p>
        </div>
        <span v-if="row.status !== 'error'" class="shrink-0 text-xs text-muted-foreground">
          {{ formatFileSize(row.size) }}
        </span>
        <Button
          v-if="row.status === 'error'"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss"
          @click="dismiss(row.id)"
        >
          <Icon name="lucide:x" class="size-4" />
        </Button>
      </li>
    </ul>
  </div>
</template>

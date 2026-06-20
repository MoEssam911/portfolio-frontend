<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { formatFileSize } from '~/modules/dashboard/composables/useMedia';
import type { MediaItem } from '~/shared/types/api';

/**
 * MediaCard — a single tile in the media grid. Renders an image thumbnail (plain
 * `<img>` for remote media, per the project convention) or a typed placeholder
 * for PDFs/files. Two modes:
 *   - library  (`selectable=false`): hover reveals edit + delete actions.
 *   - picker   (`selectable=true`): the whole tile is a toggle; `selectionIndex`
 *     (1-based) shows an order badge for multi-select.
 */
const props = withDefaults(
  defineProps<{
    media: MediaItem;
    selectable?: boolean;
    selected?: boolean;
    /** 1-based position in an ordered multi-selection; null to hide. */
    selectionIndex?: number | null;
  }>(),
  { selectable: false, selected: false, selectionIndex: null },
);

const emit = defineEmits<{
  select: [media: MediaItem];
  edit: [media: MediaItem];
  remove: [media: MediaItem];
}>();

const isImage = computed(
  () => props.media.type === 'IMAGE' || props.media.mimeType.startsWith('image/'),
);
const isPdf = computed(() => props.media.mimeType === 'application/pdf');
const label = computed(() => props.media.originalName ?? props.media.alt ?? 'Untitled');
</script>

<template>
  <div
    class="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors"
    :class="[
      selectable ? 'cursor-pointer' : '',
      selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary-border',
    ]"
    :role="selectable ? 'button' : undefined"
    :aria-pressed="selectable ? selected : undefined"
    :tabindex="selectable ? 0 : undefined"
    @click="selectable && emit('select', media)"
    @keydown.enter.prevent="selectable && emit('select', media)"
    @keydown.space.prevent="selectable && emit('select', media)"
  >
    <!-- Preview -->
    <div class="relative aspect-square w-full overflow-hidden bg-muted/40">
      <img
        v-if="isImage"
        :src="media.url"
        :alt="media.alt ?? label"
        loading="lazy"
        class="size-full object-cover"
      />
      <div
        v-else
        class="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground"
      >
        <Icon :name="isPdf ? 'lucide:file-text' : 'lucide:file'" class="size-8" />
        <span class="text-xs uppercase tracking-wide">{{ isPdf ? 'PDF' : 'File' }}</span>
      </div>

      <!-- Selection overlay -->
      <div
        v-if="selectable"
        class="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border text-xs font-medium transition-colors"
        :class="[
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background/80 text-transparent',
        ]"
      >
        <span v-if="selectionIndex != null">{{ selectionIndex }}</span>
        <Icon v-else-if="selected" name="lucide:check" class="size-3.5" />
      </div>

      <!-- Library actions (hover) -->
      <div
        v-if="!selectable"
        class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
      >
        <Button
          variant="secondary"
          size="icon-sm"
          class="bg-background/90 backdrop-blur"
          aria-label="Edit details"
          @click.stop="emit('edit', media)"
        >
          <Icon name="lucide:pencil" class="size-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          class="bg-background/90 text-destructive backdrop-blur hover:text-destructive"
          aria-label="Delete file"
          @click.stop="emit('remove', media)"
        >
          <Icon name="lucide:trash-2" class="size-3.5" />
        </Button>
      </div>
    </div>

    <!-- Meta -->
    <div class="flex flex-col gap-0.5 p-2.5">
      <p class="truncate text-sm text-foreground" :title="label">{{ label }}</p>
      <p class="text-xs text-muted-foreground">{{ formatFileSize(media.size) }}</p>
    </div>
  </div>
</template>

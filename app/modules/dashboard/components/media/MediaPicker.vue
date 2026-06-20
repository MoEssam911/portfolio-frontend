<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMedia } from '~/modules/dashboard/composables/useMedia';
import type { MediaItem } from '~/shared/types/api';

import EmptyState from '../EmptyState.vue';
import MediaCard from './MediaCard.vue';
import MediaUploadZone from './MediaUploadZone.vue';

/**
 * MediaPicker — a dialog for choosing existing media (with inline upload), used
 * anywhere a resource references a media id (project thumbnail/gallery, blog
 * cover, testimonial avatar). Single-select returns one id; multi-select returns
 * an ORDERED list (project galleries care about order).
 *
 * `v-model` carries the selected id(s); `@select` additionally hands back the
 * resolved {@link MediaItem} objects so the caller can render a preview without a
 * second fetch. Render your trigger in the default slot:
 *
 *   <MediaPicker v-model="thumbnailId" @select="onSelect">
 *     <template #default="{ open }">
 *       <Button @click="open">Choose image</Button>
 *     </template>
 *   </MediaPicker>
 */
const props = withDefaults(
  defineProps<{
    modelValue?: string | string[] | null;
    multiple?: boolean;
    title?: string;
    description?: string;
  }>(),
  {
    modelValue: null,
    multiple: false,
    title: 'Select media',
    description: 'Pick an existing file or upload a new one.',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  select: [payload: { ids: string[]; items: MediaItem[] }];
}>();

const open = ref(false);
const search = ref('');

// Own cache slot; don't fetch until the dialog opens.
const { items, meta, page, pending, error, refresh } = useMedia({
  key: 'media-picker',
  immediate: false,
});

/** Ordered current selection, carried as full objects so we can emit previews. */
const selection = ref<MediaItem[]>([]);
const selectedIds = computed(() => selection.value.map((m) => m.id));

function isSelected(media: MediaItem): boolean {
  return selectedIds.value.includes(media.id);
}

function selectionIndex(media: MediaItem): number | null {
  if (!props.multiple) return null;
  const idx = selectedIds.value.indexOf(media.id);
  return idx === -1 ? null : idx + 1;
}

function toggle(media: MediaItem) {
  if (props.multiple) {
    selection.value = isSelected(media)
      ? selection.value.filter((m) => m.id !== media.id)
      : [...selection.value, media];
  } else {
    selection.value = isSelected(media) ? [] : [media];
  }
}

/** Seed the selection from the incoming model value once a list is available. */
function seedSelection() {
  const ids = Array.isArray(props.modelValue)
    ? props.modelValue
    : props.modelValue
      ? [props.modelValue]
      : [];
  // Preserve the caller's order; resolve each id to a loaded item when possible.
  selection.value = ids
    .map((id) => items.value.find((m) => m.id === id))
    .filter((m): m is MediaItem => Boolean(m));
}

async function openPicker() {
  open.value = true;
  search.value = '';
  await refresh();
  seedSelection();
}

// Re-seed if the list arrives after open (refresh resolves async).
watch(items, () => {
  if (open.value && selection.value.length === 0) seedSelection();
});

function onUploaded(media: MediaItem) {
  refresh();
  // Auto-select freshly uploaded files (append for multi, replace for single).
  if (props.multiple) {
    if (!isSelected(media)) selection.value = [...selection.value, media];
  } else {
    selection.value = [media];
  }
}

const filteredItems = computed<MediaItem[]>(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((m) =>
    [m.originalName, m.alt, m.caption]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q)),
  );
});

const totalPages = computed(() => meta.value?.totalPages ?? 1);
const canPrev = computed(() => page.value > 1);
const canNext = computed(() => page.value < totalPages.value);

function confirmSelection() {
  const ids = selectedIds.value;
  emit('update:modelValue', props.multiple ? ids : (ids[0] ?? ''));
  emit('select', { ids, items: [...selection.value] });
  open.value = false;
}

const confirmLabel = computed(() => {
  const n = selection.value.length;
  if (props.multiple) return n > 0 ? `Select ${n} file${n === 1 ? '' : 's'}` : 'Select';
  return 'Select';
});
</script>

<template>
  <slot :open="openPicker" :selected="selection">
    <Button type="button" variant="outline" size="sm" @click="openPicker">
      <Icon name="lucide:image" class="size-4" />
      {{ multiple ? 'Choose media' : 'Choose image' }}
    </Button>
  </slot>

  <Dialog :open="open" @update:open="open = $event">
    <DialogContent class="flex max-h-[85vh] flex-col gap-4 sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>

      <!-- Inline upload -->
      <MediaUploadZone compact @uploaded="onUploaded" />

      <!-- Search -->
      <div class="relative">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="search"
          type="search"
          placeholder="Search this page by name, alt, or caption…"
          class="h-9 pl-8"
          aria-label="Search media"
        />
      </div>

      <!-- Body: scrollable grid -->
      <div class="min-h-0 flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton v-for="n in 8" :key="`pick-sk-${n}`" class="aspect-square w-full rounded-xl" />
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-10 text-center"
        >
          <Icon name="lucide:triangle-alert" class="size-5 text-destructive" />
          <p class="text-sm text-muted-foreground">Couldn't load media.</p>
          <Button variant="outline" size="sm" @click="refresh">Retry</Button>
        </div>

        <!-- Empty -->
        <EmptyState
          v-else-if="filteredItems.length === 0"
          compact
          icon="lucide:image"
          :title="search ? 'No matches' : 'No media yet'"
          :description="
            search ? 'Try a different search on this page.' : 'Upload a file to get started.'
          "
        />

        <!-- Grid -->
        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MediaCard
            v-for="media in filteredItems"
            :key="media.id"
            :media="media"
            selectable
            :selected="isSelected(media)"
            :selection-index="selectionIndex(media)"
            @select="toggle"
          />
        </div>
      </div>

      <DialogFooter class="flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <!-- Pager -->
        <div v-if="totalPages > 1" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="icon-sm"
            :disabled="!canPrev"
            aria-label="Previous page"
            @click="page--"
          >
            <Icon name="lucide:chevron-left" class="size-4" />
          </Button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <Button
            variant="outline"
            size="icon-sm"
            :disabled="!canNext"
            aria-label="Next page"
            @click="page++"
          >
            <Icon name="lucide:chevron-right" class="size-4" />
          </Button>
        </div>
        <div v-else />

        <div class="flex items-center gap-2">
          <Button variant="ghost" @click="open = false">Cancel</Button>
          <Button :disabled="selection.length === 0" @click="confirmSelection">{{
            confirmLabel
          }}</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

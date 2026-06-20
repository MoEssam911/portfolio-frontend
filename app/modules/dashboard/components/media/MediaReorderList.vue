<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { MediaItem } from '~/shared/types/api';

/**
 * MediaReorderList — an ordered, drag-reorderable strip of selected media (used
 * for a project gallery). Order matters: the index is the persisted position.
 * Reordering works two ways for accessibility:
 *   - pointer: native HTML drag-and-drop (grab the handle, drop on a tile);
 *   - keyboard / no-drag: the ↑/↓ buttons on each tile move it one slot.
 * The parent owns the array — this is a controlled `v-model` of `MediaItem[]`.
 */
const props = defineProps<{
  modelValue: MediaItem[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: MediaItem[]];
}>();

const dragIndex = ref<number | null>(null);
const overIndex = ref<number | null>(null);

function move(from: number, to: number) {
  if (to < 0 || to >= props.modelValue.length || from === to) return;
  const next = [...props.modelValue];
  const [item] = next.splice(from, 1);
  if (item) next.splice(to, 0, item);
  emit('update:modelValue', next);
}

function removeAt(index: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  );
}

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    // Firefox requires data to be set for a drag to start.
    event.dataTransfer.setData('text/plain', String(index));
  }
}

function onDragOver(index: number) {
  overIndex.value = index;
}

function onDrop(index: number) {
  if (dragIndex.value !== null) move(dragIndex.value, index);
  dragIndex.value = null;
  overIndex.value = null;
}

function onDragEnd() {
  dragIndex.value = null;
  overIndex.value = null;
}

function isImage(media: MediaItem): boolean {
  return media.type === 'IMAGE' || media.mimeType.startsWith('image/');
}
</script>

<template>
  <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    <li
      v-for="(media, index) in modelValue"
      :key="media.id"
      draggable="true"
      class="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors"
      :class="[
        overIndex === index && dragIndex !== index
          ? 'border-primary ring-1 ring-primary'
          : 'border-border',
        dragIndex === index ? 'opacity-50' : '',
      ]"
      @dragstart="onDragStart(index, $event)"
      @dragover.prevent="onDragOver(index)"
      @drop.prevent="onDrop(index)"
      @dragend="onDragEnd"
    >
      <!-- Preview -->
      <div class="relative aspect-square w-full overflow-hidden bg-muted/40">
        <img
          v-if="isImage(media)"
          :src="media.url"
          :alt="media.alt ?? media.originalName ?? ''"
          loading="lazy"
          class="size-full object-cover"
        />
        <div v-else class="flex size-full items-center justify-center text-muted-foreground">
          <Icon name="lucide:file" class="size-7" />
        </div>

        <!-- Order badge + drag handle -->
        <span
          class="absolute left-2 top-2 flex size-6 cursor-grab items-center justify-center rounded-full bg-background/85 text-xs font-medium text-foreground backdrop-blur active:cursor-grabbing"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </span>

        <!-- Remove -->
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          class="absolute right-2 top-2 bg-background/90 text-destructive opacity-0 backdrop-blur transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
          :aria-label="`Remove image ${index + 1}`"
          @click="removeAt(index)"
        >
          <Icon name="lucide:x" class="size-3.5" />
        </Button>
      </div>

      <!-- Reorder controls (keyboard-accessible) -->
      <div class="flex items-center justify-between gap-1 px-2 py-1.5">
        <span class="truncate text-xs text-muted-foreground" :title="media.originalName ?? ''">
          {{ media.originalName ?? 'Untitled' }}
        </span>
        <div class="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            :disabled="index === 0"
            :aria-label="`Move image ${index + 1} earlier`"
            @click="move(index, index - 1)"
          >
            <Icon name="lucide:chevron-left" class="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            :disabled="index === modelValue.length - 1"
            :aria-label="`Move image ${index + 1} later`"
            @click="move(index, index + 1)"
          >
            <Icon name="lucide:chevron-right" class="size-4" />
          </Button>
        </div>
      </div>
    </li>
  </ul>
</template>

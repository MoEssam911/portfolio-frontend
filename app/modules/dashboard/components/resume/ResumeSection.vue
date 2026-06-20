<script setup lang="ts" generic="T extends { id: string }">
import { toRef } from 'vue';

import { Button } from '@/components/ui/button';
import { useReorderableList } from '~/modules/dashboard/composables/useReorderableList';

/**
 * ResumeSection — a titled, drag-reorderable list of one resume child collection.
 *
 * Presentational + reorder only: it owns a `useReorderableList` working copy
 * seeded from `items` (re-seeds whenever a fresh read arrives) and persists
 * order to `PATCH /<resource>/reorder`. Create / edit / delete are delegated up
 * via `@add` / `@edit` / `@delete`; the parent owns those mutations and the edit
 * dialog. Each row's primary content is rendered through the `#item` slot.
 *
 *   <ResumeSection title="Experience" :items="experiences"
 *     resource="resume/experiences" label="experiences"
 *     @add="…" @edit="…" @delete="…">
 *     <template #item="{ item }">…</template>
 *   </ResumeSection>
 */
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    /** The ordered collection (already sorted by the backend). */
    items: T[];
    /** Nested resource path for the reorder endpoint, e.g. `resume/experiences`. */
    resource: string;
    /** Plural noun for the reorder failure toast, e.g. `experiences`. */
    label: string;
    /** Label for the add button. */
    addLabel?: string;
    /** Empty-state copy. */
    emptyText?: string;
  }>(),
  { addLabel: 'Add', emptyText: 'Nothing here yet.' },
);

const emit = defineEmits<{
  add: [];
  edit: [item: T];
  delete: [item: T];
}>();

const reorder = useReorderableList<T>(props.resource, toRef(props, 'items'), {
  label: props.label,
});
</script>

<template>
  <section class="flex flex-col gap-3 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
    <header class="flex items-start justify-between gap-3">
      <div class="flex flex-col">
        <h2 class="font-display text-base text-foreground">{{ title }}</h2>
        <p v-if="description" class="mt-0.5 text-sm text-muted-foreground">{{ description }}</p>
      </div>
      <Button size="sm" variant="outline" class="h-8 shrink-0" @click="emit('add')">
        <Icon name="lucide:plus" class="size-4" />
        {{ addLabel }}
      </Button>
    </header>

    <!-- Empty -->
    <p
      v-if="reorder.ordered.value.length === 0"
      class="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
    >
      {{ emptyText }}
    </p>

    <!-- Populated: reorderable list -->
    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="(item, index) in reorder.ordered.value"
        :key="item.id"
        draggable="true"
        class="group flex items-center gap-2 rounded-xl border bg-card px-2.5 py-2.5 transition-colors sm:gap-3 sm:px-3"
        :class="[
          reorder.overIndex.value === index && reorder.dragIndex.value !== index
            ? 'border-primary ring-1 ring-primary'
            : 'border-border',
          reorder.dragIndex.value === index ? 'opacity-50' : '',
        ]"
        @dragstart="reorder.onDragStart(index, $event)"
        @dragover.prevent="reorder.onDragOver(index)"
        @drop.prevent="reorder.onDrop(index)"
        @dragend="reorder.onDragEnd"
      >
        <!-- Drag handle -->
        <span
          class="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground active:cursor-grabbing"
          aria-hidden="true"
          title="Drag to reorder"
        >
          <Icon name="lucide:grip-vertical" class="size-4" />
        </span>

        <!-- Keyboard reorder -->
        <div class="flex shrink-0 flex-col">
          <Button
            variant="ghost"
            size="icon-sm"
            class="size-5"
            :disabled="index === 0 || reorder.persisting.value"
            :aria-label="`Move up`"
            @click="reorder.moveBy(index, -1)"
          >
            <Icon name="lucide:chevron-up" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="size-5"
            :disabled="index === reorder.ordered.value.length - 1 || reorder.persisting.value"
            :aria-label="`Move down`"
            @click="reorder.moveBy(index, 1)"
          >
            <Icon name="lucide:chevron-down" class="size-4" />
          </Button>
        </div>

        <!-- Primary content (slot) -->
        <button
          type="button"
          class="flex min-w-0 flex-1 flex-col text-left"
          @click="emit('edit', item)"
        >
          <slot name="item" :item="item" />
        </button>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit"
            title="Edit"
            @click="emit('edit', item)"
          >
            <Icon name="lucide:pencil" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:text-destructive"
            aria-label="Delete"
            title="Delete"
            @click="emit('delete', item)"
          >
            <Icon name="lucide:trash-2" class="size-4" />
          </Button>
        </div>
      </li>
    </ul>
  </section>
</template>

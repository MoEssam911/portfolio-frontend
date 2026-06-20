<script setup lang="ts">
import { Input } from '@/components/ui/input';

/**
 * Toolbar — the search + filters + create row above a DataTable. Search is
 * `v-model`-bound (debounce upstream if needed); drop filter controls into the
 * `#filters` slot and the create button into `#actions`.
 *
 *   <Toolbar v-model:search="search" placeholder="Search projects…">
 *     <template #filters><StatusFilter v-model="status" /></template>
 *     <template #actions><Button>New</Button></template>
 *   </Toolbar>
 */
withDefaults(
  defineProps<{
    search?: string;
    placeholder?: string;
    /** Hide the built-in search input (filters-only toolbar). */
    searchable?: boolean;
  }>(),
  { search: '', placeholder: 'Search…', searchable: true },
);

defineEmits<{ 'update:search': [value: string] }>();
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-1 flex-wrap items-center gap-2">
      <div v-if="searchable" class="relative w-full sm:max-w-xs">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          :model-value="search"
          type="search"
          :placeholder="placeholder"
          class="h-9 pl-8"
          aria-label="Search"
          @update:model-value="$emit('update:search', String($event))"
        />
      </div>
      <slot name="filters" />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

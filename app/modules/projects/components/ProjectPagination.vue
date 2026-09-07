<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '~/shared/types/api';

interface Props {
  meta: PaginationMeta;
  modelValue: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();

function go(page: number) {
  if (page < 1 || page > props.meta.totalPages || page === props.modelValue) return;
  emit('update:modelValue', page);
}

// Glass nav pill — neon halo on hover, dimmed + inert when there's nowhere to go.
const navClass =
  'glass-surface neon-glow inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40';
</script>

<template>
  <nav
    v-if="meta.totalPages > 1"
    aria-label="Projects pagination"
    class="flex items-center justify-between gap-4"
  >
    <button
      type="button"
      :disabled="!meta.hasPrevPage"
      :class="cn(navClass)"
      @click="go(modelValue - 1)"
    >
      <Icon name="lucide:arrow-left" class="size-4" />
      Previous
    </button>

    <p class="glass-surface rounded-full px-4 py-2 font-mono text-sm text-muted-foreground">
      Page <span class="text-foreground">{{ meta.page }}</span>
      <span class="text-muted-foreground/60">/ {{ meta.totalPages }}</span>
    </p>

    <button
      type="button"
      :disabled="!meta.hasNextPage"
      :class="cn(navClass)"
      @click="go(modelValue + 1)"
    >
      Next
      <Icon name="lucide:arrow-right" class="size-4" />
    </button>
  </nav>
</template>

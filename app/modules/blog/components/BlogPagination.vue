<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
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
</script>

<template>
  <nav
    v-if="meta.totalPages > 1"
    aria-label="Blog pagination"
    class="flex items-center justify-between gap-4"
  >
    <button
      type="button"
      :disabled="!meta.hasPrevPage"
      :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-4')"
      @click="go(modelValue - 1)"
    >
      <Icon name="lucide:arrow-left" class="size-4" />
      Previous
    </button>

    <p class="font-mono text-sm text-muted-foreground">
      Page {{ meta.page }}
      <span class="text-muted-foreground/60">/ {{ meta.totalPages }}</span>
    </p>

    <button
      type="button"
      :disabled="!meta.hasNextPage"
      :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-4')"
      @click="go(modelValue + 1)"
    >
      Next
      <Icon name="lucide:arrow-right" class="size-4" />
    </button>
  </nav>
</template>

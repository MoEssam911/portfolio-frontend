<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { Tag } from '~/modules/blog/types';

interface Props {
  /** All selectable tags (deduped by caller). */
  tags: Tag[];
  /** Currently active tag slug, or `null` for "All". */
  modelValue: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>();

function select(slug: string | null) {
  emit('update:modelValue', slug);
}
</script>

<template>
  <div
    v-if="tags.length"
    role="group"
    aria-label="Filter posts by tag"
    class="flex flex-wrap items-center gap-2"
  >
    <button
      type="button"
      :aria-pressed="props.modelValue === null"
      :class="
        cn(
          'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
          props.modelValue === null
            ? 'border-primary-border bg-primary-muted text-primary'
            : 'border-border bg-card text-muted-foreground hover:border-primary-border hover:text-foreground',
        )
      "
      @click="select(null)"
    >
      All
    </button>
    <button
      v-for="tag in tags"
      :key="tag.id"
      type="button"
      :aria-pressed="props.modelValue === tag.slug"
      :class="
        cn(
          'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
          props.modelValue === tag.slug
            ? 'border-primary-border bg-primary-muted text-primary'
            : 'border-border bg-card text-muted-foreground hover:border-primary-border hover:text-foreground',
        )
      "
      @click="select(tag.slug)"
    >
      {{ tag.name }}
    </button>
  </div>
</template>

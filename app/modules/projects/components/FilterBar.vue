<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  /** All selectable technology tags (deduped, sorted by caller). */
  technologies: string[];
  /** Currently active technology, or `null` for "All". */
  modelValue: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>();

function select(tech: string | null) {
  emit('update:modelValue', tech);
}
</script>

<template>
  <div
    v-if="technologies.length"
    role="group"
    aria-label="Filter projects by technology"
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
      v-for="tech in technologies"
      :key="tech"
      type="button"
      :aria-pressed="props.modelValue === tech"
      :class="
        cn(
          'rounded-full border px-3.5 py-1.5 font-mono text-sm transition-colors',
          props.modelValue === tech
            ? 'border-primary-border bg-primary-muted text-primary'
            : 'border-border bg-card text-muted-foreground hover:border-primary-border hover:text-foreground',
        )
      "
      @click="select(tech)"
    >
      {{ tech }}
    </button>
  </div>
</template>

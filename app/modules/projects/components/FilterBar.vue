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

// Shared chip recipe — neon-lit fill when active, quiet glass when not.
function chipClass(active: boolean): string {
  return cn(
    'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
    active
      ? 'bg-primary text-primary-foreground shadow-[var(--shadow-neon-soft)]'
      : 'text-muted-foreground hover:bg-glass-strong hover:text-foreground',
  );
}
</script>

<template>
  <div
    v-if="technologies.length"
    role="group"
    aria-label="Filter projects by technology"
    class="glass-surface scrollbar-none flex flex-nowrap items-center gap-1.5 overflow-x-auto rounded-full p-1.5"
  >
    <button
      type="button"
      :aria-pressed="props.modelValue === null"
      :class="chipClass(props.modelValue === null)"
      @click="select(null)"
    >
      All
    </button>
    <button
      v-for="tech in technologies"
      :key="tech"
      type="button"
      :aria-pressed="props.modelValue === tech"
      :class="cn(chipClass(props.modelValue === tech), 'font-mono')"
      @click="select(tech)"
    >
      {{ tech }}
    </button>
  </div>
</template>

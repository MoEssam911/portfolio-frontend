<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  tags: string[];
  modelValue: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>();

function select(tag: string | null) {
  emit('update:modelValue', tag);
}

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
    v-if="tags.length"
    role="group"
    aria-label="Filter posts by topic"
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
      v-for="tag in tags"
      :key="tag"
      type="button"
      :aria-pressed="props.modelValue === tag"
      :class="cn(chipClass(props.modelValue === tag), 'font-mono')"
      @click="select(tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>

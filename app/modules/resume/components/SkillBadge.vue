<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  /** Skill / tool name. */
  label: string;
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <span
    :class="
      cn(
        'glass-surface neon-glow inline-flex rounded-lg px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary-light',
        props.class,
      )
    "
  >
    {{ label }}
  </span>
</template>

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
        'inline-flex rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground',
        props.class,
      )
    "
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

/**
 * EmptyState — the calm "nothing here yet" panel used across the dashboard
 * (empty lists, empty search results, empty tables). Drop a primary action into
 * the default slot (e.g. a "New project" button).
 *
 *   <EmptyState icon="lucide:folder-git-2" title="No projects yet"
 *     description="Create your first project to get started.">
 *     <Button>New project</Button>
 *   </EmptyState>
 */
withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description?: string;
    /** Tighter padding for use inside a table body. */
    compact?: boolean;
  }>(),
  { icon: 'lucide:inbox', compact: false },
);
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-6 py-12' : 'gap-3 px-6 py-16',
      )
    "
  >
    <div
      class="flex size-11 items-center justify-center rounded-xl border border-border bg-muted/40"
    >
      <Icon :name="icon" class="size-5 text-muted-foreground" />
    </div>
    <div class="flex flex-col gap-1">
      <p class="font-display text-base text-foreground">{{ title }}</p>
      <p v-if="description" class="mx-auto max-w-sm text-sm text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.default" class="mt-2">
      <slot />
    </div>
  </div>
</template>

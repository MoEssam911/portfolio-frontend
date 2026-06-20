<script setup lang="ts">
/**
 * PageHeader — the title block at the top of every dashboard page. Title +
 * optional description on the left; a primary action in the `#actions` slot on
 * the right (collapses below the title on mobile).
 *
 *   <PageHeader title="Projects" description="Manage your case studies.">
 *     <template #actions><Button>New project</Button></template>
 *   </PageHeader>
 */
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex min-w-0 flex-col gap-1">
      <h1 class="font-display text-2xl tracking-tight text-foreground">{{ title }}</h1>
      <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

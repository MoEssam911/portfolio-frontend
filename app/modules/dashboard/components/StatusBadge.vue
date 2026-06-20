<script setup lang="ts">
import { Badge } from '@/components/ui/badge';

/**
 * StatusBadge — the published/draft pill used in every resource table. Also
 * accepts arbitrary tone/label via props for one-off statuses (e.g. "Featured").
 *
 *   <StatusBadge :published="row.published" />
 *   <StatusBadge tone="info" label="Featured" icon="lucide:star" />
 */
const props = withDefaults(
  defineProps<{
    /** When provided, drives the published(success)/draft(neutral) preset. */
    published?: boolean;
    /** Override label text. Defaults to "Published"/"Draft" from `published`. */
    label?: string;
    /** Visual tone. Inferred from `published` when omitted. */
    tone?: 'success' | 'neutral' | 'info' | 'warning';
    /** Optional leading icon. */
    icon?: string;
  }>(),
  { published: undefined },
);

const resolvedTone = computed(() => props.tone ?? (props.published ? 'success' : 'neutral'));

const resolvedLabel = computed(() => props.label ?? (props.published ? 'Published' : 'Draft'));

const toneClass = computed(
  () =>
    ({
      success: 'border-success/25 bg-success-muted text-success-muted-foreground',
      neutral: 'border-border bg-muted text-muted-foreground',
      info: 'border-primary-border bg-primary-muted text-primary',
      warning: 'border-warning/25 bg-warning-muted text-warning-muted-foreground',
    })[resolvedTone.value],
);

const dotClass = computed(
  () =>
    ({
      success: 'bg-success',
      neutral: 'bg-muted-foreground/60',
      info: 'bg-primary',
      warning: 'bg-warning',
    })[resolvedTone.value],
);
</script>

<template>
  <Badge variant="outline" :class="toneClass">
    <Icon v-if="icon" :name="icon" />
    <span v-else class="size-1.5 rounded-full" :class="dotClass" aria-hidden="true" />
    {{ resolvedLabel }}
  </Badge>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { Service } from '~/modules/services/types';

interface Props {
  service: Service;
  class?: string;
}

const props = defineProps<Props>();

// Backend stores an icon name (e.g. a lucide id); fall back to a sensible default.
const iconName = computed(() => props.service.icon || 'lucide:sparkles');
</script>

<template>
  <div
    :class="
      cn(
        'group relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary-border',
        props.class,
      )
    "
  >
    <div
      class="inline-flex size-11 items-center justify-center rounded-xl border border-primary-border bg-primary-subtle text-primary transition-colors group-hover:bg-primary-muted"
    >
      <Icon :name="iconName" class="size-5" />
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-display text-lg font-semibold text-foreground">{{ service.title }}</h3>
      <p class="text-pretty text-sm leading-relaxed text-muted-foreground">
        {{ service.description }}
      </p>
    </div>

    <p
      v-if="service.priceRange"
      class="mt-auto pt-2 font-mono text-sm text-foreground"
    >
      {{ service.priceRange }}
    </p>
  </div>
</template>

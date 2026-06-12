<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { TimelineEntry } from '~/modules/resume/types';

interface Props {
  entry: TimelineEntry;
  /** Hide the connecting line below the last node. */
  last?: boolean;
}

const props = defineProps<Props>();

const { formatDate } = useFormatters();

const range = computed(() => {
  const e = props.entry;
  const start = e.start ? formatDate(e.start, 'MMM YYYY') : '';
  const end = e.current ? 'Present' : e.end ? formatDate(e.end, 'MMM YYYY') : '';
  return [start, end].filter(Boolean).join(' — ');
});
</script>

<template>
  <div class="relative flex gap-5 sm:gap-6">
    <!-- Node + connecting line -->
    <div class="relative flex flex-col items-center">
      <span
        :class="
          cn(
            'relative z-10 mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-background',
            entry.current ? 'bg-primary shadow-glow' : 'bg-border',
          )
        "
        aria-hidden="true"
      />
      <span
        v-if="!last"
        class="absolute top-1.5 left-1/2 z-0 h-full w-px -translate-x-1/2 bg-border"
        aria-hidden="true"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 pb-10">
      <p class="font-mono text-xs text-muted-foreground">
        {{ range }}
        <span v-if="entry.current" class="ml-1 text-primary">• Current</span>
      </p>
      <h3 class="mt-2 font-display text-lg text-foreground">{{ entry.title }}</h3>
      <p class="mt-0.5 text-sm text-muted-foreground">
        <span class="text-foreground/90">{{ entry.org }}</span>
        <template v-if="entry.meta">
          <span class="px-1.5 text-border">/</span>{{ entry.meta }}
        </template>
        <template v-if="entry.location">
          <span class="px-1.5 text-border">·</span>{{ entry.location }}
        </template>
      </p>

      <ul v-if="entry.bullets.length" class="mt-3 flex flex-col gap-1.5">
        <li
          v-for="(bullet, i) in entry.bullets"
          :key="i"
          class="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
        >
          <Icon name="lucide:minus" class="mt-1.5 size-3 shrink-0 text-primary/60" />
          <span>{{ bullet }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

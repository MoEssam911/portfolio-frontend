<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  markOnly?: boolean;
  label?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  markOnly: false,
  label: 'Mohamed Essam',
});

const markSize: Record<NonNullable<Props['size']>, string> = {
  sm: 'size-5',
  md: 'size-7',
  lg: 'size-9',
};

const wordmarkSize: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};
</script>

<template>
  <!-- Variant 4: Abstract diamond/gem mark + wordmark.
       A flat-style gem facet with a violet fill and white inner lines.
       More distinctive and memorable — works as a standalone icon mark. -->
  <span :class="cn('inline-flex items-center gap-2.5', props.class)">
    <svg
      :class="cn('shrink-0', markSize[size])"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gem-grad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#A78BFA" />
          <stop offset="100%" stop-color="#6D28D9" />
        </linearGradient>
      </defs>
      <!-- Outer diamond shape -->
      <path d="M16 2L30 12L16 30L2 12Z" fill="url(#gem-grad)" />
      <!-- Top facet row divider -->
      <path d="M2 12H30" stroke="rgba(255,255,255,0.35)" stroke-width="1" />
      <!-- Left top facet -->
      <path d="M2 12L16 2" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
      <!-- Right top facet -->
      <path d="M30 12L16 2" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
      <!-- Center spine -->
      <path d="M16 2L16 30" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
    </svg>
    <span
      v-if="!markOnly"
      :class="cn('font-display font-semibold tracking-tight text-foreground', wordmarkSize[size])"
    >
      {{ label }}
    </span>
  </span>
</template>

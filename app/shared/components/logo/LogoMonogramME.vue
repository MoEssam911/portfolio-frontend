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
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
};

const wordmarkSize: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};
</script>

<template>
  <!-- Variant 2: Geometric "ME" two-letter monogram.
       Bold M + E with a violet-to-purple gradient fill, separated by a
       hairline slash. Wider mark than the single-M variant. -->
  <span :class="cn('inline-flex items-center gap-2.5', props.class)">
    <svg
      :class="cn('shrink-0', markSize[size])"
      viewBox="0 0 52 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="me-grad" x1="0" y1="0" x2="52" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#6D28D9" />
        </linearGradient>
      </defs>
      <rect width="52" height="32" rx="7" fill="url(#me-grad)" />
      <!-- M -->
      <path
        d="M7 23V11L13.5 18L20 11V23"
        stroke="white"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <!-- Separator slash -->
      <line x1="26" y1="9" x2="26" y2="23" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
      <!-- E -->
      <path
        d="M30 11H43M30 11V23M30 11L30 23M30 23H43M30 17H40"
        stroke="white"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
    <span
      v-if="!markOnly"
      :class="cn('font-display font-semibold tracking-tight text-foreground', wordmarkSize[size])"
    >
      {{ label }}
    </span>
  </span>
</template>

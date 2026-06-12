<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  /** Size preset — `sm` reads cleanly down to favicon scale. */
  size?: 'sm' | 'md' | 'lg';
  /** Render the mark only, without the wordmark. */
  markOnly?: boolean;
  /** Wordmark text. Defaults to the owner's name. */
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
  <span :class="cn('inline-flex items-center gap-2.5', props.class)">
    <!-- Geometric monogram: violet rounded square + stroked “M”. Two colors max,
         no gradients/shadows, legible at 16px. -->
    <svg
      :class="cn('shrink-0 text-primary', markSize[size])"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 23V11L16 18L23 11V23"
        stroke="white"
        stroke-width="2.5"
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

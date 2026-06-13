<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  /** Suppress the wordmark — only the mark is rendered. */
  markOnly?: boolean;
  /** Wordmark text. Only shown when markOnly is false and no src is provided. */
  label?: string;
  /**
   * Drop-in custom logo. Provide a path to an SVG or PNG placed in /public
   * (e.g. src="/logo.svg"). When set, this image replaces the built-in mark.
   * Prefer SVG — it scales without quality loss and works as favicon source.
   */
  src?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  markOnly: false,
  label: 'Mohamed Essam',
});

const heightClass: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-6',
  md: 'h-7',
  lg: 'h-9',
};

const wordmarkSize: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};
</script>

<template>
  <span :class="cn('inline-flex items-center gap-2.5', props.class)">
    <!-- Custom logo override: place your file in /public and pass src="/logo.svg" -->
    <img
      v-if="src"
      :src="src"
      alt=""
      :class="cn('shrink-0 object-contain', heightClass[size])"
      aria-hidden="true"
    />

    <!-- Built-in mark: <ME /> code-tag identity -->
    <svg
      v-else
      :class="cn('shrink-0', heightClass[size])"
      viewBox="0 0 68 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- < -->
      <path
        d="M8 9L3 16L8 23"
        stroke="var(--color-muted-foreground)"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- M -->
      <path
        d="M14 22V12L20 18.5L26 12V22"
        stroke="var(--color-primary)"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <!-- E -->
      <path
        d="M30 12H41M30 12V22M30 22H41M30 17H38"
        stroke="var(--color-primary)"
        stroke-width="2.2"
        stroke-linecap="round"
        fill="none"
      />
      <!-- / -->
      <path
        d="M46 22L51 10"
        stroke="var(--color-muted-foreground)"
        stroke-width="2"
        stroke-linecap="round"
      />
      <!-- > -->
      <path
        d="M55 9L60 16L55 23"
        stroke="var(--color-muted-foreground)"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <span
      v-if="!markOnly && !src"
      :class="cn('font-display font-semibold tracking-tight text-foreground', wordmarkSize[size])"
    >
      {{ label }}
    </span>
  </span>
</template>

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
  <!-- Variant 3: Code-tag identity — <ME /> in monospace style.
       Angled brackets in muted color, letters in violet, trailing slash in
       muted-foreground. Leans into the developer identity. -->
  <span :class="cn('inline-flex items-center gap-2.5', props.class)">
    <svg
      :class="cn('shrink-0', markSize[size])"
      viewBox="0 0 68 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- Opening bracket < -->
      <path
        d="M8 9L3 16L8 23"
        stroke="#52525b"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- M -->
      <path
        d="M14 22V12L20 18.5L26 12V22"
        stroke="#8B5CF6"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <!-- E -->
      <path
        d="M30 12H41M30 12V22M30 22H41M30 17H38"
        stroke="#8B5CF6"
        stroke-width="2.2"
        stroke-linecap="round"
        fill="none"
      />
      <!-- Slash / -->
      <path d="M46 22L51 10" stroke="#52525b" stroke-width="2" stroke-linecap="round" />
      <!-- Closing bracket > -->
      <path
        d="M55 9L60 16L55 23"
        stroke="#52525b"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
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

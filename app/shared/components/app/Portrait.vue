<script setup lang="ts">
// Central portrait — NuxtImg serves optimized sizes from /public.
import { cn } from '@/lib/utils';

interface Props {
  alt?: string;
  class?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Responsive sizes hint for NuxtImg / IPX. */
  sizes?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Portrait of Mohamed Essam',
  loading: 'lazy',
  fetchPriority: 'auto',
  sizes: '160px',
});
</script>

<template>
  <NuxtImg
    src="/images/avatar.webp"
    :alt="props.alt"
    :class="cn('h-full w-full object-cover', props.class)"
    :loading="props.loading"
    :fetchpriority="props.fetchPriority"
    format="webp"
    quality="65"
    :widths="[160, 224, 320]"
    :sizes="props.sizes"
    width="320"
    height="400"
  />
</template>

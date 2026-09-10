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
  // Featured / about-scale default; pass a tighter sizes hint for small teasers.
  sizes: '(max-width: 640px) 80vw, 384px',
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
    quality="85"
    :widths="[320, 480, 640, 768]"
    :sizes="props.sizes"
    width="640"
    height="800"
  />
</template>

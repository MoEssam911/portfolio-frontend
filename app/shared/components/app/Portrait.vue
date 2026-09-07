<script setup lang="ts">
// Central portrait asset — swap the import below to change every usage at once.
// Keep the rounded frame + lime ring/glow that callers apply via `class`.
import { cn } from '@/lib/utils';
import portraitPlaceholder from '~/assets/images/avatar.webp';

interface Props {
  alt?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Portrait of Mohamed Essam',
});
</script>

<template>
  <img
    :src="portraitPlaceholder"
    :alt="alt"
    :class="cn('h-full w-full object-cover', props.class)"
    loading="lazy"
    decoding="async"
    width="600"
    height="800"
  />
</template>

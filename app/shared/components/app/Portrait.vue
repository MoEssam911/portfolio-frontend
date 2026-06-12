<script setup lang="ts">
// PHOTO SWAP: this component centralises the portrait so every usage swaps at once.
// When the real professional portrait is ready, replace the import below with the
// real asset (e.g. `~/assets/images/portrait.jpg`). Keep the rounded frame + violet
// ring/glow that callers apply via `class`. Do NOT duotone it.
import { cn } from '@/lib/utils';
import portraitPlaceholder from '~/assets/images/portrait-placeholder.svg';

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

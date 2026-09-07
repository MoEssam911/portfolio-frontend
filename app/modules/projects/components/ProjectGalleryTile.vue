<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  src: string;
  index: number;
  /** First tile spans full width on >=sm when the gallery has more than one image. */
  wide?: boolean;
  class?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ open: [index: number] }>();

// Gentle pointer parallax on the tile cover — translate-only (see useParallax).
const tileRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);
useParallax(tileRef, imageRef, { strength: 12 });
</script>

<template>
  <button
    ref="tileRef"
    type="button"
    :class="
      cn(
        'glass-surface neon-glow group relative overflow-hidden rounded-2xl',
        wide ? 'sm:col-span-2' : '',
        props.class,
      )
    "
    @click="emit('open', index)"
  >
    <img
      ref="imageRef"
      :src="src"
      :alt="`Gallery image ${index + 1}`"
      class="aspect-16/10 w-full scale-105 object-cover transition-transform duration-500 ease-out"
      loading="lazy"
      decoding="async"
    />
    <span
      class="glass-surface-strong pointer-events-none absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
    >
      <Icon name="lucide:maximize-2" class="size-4" />
    </span>
  </button>
</template>

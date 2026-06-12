<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  /** Eyebrow label (uppercase, violet). */
  eyebrow?: string;
  /** Page title (display font, fluid). */
  title: string;
  /** Supporting description under the title. */
  description?: string;
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <header :class="cn('relative overflow-hidden border-b border-border', props.class)">
    <!-- Subtle violet bloom from top — decorative, GPU-cheap. -->
    <div class="bg-hero-glow pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
    <Container class="py-16 sm:py-24">
      <p v-if="eyebrow" class="label text-primary">{{ eyebrow }}</p>
      <h1 class="mt-3 max-w-4xl text-balance font-display text-4xl text-foreground sm:text-5xl lg:text-6xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
        {{ description }}
      </p>
    </Container>
  </header>
</template>

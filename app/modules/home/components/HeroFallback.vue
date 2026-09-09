<script setup lang="ts">
// SSR-safe hero backdrop — soft lime wash + faint grid. No CSS blur filters
// (those dominate mobile style/paint time and tank LCP).
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="cn('hero-fallback pointer-events-none absolute inset-0 overflow-hidden', props.class)"
    aria-hidden="true"
  >
    <div class="hero-fallback__glow" />
    <div class="hero-fallback__grid" />
    <div class="hero-fallback__fade" />
  </div>
</template>

<style scoped>
.hero-fallback__glow {
  position: absolute;
  inset: 0;
  background: var(--gradient-hero);
}

.hero-fallback__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--lime-subtle) 1px, transparent 1px),
    linear-gradient(to bottom, var(--lime-subtle) 1px, transparent 1px);
  background-size: 58px 58px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, var(--black) 0%, transparent 80%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, var(--black) 0%, transparent 80%);
  opacity: 0.45;
}

.hero-fallback__fade {
  position: absolute;
  inset: 0;
  background: var(--gradient-fade-bottom);
}
</style>

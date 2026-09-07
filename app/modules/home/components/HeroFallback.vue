<script setup lang="ts">
// Lightweight, SSR-safe hero backdrop — the standin for the WebGL scene on
// mobile, reduced-motion, or no-WebGL. Pre-blurred neon-lime blobs (translated
// only, so the blur rasterises once and composites cheaply), a masked precision
// grid, and a bottom fade into the page background. Drift is compositor-only and
// disabled under prefers-reduced-motion via the media query below.
import { usePreferredReducedMotion } from '@vueuse/core';

import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

// SSR-safe: 'no-preference' | 'reduce'. Drift only when motion is allowed.
const preferredMotion = usePreferredReducedMotion();
const animated = computed(() => preferredMotion.value === 'no-preference');
</script>

<template>
  <div
    :class="cn('hero-fallback pointer-events-none absolute inset-0 overflow-hidden', props.class)"
    :data-animated="animated"
    aria-hidden="true"
  >
    <span class="hero-fallback__blob hero-fallback__blob--one" />
    <span class="hero-fallback__blob hero-fallback__blob--two" />
    <span class="hero-fallback__blob hero-fallback__blob--three" />

    <div class="hero-fallback__grid" />
    <div class="hero-fallback__glow" />
    <div class="hero-fallback__fade" />
  </div>
</template>

<style scoped>
.hero-fallback__blob {
  position: absolute;
  display: block;
  border-radius: var(--radius-full);
  filter: blur(80px);
  will-change: transform;
}

.hero-fallback__blob--one {
  top: -14%;
  left: -6%;
  width: 36rem;
  height: 36rem;
  background: radial-gradient(circle at center, var(--lime-500) 0%, transparent 68%);
  opacity: 0.14;
}

.hero-fallback__blob--two {
  top: -4%;
  right: -10%;
  width: 30rem;
  height: 30rem;
  background: radial-gradient(circle at center, var(--lime-800) 0%, transparent 70%);
  opacity: 0.16;
}

.hero-fallback__blob--three {
  bottom: -20%;
  left: 30%;
  width: 28rem;
  height: 28rem;
  background: radial-gradient(circle at center, var(--lime-300) 0%, transparent 72%);
  opacity: 0.1;
}

/* Faint precision grid, masked to fade toward the edges. */
.hero-fallback__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--lime-subtle) 1px, transparent 1px),
    linear-gradient(to bottom, var(--lime-subtle) 1px, transparent 1px);
  background-size: 58px 58px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, var(--black) 0%, transparent 80%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, var(--black) 0%, transparent 80%);
  opacity: 0.5;
}

/* Top-center neon bloom, matching the WebGL scene's mood. */
.hero-fallback__glow {
  position: absolute;
  inset: 0;
  background: var(--gradient-hero);
}

.hero-fallback__fade {
  position: absolute;
  inset: 0;
  background: var(--gradient-fade-bottom);
}

/* Drift only when motion is allowed — transform-only keeps it on the compositor. */
.hero-fallback[data-animated='true'] .hero-fallback__blob--one {
  animation: hero-drift-one 24s var(--ease-in-out) infinite alternate;
}
.hero-fallback[data-animated='true'] .hero-fallback__blob--two {
  animation: hero-drift-two 28s var(--ease-in-out) infinite alternate;
}
.hero-fallback[data-animated='true'] .hero-fallback__blob--three {
  animation: hero-drift-three 32s var(--ease-in-out) infinite alternate;
}

@keyframes hero-drift-one {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(7%, 5%, 0) scale(1.12);
  }
}
@keyframes hero-drift-two {
  from {
    transform: translate3d(0, 0, 0) scale(1.04);
  }
  to {
    transform: translate3d(-6%, 8%, 0) scale(0.96);
  }
}
@keyframes hero-drift-three {
  from {
    transform: translate3d(0, 0, 0) scale(0.96);
  }
  to {
    transform: translate3d(5%, -7%, 0) scale(1.14);
  }
}

/* Mobile perf — lighter blur radius on the large blobs (fill-rate on phones). */
@media (max-width: 640px) {
  .hero-fallback__blob {
    filter: blur(48px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-fallback__blob {
    animation: none !important;
  }
}
</style>

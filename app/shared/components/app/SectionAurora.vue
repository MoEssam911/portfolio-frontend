<script setup lang="ts">
// Faint ambient backdrop for glass panels — a couple of pre-blurred neon-lime
// blobs over a masked precision grid. Translate-only drift (rasterises once,
// composites cheaply) and disabled under reduced motion. SSR-safe, decorative.
import { usePreferredReducedMotion } from '@vueuse/core';

import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const preferredMotion = usePreferredReducedMotion();
const animated = computed(() => preferredMotion.value === 'no-preference');
</script>

<template>
  <div
    :class="cn('section-aurora pointer-events-none absolute inset-0 overflow-hidden', props.class)"
    :data-animated="animated"
    aria-hidden="true"
  >
    <span class="section-aurora__blob section-aurora__blob--one" />
    <span class="section-aurora__blob section-aurora__blob--two" />
    <div class="section-aurora__grid" />
  </div>
</template>

<style scoped>
.section-aurora__blob {
  position: absolute;
  display: block;
  border-radius: var(--radius-full);
  filter: blur(72px);
  will-change: transform;
}

.section-aurora__blob--one {
  top: -30%;
  left: -8%;
  width: 26rem;
  height: 26rem;
  background: radial-gradient(circle at center, var(--lime-500) 0%, transparent 68%);
  opacity: 0.1;
}

.section-aurora__blob--two {
  right: -10%;
  bottom: -34%;
  width: 24rem;
  height: 24rem;
  background: radial-gradient(circle at center, var(--lime-800) 0%, transparent 70%);
  opacity: 0.12;
}

/* Faint precision grid, masked to fade toward the edges. */
.section-aurora__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--lime-subtle) 1px, transparent 1px),
    linear-gradient(to bottom, var(--lime-subtle) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, var(--black) 0%, transparent 78%);
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, var(--black) 0%, transparent 78%);
  opacity: 0.4;
}

.section-aurora[data-animated='true'] .section-aurora__blob--one {
  animation: section-drift-one 26s var(--ease-in-out) infinite alternate;
}
.section-aurora[data-animated='true'] .section-aurora__blob--two {
  animation: section-drift-two 30s var(--ease-in-out) infinite alternate;
}

@keyframes section-drift-one {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(8%, 6%, 0) scale(1.12);
  }
}
@keyframes section-drift-two {
  from {
    transform: translate3d(0, 0, 0) scale(1.05);
  }
  to {
    transform: translate3d(-7%, -8%, 0) scale(0.95);
  }
}

/* Mobile perf — lighter blur radius on the large blobs (fill-rate on phones). */
@media (max-width: 640px) {
  .section-aurora__blob {
    filter: blur(44px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .section-aurora__blob {
    animation: none !important;
  }
}
</style>

<script setup lang="ts">
// Inspira-style signature background — a slow violet aurora tuned to the
// "Precision" token palette. GPU-friendly: only blurred layers are *translated*
// (transform/opacity), so the expensive blur rasterises once and is composited
// each frame. Fully disabled under prefers-reduced-motion.
import { usePreferredReducedMotion } from '@vueuse/core';

import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

// @vueuse: SSR-safe, 'no-preference' | 'reduce'. Animate only when motion is allowed.
const preferredMotion = usePreferredReducedMotion();
const animated = computed(() => preferredMotion.value === 'no-preference');
</script>

<template>
  <div
    :class="cn('aurora pointer-events-none absolute inset-0 overflow-hidden', props.class)"
    :data-animated="animated"
    aria-hidden="true"
  >
    <!-- Drifting violet blobs. Pre-blurred layers, only translated. -->
    <span class="aurora__blob aurora__blob--one" />
    <span class="aurora__blob aurora__blob--two" />
    <span class="aurora__blob aurora__blob--three" />

    <!-- Faint precision grid for the "from the future" read. -->
    <div class="aurora__grid" />

    <!-- Bottom fade so the effect dissolves into the page background. -->
    <div class="aurora__fade" />
  </div>
</template>

<style scoped>
.aurora__blob {
  position: absolute;
  display: block;
  border-radius: var(--radius-full);
  filter: blur(72px);
  opacity: 0.5;
  will-change: transform;
}

.aurora__blob--one {
  top: -12%;
  left: -8%;
  width: 38rem;
  height: 38rem;
  background: radial-gradient(circle at center, var(--violet-500) 0%, transparent 68%);
  opacity: 0.32;
}

.aurora__blob--two {
  top: -6%;
  right: -10%;
  width: 32rem;
  height: 32rem;
  background: radial-gradient(circle at center, var(--violet-700) 0%, transparent 70%);
  opacity: 0.28;
}

.aurora__blob--three {
  bottom: -18%;
  left: 28%;
  width: 30rem;
  height: 30rem;
  background: radial-gradient(circle at center, var(--violet-400) 0%, transparent 72%);
  opacity: 0.2;
}

/* Subtle precision grid — masked to fade toward the edges. */
.aurora__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--violet-subtle) 1px, transparent 1px),
    linear-gradient(to bottom, var(--violet-subtle) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, var(--black) 0%, transparent 80%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, var(--black) 0%, transparent 80%);
  opacity: 0.6;
}

.aurora__fade {
  position: absolute;
  inset: 0;
  background: var(--gradient-fade-bottom);
}

/* Drift only when motion is allowed. Transform-only keyframes keep it on the
   compositor; the static positions above are the reduced-motion fallback. */
.aurora[data-animated='true'] .aurora__blob--one {
  animation: aurora-drift-one 22s var(--ease-in-out) infinite alternate;
}
.aurora[data-animated='true'] .aurora__blob--two {
  animation: aurora-drift-two 26s var(--ease-in-out) infinite alternate;
}
.aurora[data-animated='true'] .aurora__blob--three {
  animation: aurora-drift-three 30s var(--ease-in-out) infinite alternate;
}

@keyframes aurora-drift-one {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(8%, 6%, 0) scale(1.12);
  }
}
@keyframes aurora-drift-two {
  from {
    transform: translate3d(0, 0, 0) scale(1.05);
  }
  to {
    transform: translate3d(-7%, 9%, 0) scale(0.95);
  }
}
@keyframes aurora-drift-three {
  from {
    transform: translate3d(0, 0, 0) scale(0.95);
  }
  to {
    transform: translate3d(6%, -8%, 0) scale(1.15);
  }
}

/* Belt-and-braces: honour reduced motion even before the JS ref resolves. */
@media (prefers-reduced-motion: reduce) {
  .aurora .aurora__blob {
    animation: none !important;
  }
}
</style>

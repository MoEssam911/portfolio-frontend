<script setup lang="ts">
// Faint ambient backdrop for glass panels — lime wash + grid, no CSS blur.
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="cn('section-aurora pointer-events-none absolute inset-0 overflow-hidden', props.class)"
    aria-hidden="true"
  >
    <div class="section-aurora__glow" />
    <div class="section-aurora__grid" />
  </div>
</template>

<style scoped>
.section-aurora__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 20% 20%, var(--lime-glow), transparent 70%),
    radial-gradient(ellipse 50% 45% at 85% 80%, color-mix(in oklab, var(--lime-800) 35%, transparent), transparent 70%);
}

.section-aurora__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--lime-subtle) 1px, transparent 1px),
    linear-gradient(to bottom, var(--lime-subtle) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, var(--black) 0%, transparent 78%);
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, var(--black) 0%, transparent 78%);
  opacity: 0.35;
}
</style>

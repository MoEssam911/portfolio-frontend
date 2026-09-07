<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core';

import { Skeleton } from '@/components/ui/skeleton';

const { pending, error, featuredTestimonials } = useTestimonials();

// Only featured testimonials surface on the home page.
const visibleTestimonials = computed(() => featuredTestimonials.value);

// Duplicate the list so the auto-scroll can wrap around seamlessly.
const loopItems = computed(() =>
  visibleTestimonials.value.length
    ? [...visibleTestimonials.value, ...visibleTestimonials.value]
    : [],
);

// ── Auto / draggable marquee ───────────────────────────────────────────────
// A horizontally scrollable track that drifts on its own, pauses on hover, and
// can be grabbed and dragged. Reduced motion → no auto-drift (still scrollable).
const preferredMotion = usePreferredReducedMotion();
const reduced = computed(() => preferredMotion.value === 'reduce');

const track = ref<HTMLElement | null>(null);
const SPEED = 0.4; // px per frame
let raf = 0;
const paused = ref(false);
let dragging = false;
let startX = 0;
let startScroll = 0;

/** Keep scrollLeft within the first copy so the loop never hits a hard edge. */
function normalize(el: HTMLElement) {
  const half = el.scrollWidth / 2;
  if (half <= 0) return;
  if (el.scrollLeft >= half) el.scrollLeft -= half;
  else if (el.scrollLeft < 0) el.scrollLeft += half;
}

function tick() {
  const el = track.value;
  if (el && !paused.value && !dragging) {
    el.scrollLeft += SPEED;
    normalize(el);
  }
  raf = requestAnimationFrame(tick);
}

function onPointerDown(e: PointerEvent) {
  const el = track.value;
  if (!el) return;
  dragging = true;
  startX = e.clientX;
  startScroll = el.scrollLeft;
  el.setPointerCapture(e.pointerId);
}
function onPointerMove(e: PointerEvent) {
  const el = track.value;
  if (!el || !dragging) return;
  el.scrollLeft = startScroll - (e.clientX - startX);
}
function onPointerUp(e: PointerEvent) {
  const el = track.value;
  if (!el) return;
  dragging = false;
  try {
    el.releasePointerCapture(e.pointerId);
  } catch {
    // pointer may already be released — ignore
  }
  normalize(el);
}

onMounted(async () => {
  await nextTick();
  if (reduced.value) return; // native scroll only — no auto-drift
  raf = requestAnimationFrame(tick);
});
onScopeDispose(() => cancelAnimationFrame(raf));
</script>

<template>
  <Section
    label="Social Proof"
    title="What people say"
    description="A few words from people I've built with."
  >
    <!-- Loading -->
    <div
      v-if="pending && featuredTestimonials.length === 0"
      class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Skeleton v-for="n in 3" :key="n" class="h-56 rounded-2xl" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-surface rounded-2xl p-10 text-center">
      <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
      <p class="mt-3 text-sm text-muted-foreground">Couldn't load testimonials right now.</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="visibleTestimonials.length === 0"
      class="glass-surface rounded-2xl border-dashed p-10 text-center"
    >
      <p class="text-sm text-muted-foreground">Kind words coming soon.</p>
    </div>

    <!-- Populated — auto / draggable marquee -->
    <div v-else class="marquee-mask -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12">
      <ul
        ref="track"
        class="marquee flex cursor-grab gap-5 overflow-x-auto pb-2 select-none active:cursor-grabbing"
        @pointerenter="paused = true"
        @pointerleave="paused = false"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <li
          v-for="(testimonial, i) in loopItems"
          :key="`${testimonial.name}-${i}`"
          class="w-80 shrink-0 sm:w-96"
          :aria-hidden="i >= visibleTestimonials.length"
        >
          <TestimonialCard :testimonial="testimonial" />
        </li>
      </ul>
    </div>
  </Section>
</template>

<style scoped>
/* Hide the native scrollbar — the track is driven by drift + drag. */
.marquee {
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-y; /* let vertical page scroll through; drag handles X */
}
.marquee::-webkit-scrollbar {
  display: none;
}

/* Fade the track edges so cards dissolve in/out of the rail. */
.marquee-mask {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    var(--black) 4%,
    var(--black) 96%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0,
    var(--black) 4%,
    var(--black) 96%,
    transparent 100%
  );
}
</style>

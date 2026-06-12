<script setup lang="ts">
// Thin fixed bar at the top of the viewport showing how far through the page
// the reader has scrolled. Pure transform/opacity, cheap on the main thread.
const progress = ref(0);

function update() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  progress.value = scrollable > 0 ? Math.min(1, Math.max(0, doc.scrollTop / scrollable)) : 0;
}

onMounted(() => {
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', update);
  window.removeEventListener('resize', update);
});
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    role="progressbar"
    aria-label="Reading progress"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="h-full origin-left bg-primary shadow-glow"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>

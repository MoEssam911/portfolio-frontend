<script setup lang="ts">
// Standalone auth shell — no public header/footer/nav. Centers a single card
// (the login form) on a plain dashboard background.
</script>

<template>
  <div
    class="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-hero-glow"
      aria-hidden="true"
    />
    <main class="w-full max-w-sm">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// `useSettings()` is a layout concern — fetch it once here and provide it so the
// header, footer, and pages share a single request (see useSiteSettings).
const { data: settings, pending } = useSettings();
provideSiteSettings({ settings, pending });
</script>

<template>
  <div class="relative flex min-h-dvh flex-col">
    <a
      href="#main"
      class="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
    >
      Skip to content
    </a>

    <!-- Hero gradient backdrop — subtle violet bloom from the top. Decorative,
         non-interactive, sits behind all content. Pages can layer their own
         effects on top (e.g. the Phase 1 hero). -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-hero-glow"
      aria-hidden="true"
    />

    <AppHeader />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

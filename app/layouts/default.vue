<script setup lang="ts">
// Settings are loaded once in the layout and provided (see useSiteSettings).
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

    <!-- Hero gradient backdrop — subtle neon-lime bloom from the top. Decorative,
         non-interactive, sits behind all content (and behind the floating glass
         nav). Pages can layer their own effects on top. -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-hero-glow"
      aria-hidden="true"
    />

    <AppHeader />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <AppFooter />

    <!-- Netlify Forms bot detection -->
    <form name="contact" netlify hidden>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <input type="text" name="subject" />
      <textarea name="message"></textarea>
    </form>
  </div>
</template>

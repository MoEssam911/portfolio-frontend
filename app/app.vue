<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';

import { TooltipProvider } from '@/components/ui/tooltip';

// LTR, English. Dark is the only theme — it lives in :root, so we never add a
// `.dark` class here. See app/assets/css/tokens.css.
// Fonts are self-hosted via @nuxt/fonts (see nuxt.config.ts) — no external
// font stylesheet links here.
const config = useRuntimeConfig();
const url = useRequestURL();
const route = useRoute();

const appName = config.public.appName as string;

// Canonical is centralised here for every route (path-based) so individual pages
// never need to set it — a single source of truth avoids duplicate <link> tags.
const canonical = computed(() => `${url.origin}${route.path}`);

useHead({
  htmlAttrs: {
    lang: 'en',
    dir: 'ltr',
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'canonical', href: canonical },
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: `${appName} — Blog`,
      href: '/feed.xml',
    },
  ],
});

// Site-wide SEO defaults. Pages override title/description/image via useSeo or
// useSeoMeta; anything they don't set falls back to these.
useSeoMeta({
  ogSiteName: appName,
  ogType: 'website',
  ogLocale: 'en_US',
  ogImage: absoluteUrl(DEFAULT_OG_IMAGE, url.origin),
  twitterCard: 'summary_large_image',
  twitterImage: absoluteUrl(DEFAULT_OG_IMAGE, url.origin),
  themeColor: '#0a0a0b',
});
</script>

<template>
  <!-- ConfigProvider propagates text direction (LTR) to all reka-ui primitives,
       including portalled overlays (Dialog/Sheet/Popover/Select/Tooltip). -->
  <ConfigProvider dir="ltr">
    <TooltipProvider :delay-duration="200">
      <NuxtLoadingIndicator
        color="var(--color-primary)"
        :height="2"
        :duration="3000"
        :throttle="200"
      />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <!-- Global overlays: toasts (vue-sonner) + headless confirm dialog host +
           the ⌘K command palette (opens from anywhere via useCommandMenu). -->
      <Sonner position="bottom-right" close-button />
      <AppConfirmHost />
      <CommandMenu />
    </TooltipProvider>
  </ConfigProvider>
</template>

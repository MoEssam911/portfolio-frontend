<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';

import { TooltipProvider } from '@/components/ui/tooltip';

// LTR, English. Dark is the only theme — it lives in :root, so we never add a
// `.dark` class here. See app/assets/css/tokens.css.
// Fonts are self-hosted via @nuxt/fonts (see nuxt.config.ts) — no external
// font stylesheet links here.
useHead({
  htmlAttrs: {
    lang: 'en',
    dir: 'ltr',
  },
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
});
</script>

<template>
  <!-- ConfigProvider propagates text direction (LTR) to all reka-ui primitives,
       including portalled overlays (Dialog/Sheet/Popover/Select/Tooltip). -->
  <ConfigProvider dir="ltr">
    <TooltipProvider :delay-duration="200">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <!-- Global overlays: toasts (vue-sonner) + headless confirm dialog host. -->
      <Sonner position="bottom-right" close-button />
      <AppConfirmHost />
    </TooltipProvider>
  </ConfigProvider>
</template>

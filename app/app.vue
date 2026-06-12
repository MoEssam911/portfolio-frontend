<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';

// LTR, English. Dark is the only theme — it lives in :root, so we never add a
// `.dark` class here. See app/assets/css/tokens.css.
useHead({
  htmlAttrs: {
    lang: 'en',
    dir: 'ltr',
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    },
  ],
});
</script>

<template>
  <!-- ConfigProvider propagates text direction (LTR) to all reka-ui primitives,
       including portalled overlays (Dialog/Sheet/Popover/Select/Tooltip). -->
  <ConfigProvider dir="ltr">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Toast and confirm providers will be added when those components are built -->
  </ConfigProvider>
</template>

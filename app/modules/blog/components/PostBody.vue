<script setup lang="ts">
interface Props {
  /** Sanitized HTML with heading ids already injected (see usePostContent). */
  html: string;
}

defineProps<Props>();
</script>

<template>
  <!-- Headings get scroll-margin so TOC deep-links clear the sticky header. -->
  <!-- eslint-disable-next-line vue/no-v-html -- html is sanitized in usePostContent (sanitize-html allowlist). -->
  <div class="prose max-w-none [&_:is(h2,h3,h4)]:scroll-mt-28" v-html="html" />
</template>

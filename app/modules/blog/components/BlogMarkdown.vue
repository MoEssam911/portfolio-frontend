<script setup lang="ts">
import { marked } from 'marked';

interface Props {
  content: string;
  class?: string;
}

const props = defineProps<Props>();

function withExternalLinkAttrs(html: string): string {
  return html.replace(
    /<a href="((?:https?:)?\/\/[^"]+|https?:[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  );
}

const html = computed(() => {
  const result = marked.parse(props.content, { async: false, gfm: true, breaks: false });
  const raw = typeof result === 'string' ? result : '';
  return withExternalLinkAttrs(raw);
});
</script>

<template>
  <div class="prose max-w-none" :class="props.class" v-html="html" />
</template>

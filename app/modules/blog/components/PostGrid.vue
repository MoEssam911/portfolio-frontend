<script setup lang="ts">
import type { ComputedBlogPost } from '~/modules/blog/types';

interface Props {
  posts: ComputedBlogPost[];
}

defineProps<Props>();

// Auto-fill grid with scroll-reveal stagger on first mount.
const gridRef = ref<HTMLElement>();
useScrollReveal(gridRef, { selector: '[data-reveal]', stagger: 0.06 });
</script>

<template>
  <div
    ref="gridRef"
    class="grid auto-rows-[1fr] gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]"
  >
    <BlogCard v-for="post in posts" :key="post.id" :post="post" data-reveal />
  </div>
</template>

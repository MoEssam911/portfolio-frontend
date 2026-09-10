<script setup lang="ts">
import type { BlogPost } from '~/modules/blog/types';

interface Props {
  posts: BlogPost[];
}

defineProps<Props>();

const gridRef = ref<HTMLElement>();
useScrollReveal(gridRef, { selector: '[data-reveal]', stagger: 0.06 });
</script>

<template>
  <div
    ref="gridRef"
    class="grid auto-rows-[1fr] gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]"
  >
    <PostCard v-for="post in posts" :key="post.slug" :post="post" data-reveal />
  </div>
</template>

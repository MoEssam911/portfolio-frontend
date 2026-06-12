<script setup lang="ts">
import type { ComputedBlogPost } from '~/modules/blog/types';

interface Props {
  posts: ComputedBlogPost[];
}

defineProps<Props>();

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.08 });
</script>

<template>
  <section v-if="posts.length" class="border-t border-border">
    <Container class="py-16 sm:py-20">
      <div class="mb-10 flex flex-col gap-3">
        <p class="label text-primary">Keep reading</p>
        <h2 class="font-display text-3xl text-foreground sm:text-4xl">Related posts</h2>
      </div>

      <div ref="sectionRef" class="grid auto-rows-[1fr] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <BlogCard v-for="post in posts" :key="post.id" :post="post" data-reveal />
      </div>
    </Container>
  </section>
</template>

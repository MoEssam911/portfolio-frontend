<script setup lang="ts">
import type { ComputedBlogPost } from '~/modules/blog/types';

interface Props {
  post: ComputedBlogPost;
}

defineProps<Props>();

const { formatDate } = useFormatters();
</script>

<template>
  <header class="relative overflow-hidden border-b border-border">
    <div
      class="bg-hero-glow pointer-events-none absolute inset-0 -z-10 opacity-60"
      aria-hidden="true"
    />
    <Container size="narrow" class="py-14 sm:py-20">
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
        All posts
      </NuxtLink>

      <div class="mt-8 flex flex-col gap-6">
        <div v-if="post.tags.length" class="flex flex-wrap gap-1.5">
          <Badge v-for="tag in post.tags" :key="tag.id" variant="outline">{{ tag.name }}</Badge>
        </div>

        <h1 class="max-w-3xl text-balance font-display text-4xl text-foreground sm:text-5xl">
          {{ post.title }}
        </h1>

        <p v-if="post.excerpt" class="max-w-2xl text-pretty text-lg text-muted-foreground">
          {{ post.excerpt }}
        </p>

        <div class="flex items-center gap-3 text-sm text-muted-foreground">
          <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
          <template v-if="post.readingTime">
            <span aria-hidden="true">·</span>
            <span>{{ post.readingTime }} min read</span>
          </template>
        </div>
      </div>

      <!-- Cover -->
      <div
        v-if="post.coverImage"
        class="relative mt-12 overflow-hidden rounded-3xl border border-primary-border bg-card shadow-glow ring-1 ring-primary/20"
      >
        <img
          :src="post.coverImage.url"
          :alt="post.coverImage.alt || post.title"
          class="aspect-video w-full object-cover"
          fetchpriority="high"
          decoding="async"
        />
      </div>
    </Container>
  </header>
</template>

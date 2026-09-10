<script setup lang="ts">
import type { BlogPost } from '~/modules/blog/types';
import { readingTimeMinutes } from '~/modules/blog/composables/usePosts';

interface Props {
  post: BlogPost;
}

const props = defineProps<Props>();
const { formatDate } = useFormatters();
const minutes = computed(() => readingTimeMinutes(props.post.body));
</script>

<template>
  <header class="relative overflow-hidden border-b border-border">
    <SectionAurora class="-z-10" />
    <div class="bg-hero-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
    <Container class="py-14 sm:py-20">
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
        All posts
      </NuxtLink>

      <div class="mt-8 flex max-w-3xl flex-col gap-6">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p class="label text-primary">{{ formatDate(post.publishedAt) }}</p>
          <span class="text-xs text-muted-foreground" aria-hidden="true">·</span>
          <p class="text-sm text-muted-foreground">{{ minutes }} min read</p>
          <Badge v-if="post.featured" variant="outline" class="gap-1">
            <Icon name="lucide:star" class="size-3" />
            Featured
          </Badge>
        </div>

        <h1
          class="text-balance font-display text-4xl text-foreground sm:text-5xl lg:text-6xl"
        >
          {{ post.title }}
        </h1>

        <p class="max-w-2xl text-pretty text-lg text-muted-foreground">
          {{ post.excerpt }}
        </p>

        <div v-if="post.tags.length" class="flex flex-wrap gap-1.5">
          <Badge v-for="tag in post.tags" :key="tag" variant="outline" class="font-mono">
            {{ tag }}
          </Badge>
        </div>
      </div>

      <div
        v-if="post.coverUrl"
        class="glass-surface mt-10 overflow-hidden rounded-2xl sm:mt-12"
      >
        <NuxtImg
          :src="post.coverUrl"
          :alt="post.title"
          class="aspect-21/9 w-full object-cover"
          format="webp"
          quality="80"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>
    </Container>
  </header>
</template>

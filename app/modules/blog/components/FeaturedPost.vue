<script setup lang="ts">
import type { ComputedBlogPost } from '~/modules/blog/types';

interface Props {
  post: ComputedBlogPost;
}

const props = defineProps<Props>();

const { formatDate } = useFormatters();

const visibleTags = computed(() => props.post.tags.slice(0, 3));
</script>

<template>
  <NuxtLink
    :to="`/blog/${post.slug}`"
    class="group grid overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-primary-border lg:grid-cols-2"
  >
    <!-- Cover -->
    <div class="relative aspect-[16/10] w-full overflow-hidden bg-muted lg:aspect-auto lg:h-full">
      <img
        v-if="post.coverImage"
        :src="post.coverImage.url"
        :alt="post.coverImage.alt || post.title"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="bg-card-glow flex size-full min-h-64 items-center justify-center">
        <Icon name="lucide:pen-line" class="size-10 text-primary/30" />
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-col justify-center gap-4 p-7 sm:p-10">
      <div class="flex items-center gap-3">
        <span class="label text-primary">Featured</span>
        <span class="text-xs text-muted-foreground">·</span>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
          <template v-if="post.readingTime">
            <span aria-hidden="true">·</span>
            <span>{{ post.readingTime }} min read</span>
          </template>
        </div>
      </div>

      <h2
        class="text-balance font-display text-2xl text-foreground transition-colors group-hover:text-primary sm:text-3xl lg:text-4xl"
      >
        {{ post.title }}
      </h2>

      <p v-if="post.excerpt" class="line-clamp-3 text-pretty text-muted-foreground">
        {{ post.excerpt }}
      </p>

      <div v-if="visibleTags.length" class="flex flex-wrap gap-1.5 pt-1">
        <Badge v-for="tag in visibleTags" :key="tag.id" variant="outline">{{ tag.name }}</Badge>
      </div>

      <span
        class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        Read article
        <Icon
          name="lucide:arrow-right"
          class="size-4 transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </div>
  </NuxtLink>
</template>

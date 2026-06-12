<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { ComputedBlogPost } from '~/modules/blog/types';

interface Props {
  post: ComputedBlogPost;
  class?: string;
}

const props = defineProps<Props>();

const { formatDate } = useFormatters();

const visibleTags = computed(() => props.post.tags.slice(0, 2));
</script>

<template>
  <NuxtLink
    :to="`/blog/${post.slug}`"
    :class="
      cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary-border',
        props.class,
      )
    "
  >
    <!-- Cover -->
    <div class="relative aspect-[16/9] w-full overflow-hidden bg-muted">
      <img
        v-if="post.coverImage"
        :src="post.coverImage.url"
        :alt="post.coverImage.alt || post.title"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="bg-card-glow flex size-full items-center justify-center">
        <Icon name="lucide:pen-line" class="size-7 text-primary/30" />
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col gap-3 p-5">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
        <template v-if="post.readingTime">
          <span aria-hidden="true">·</span>
          <span>{{ post.readingTime }} min read</span>
        </template>
      </div>

      <h3
        class="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary"
      >
        {{ post.title }}
      </h3>

      <p v-if="post.excerpt" class="line-clamp-2 text-pretty text-sm text-muted-foreground">
        {{ post.excerpt }}
      </p>

      <div v-if="visibleTags.length" class="mt-auto flex flex-wrap gap-1.5 pt-2">
        <Badge v-for="tag in visibleTags" :key="tag.id" variant="outline">{{ tag.name }}</Badge>
      </div>
    </div>
  </NuxtLink>
</template>

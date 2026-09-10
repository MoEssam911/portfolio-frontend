<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { BlogPost } from '~/modules/blog/types';
import { readingTimeMinutes } from '~/modules/blog/composables/usePosts';

interface Props {
  post: BlogPost;
  class?: string;
}

const props = defineProps<Props>();
const { formatDate } = useFormatters();

const minutes = computed(() => readingTimeMinutes(props.post.body));
const visibleTags = computed(() => props.post.tags.slice(0, 3));
const extraTags = computed(() => Math.max(0, props.post.tags.length - visibleTags.value.length));
</script>

<template>
  <NuxtLink
    :to="`/blog/${post.slug}`"
    :class="
      cn(
        'glass-surface neon-glow group relative flex h-full flex-col overflow-hidden rounded-2xl',
        props.class,
      )
    "
  >
    <div v-if="post.coverUrl" class="relative aspect-video w-full overflow-hidden bg-muted">
      <NuxtImg
        :src="post.coverUrl"
        :alt="post.title"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
        format="webp"
        quality="75"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-t from-background/70 via-transparent to-transparent"
        aria-hidden="true"
      />
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5 sm:p-6">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p class="label text-primary">{{ formatDate(post.publishedAt) }}</p>
        <span class="text-xs text-muted-foreground" aria-hidden="true">·</span>
        <p class="text-xs text-muted-foreground">{{ minutes }} min read</p>
      </div>

      <div class="flex items-start justify-between gap-3">
        <h3
          class="font-display text-xl font-semibold text-foreground transition-colors group-hover:text-primary sm:text-2xl"
        >
          {{ post.title }}
        </h3>
        <Icon
          name="lucide:arrow-up-right"
          class="mt-1 size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <p class="line-clamp-3 text-pretty text-sm text-muted-foreground">
        {{ post.excerpt }}
      </p>

      <div v-if="visibleTags.length" class="mt-auto flex flex-wrap gap-1.5 pt-2">
        <Badge v-for="tag in visibleTags" :key="tag" variant="outline" class="font-mono">
          {{ tag }}
        </Badge>
        <Badge v-if="extraTags > 0" variant="ghost" class="font-mono">+{{ extraTags }}</Badge>
      </div>
    </div>
  </NuxtLink>
</template>

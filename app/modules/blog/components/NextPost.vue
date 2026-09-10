<script setup lang="ts">
import type { BlogPost } from '~/modules/blog/types';

interface Props {
  post: BlogPost;
}

defineProps<Props>();
</script>

<template>
  <BaseCard
    as="NuxtLink"
    interactive
    :to="`/blog/${post.slug}`"
    class="group relative flex items-center gap-6 overflow-hidden rounded-3xl p-6 sm:p-8"
  >
    <div class="flex flex-col gap-1.5">
      <p class="label text-muted-foreground">Next post</p>
      <h3 class="font-display text-2xl text-foreground transition-colors group-hover:text-primary">
        {{ post.title }}
      </h3>
    </div>

    <Icon
      name="lucide:arrow-right"
      class="ml-auto size-6 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
    />
  </BaseCard>
</template>

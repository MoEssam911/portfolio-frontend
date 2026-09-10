<script setup lang="ts">
const { posts, tags } = usePosts();
const activeTag = ref<string | null>(null);

const filteredPosts = computed(() =>
  activeTag.value
    ? posts.value.filter((p) => p.tags.includes(activeTag.value as string))
    : posts.value,
);

watch(tags, (list) => {
  if (activeTag.value && !list.includes(activeTag.value)) activeTag.value = null;
});

useSeo({
  title: 'Blog',
  description:
    'Engineering notes on frontend performance, Vue, Nuxt, and building fast, deliberate user interfaces.',
});
</script>

<template>
  <div>
    <PageHero
      eyebrow="Writing"
      title="Blog"
      description="Practical notes on frontend craft — performance, architecture, and shipping interfaces that feel intentional under real conditions."
    />

    <Section container-size="wide">
      <div
        v-if="posts.length === 0"
        class="glass-surface rounded-2xl border-dashed p-12 text-center"
      >
        <p class="text-sm text-muted-foreground">New articles are on the way — check back soon.</p>
      </div>

      <div v-else class="flex flex-col gap-10">
        <TagFilterBar v-model="activeTag" :tags="tags" />

        <div
          v-if="filteredPosts.length === 0"
          class="glass-surface rounded-2xl border-dashed p-12 text-center"
        >
          <p class="text-sm text-muted-foreground">
            No posts tagged
            <span class="font-mono text-foreground">{{ activeTag }}</span
            >.
          </p>
          <button
            type="button"
            class="mt-3 text-sm text-primary underline-offset-4 hover:underline"
            @click="activeTag = null"
          >
            Clear filter
          </button>
        </div>

        <PostGrid v-else :posts="filteredPosts" />
      </div>
    </Section>
  </div>
</template>

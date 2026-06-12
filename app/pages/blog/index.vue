<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import type { Tag } from '~/modules/blog/types';

const route = useRoute();
const router = useRouter();

// Page lives in the URL (?page=) so listings are shareable / back-button friendly.
const page = ref(Math.max(1, Number(route.query.page) || 1));

watch(page, (p) => {
  router.replace({ query: { ...route.query, page: p > 1 ? String(p) : undefined } });
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' });
});

const { posts, meta, pending, error } = useBlogList(page, 9);

// Tag filter is a client-side refinement over the current page (no backend filter).
const activeTag = ref<string | null>(null);

const tags = computed<Tag[]>(() => {
  const map = new Map<string, Tag>();
  for (const p of posts.value) for (const t of p.tags) map.set(t.slug, t);
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
});

const tagFiltered = computed(() =>
  activeTag.value
    ? posts.value.filter((p) => p.tags.some((t) => t.slug === activeTag.value))
    : posts.value,
);

// Reset a stale tag when a new page no longer contains it.
watch(tags, (list) => {
  if (activeTag.value && !list.some((t) => t.slug === activeTag.value)) activeTag.value = null;
});

// Client-side fuzzy search over the tag-filtered set.
const { query, results } = useBlogSearch(() => tagFiltered.value);

// A clean, unfiltered first page gets a featured hero + the rest in the grid.
const isPristine = computed(
  () => page.value === 1 && !activeTag.value && !query.value.trim(),
);
const featured = computed(() => (isPristine.value ? (results.value[0] ?? null) : null));
const gridPosts = computed(() => (isPristine.value ? results.value.slice(1) : results.value));

const isRefining = computed(() => Boolean(activeTag.value) || Boolean(query.value.trim()));
const showSkeleton = computed(() => pending.value && posts.value.length === 0);

useSeo({
  title: 'Blog',
  description: 'Notes on engineering, design, and the space between — by Mohamed Essam.',
});
</script>

<template>
  <div>
    <PageHero
      eyebrow="Writing"
      title="Blog"
      description="Notes on engineering, design systems, and the craft of building for the web."
    />

    <Section container-size="wide">
      <!-- Loading -->
      <div v-if="showSkeleton" class="flex flex-col gap-8">
        <div class="flex flex-wrap gap-2">
          <Skeleton v-for="n in 5" :key="n" class="h-8 w-20 rounded-full" />
        </div>
        <Skeleton class="h-64 w-full rounded-3xl" />
        <div class="grid auto-rows-[1fr] gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
          <Skeleton v-for="n in 6" :key="n" class="h-72 rounded-2xl" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl border border-border bg-card p-12 text-center">
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">
          Couldn't load posts right now. Please try again later.
        </p>
      </div>

      <!-- Empty (nothing published) -->
      <div
        v-else-if="posts.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
      >
        <p class="text-sm text-muted-foreground">First posts are on the way — check back soon.</p>
      </div>

      <!-- Populated -->
      <div v-else class="flex flex-col gap-10">
        <!-- Controls -->
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <TagFilter v-model="activeTag" :tags="tags" />
          <BlogSearch v-model="query" />
        </div>

        <!-- Refined-empty -->
        <div
          v-if="results.length === 0"
          class="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
        >
          <p class="text-sm text-muted-foreground">
            No posts match
            <template v-if="query.trim()">
              “<span class="text-foreground">{{ query }}</span>”
            </template>
            <template v-if="query.trim() && activeTag"> in </template>
            <template v-if="activeTag">
              <span class="text-foreground">{{ tags.find((t) => t.slug === activeTag)?.name }}</span>
            </template>
            .
          </p>
          <button
            type="button"
            class="mt-3 text-sm text-primary underline-offset-4 hover:underline"
            @click="
              activeTag = null;
              query = '';
            "
          >
            Clear filters
          </button>
        </div>

        <template v-else>
          <FeaturedPost v-if="featured" :post="featured" />

          <PostGrid v-if="gridPosts.length" :posts="gridPosts" />

          <!-- Pagination hidden while a client filter/search narrows the page. -->
          <BlogPagination v-if="meta && !isRefining" v-model="page" :meta="meta" />
        </template>
      </div>
    </Section>
  </div>
</template>

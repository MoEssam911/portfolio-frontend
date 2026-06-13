<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const route = useRoute();
const url = useRequestURL();

const slug = computed(() => route.params.slug as string);

const { post, pending, error } = usePost(slug);
const { html, headings } = usePostContent(() => post.value?.content);

const { formatDate } = useFormatters();

// A small pool to drive related posts (backend-ordered, newest first).
const { data: poolRaw } = useBlog(12);

const related = computed(() => {
  const pool = poolRaw.value?.data ?? [];
  const current = post.value;
  if (!current || pool.length < 2) return [];

  const tagSlugs = new Set(current.tags.map((t) => t.slug));
  const others = pool.filter((p) => p.slug !== current.slug);

  const ranked = others
    .map((p) => ({ post: p, shared: p.tags.filter((t) => tagSlugs.has(t.slug)).length }))
    .sort((a, b) => b.shared - a.shared);

  const withShared = ranked.filter((r) => r.shared > 0).map((r) => r.post);
  // Fall back to latest other posts when nothing shares a tag.
  return (withShared.length ? withShared : others).slice(0, 3);
});

const notFound = computed(() => !pending.value && (Boolean(error.value) || !post.value));

const canonical = computed(() => `${url.origin}/blog/${slug.value}`);

// Reactive SEO — getters re-evaluate once the fetch resolves (SSR awaits it).
useSeoMeta({
  title: () => post.value?.title ?? 'Post',
  ogTitle: () => (post.value ? post.value.title : undefined),
  description: () => post.value?.excerpt || undefined,
  ogDescription: () => post.value?.excerpt || undefined,
  ogType: 'article',
  ogUrl: () => canonical.value,
  ogImage: () => post.value?.coverImage?.url || undefined,
  articlePublishedTime: () => post.value?.createdAt,
  articleModifiedTime: () => post.value?.updatedAt,
  robots: () => (notFound.value ? 'noindex,nofollow' : 'index,follow'),
});

const jsonLd = computed(() => {
  const p = post.value;
  if (!p) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt || undefined,
    url: canonical.value,
    image: p.coverImage?.url || undefined,
    datePublished: p.createdAt,
    dateModified: p.updatedAt,
    keywords: p.tags.length ? p.tags.map((t) => t.name).join(', ') : undefined,
    author: { '@type': 'Person', name: 'Mohamed Essam' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical.value },
  };
});

useHead({
  // Canonical is set globally in app.vue (path-based).
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => (jsonLd.value ? JSON.stringify(jsonLd.value) : '')),
    },
  ],
});
</script>

<template>
  <div>
    <ReadingProgress v-if="post" />

    <!-- Loading -->
    <div v-if="pending && !post">
      <Container size="narrow" class="py-16 sm:py-24">
        <Skeleton class="h-5 w-28" />
        <Skeleton class="mt-8 h-14 w-3/4" />
        <Skeleton class="mt-4 h-6 w-2/3" />
        <Skeleton class="mt-12 aspect-video w-full rounded-3xl" />
      </Container>
    </div>

    <!-- Error / not found -->
    <div v-else-if="notFound">
      <Container class="py-24 text-center sm:py-32">
        <Icon name="lucide:file-question" class="mx-auto size-8 text-muted-foreground" />
        <h1 class="mt-4 font-display text-3xl text-foreground">Post not found</h1>
        <p class="mt-3 text-muted-foreground">
          This post may have been moved or is no longer published.
        </p>
        <NuxtLink to="/blog" :class="cn(buttonVariants({ size: 'lg' }), 'mt-8 h-10 px-5')">
          <Icon name="lucide:arrow-left" class="size-4" />
          Back to blog
        </NuxtLink>
      </Container>
    </div>

    <!-- Populated -->
    <template v-else-if="post">
      <PostHero :post="post" />

      <Container size="default" class="py-16 sm:py-24">
        <div class="grid gap-12 lg:grid-cols-[1fr_16rem] lg:gap-16">
          <!-- Article body -->
          <article class="min-w-0">
            <PostBody :html="html" />

            <div class="mt-12 flex flex-col gap-6 border-t border-border pt-8">
              <ShareButtons :url="canonical" :title="post.title" />
              <p class="text-sm text-muted-foreground">
                Published {{ formatDate(post.createdAt) }}
                <template v-if="post.readingTime"> · {{ post.readingTime }} min read</template>
              </p>
            </div>
          </article>

          <!-- TOC sidebar -->
          <aside v-if="headings.length" class="hidden lg:block">
            <div class="sticky top-24">
              <TableOfContents :headings="headings" />
            </div>
          </aside>
        </div>
      </Container>

      <RelatedPosts :posts="related" />
    </template>
  </div>
</template>

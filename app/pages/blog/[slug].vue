<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const route = useRoute();
const url = useRequestURL();

const slug = computed(() => route.params.slug as string);
const { post, nextPost, error } = usePost(slug);

const notFound = computed(() => Boolean(error.value) || !post.value);
const canonical = computed(() => `${url.origin}/blog/${slug.value}`);

useSeoMeta({
  title: () => post.value?.title ?? 'Post',
  ogTitle: () => post.value?.title ?? undefined,
  description: () => post.value?.excerpt || undefined,
  ogDescription: () => post.value?.excerpt || undefined,
  ogType: 'article',
  ogUrl: () => canonical.value,
  ogImage: () =>
    post.value?.coverUrl
      ? absoluteUrl(post.value.coverUrl, url.origin)
      : absoluteUrl(DEFAULT_OG_IMAGE, url.origin),
  articlePublishedTime: () => post.value?.publishedAt,
  articleModifiedTime: () => post.value?.updatedAt,
  robots: () => (notFound.value ? 'noindex,nofollow' : 'index,follow'),
});

const jsonLd = computed(() => {
  const p = post.value;
  if (!p) return null;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.excerpt,
        url: canonical.value,
        image: p.coverUrl ? absoluteUrl(p.coverUrl, url.origin) : undefined,
        datePublished: p.publishedAt,
        dateModified: p.updatedAt,
        keywords: p.tags.length ? p.tags.join(', ') : undefined,
        author: { '@type': 'Person', name: 'Mohamed Essam' },
        citation: p.sources?.length ? p.sources.map((s) => s.url) : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: url.origin },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${url.origin}/blog` },
          { '@type': 'ListItem', position: 3, name: p.title, item: canonical.value },
        ],
      },
    ],
  };
});

useHead({
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
    <div v-if="notFound">
      <Container class="py-24 text-center sm:py-32">
        <Icon name="lucide:file-question" class="mx-auto size-8 text-muted-foreground" />
        <h1 class="mt-4 font-display text-3xl text-foreground">Post not found</h1>
        <p class="mt-3 text-muted-foreground">
          This article may have been moved or is no longer published.
        </p>
        <NuxtLink to="/blog" :class="cn(buttonVariants({ size: 'lg' }), 'mt-8 h-10 px-5')">
          <Icon name="lucide:arrow-left" class="size-4" />
          Back to blog
        </NuxtLink>
      </Container>
    </div>

    <template v-else-if="post">
      <PostHero :post="post" />

      <Container class="py-16 sm:py-24">
        <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
          <article class="flex min-w-0 flex-col gap-12">
            <BlogMarkdown :content="post.body" />
            <PostSources v-if="post.sources?.length" :sources="post.sources" />
          </article>

          <div class="lg:sticky lg:top-24 lg:self-start">
            <PostMeta :post="post" />
          </div>
        </div>
      </Container>

      <Container v-if="nextPost" class="pb-20 sm:pb-28">
        <NextPost :post="nextPost" />
      </Container>
    </template>
  </div>
</template>

<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const route = useRoute();
const config = useRuntimeConfig();
const url = useRequestURL();

const slug = computed(() => route.params.slug as string);

const { project, pending, error } = useProject(slug);

// A small pool to drive the "next project" navigation (backend-ordered).
const { data: poolRaw } = useProjects(12);

const nextProject = computed(() => {
  const pool = poolRaw.value?.data ?? [];
  if (pool.length < 2 || !project.value) return null;
  const i = pool.findIndex((p) => p.slug === project.value!.slug);
  if (i === -1) return pool[0] ?? null;
  return pool[(i + 1) % pool.length] ?? null;
});

// Render the description as Overview prose — split on blank lines into paragraphs.
const paragraphs = computed(() =>
  (project.value?.description ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean),
);

const notFound = computed(() => !pending.value && (Boolean(error.value) || !project.value));

const canonical = computed(() => `${url.origin}/projects/${slug.value}`);

// Reactive SEO — getters re-evaluate once the fetch resolves (SSR awaits it).
const appName = config.public.appName as string;
useSeoMeta({
  title: () => (project.value ? `${project.value.title} — ${appName}` : `Project — ${appName}`),
  ogTitle: () => (project.value ? `${project.value.title} — ${appName}` : undefined),
  description: () => project.value?.excerpt || undefined,
  ogDescription: () => project.value?.excerpt || undefined,
  ogType: 'article',
  ogUrl: () => canonical.value,
  ogImage: () => project.value?.thumbnail?.url || undefined,
  robots: () => (notFound.value ? 'noindex,nofollow' : 'index,follow'),
});

const jsonLd = computed(() => {
  const p = project.value;
  if (!p) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.excerpt || p.description?.slice(0, 200),
    url: canonical.value,
    image: p.thumbnail?.url || undefined,
    dateCreated: p.createdAt,
    dateModified: p.updatedAt,
    keywords: p.technologies.length ? p.technologies.join(', ') : undefined,
    author: { '@type': 'Person', name: 'Mohamed Essam' },
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
    <!-- Loading -->
    <div v-if="pending && !project">
      <Container class="py-16 sm:py-24">
        <Skeleton class="h-5 w-28" />
        <Skeleton class="mt-8 h-14 w-3/4" />
        <Skeleton class="mt-4 h-6 w-2/3" />
        <Skeleton class="mt-12 aspect-[16/9] w-full rounded-3xl" />
      </Container>
    </div>

    <!-- Error / not found -->
    <div v-else-if="notFound">
      <Container class="py-24 text-center sm:py-32">
        <Icon name="lucide:compass" class="mx-auto size-8 text-muted-foreground" />
        <h1 class="mt-4 font-display text-3xl text-foreground">Project not found</h1>
        <p class="mt-3 text-muted-foreground">
          This project may have been moved or is no longer published.
        </p>
        <NuxtLink
          to="/projects"
          :class="cn(buttonVariants({ size: 'lg' }), 'mt-8 h-10 px-5')"
        >
          <Icon name="lucide:arrow-left" class="size-4" />
          Back to projects
        </NuxtLink>
      </Container>
    </div>

    <!-- Populated -->
    <template v-else-if="project">
      <CaseStudyHero :project="project" />

      <Container class="py-16 sm:py-24">
        <div class="grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <!-- Body -->
          <div class="flex flex-col gap-12">
            <section class="flex flex-col gap-5">
              <h2 class="font-display text-2xl text-foreground sm:text-3xl">Overview</h2>
              <div class="prose max-w-none">
                <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
              </div>
            </section>

            <section v-if="project.gallery.length" class="flex flex-col gap-5">
              <h2 class="font-display text-2xl text-foreground sm:text-3xl">Gallery</h2>
              <ProjectGallery :images="project.gallery" />
            </section>
          </div>

          <!-- Meta sidebar -->
          <div class="lg:sticky lg:top-24 lg:self-start">
            <ProjectMeta :project="project" />
          </div>
        </div>
      </Container>

      <Container v-if="nextProject" class="pb-20 sm:pb-28">
        <NextProject :project="nextProject" />
      </Container>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';

const route = useRoute();
const router = useRouter();

// Page lives in the URL (?page=) so listings are shareable / back-button friendly.
const page = ref(Math.max(1, Number(route.query.page) || 1));

watch(page, (p) => {
  router.replace({ query: { ...route.query, page: p > 1 ? String(p) : undefined } });
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' });
});

const { projects, meta, pending, error } = useProjectsList(page, 9);

// Technology filter is a client-side refinement over the current page.
const activeTech = ref<string | null>(null);

const technologies = computed(() => {
  const set = new Set<string>();
  for (const p of projects.value) for (const t of p.technologies) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
});

const filteredProjects = computed(() =>
  activeTech.value
    ? projects.value.filter((p) => p.technologies.includes(activeTech.value as string))
    : projects.value,
);

// Reset a stale filter when a new page no longer contains that technology.
watch(technologies, (techs) => {
  if (activeTech.value && !techs.includes(activeTech.value)) activeTech.value = null;
});

const showSkeleton = computed(() => pending.value && projects.value.length === 0);

useSeo({
  title: 'Projects',
  description: 'Selected work — products designed and engineered end-to-end by Mohamed Essam.',
});
</script>

<template>
  <div>
    <PageHero
      eyebrow="Selected Work"
      title="Projects"
      description="Products I've designed and engineered end-to-end — from first principles to production."
    />

    <Section container-size="wide">
      <!-- Loading -->
      <div v-if="showSkeleton" class="flex flex-col gap-8">
        <div class="flex flex-wrap gap-2">
          <Skeleton v-for="n in 5" :key="n" class="h-8 w-20 rounded-full" />
        </div>
        <div class="grid auto-rows-[1fr] gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
          <Skeleton v-for="n in 6" :key="n" class="h-72 rounded-2xl" />
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-border bg-card p-12 text-center"
      >
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load projects right now. Please try again later.</p>
      </div>

      <!-- Empty (nothing published) -->
      <div
        v-else-if="projects.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
      >
        <p class="text-sm text-muted-foreground">New work is on the way — check back soon.</p>
      </div>

      <!-- Populated -->
      <div v-else class="flex flex-col gap-10">
        <FilterBar v-model="activeTech" :technologies="technologies" />

        <!-- Filtered-empty -->
        <div
          v-if="filteredProjects.length === 0"
          class="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
        >
          <p class="text-sm text-muted-foreground">
            No projects on this page use <span class="font-mono text-foreground">{{ activeTech }}</span>.
          </p>
          <button
            type="button"
            class="mt-3 text-sm text-primary underline-offset-4 hover:underline"
            @click="activeTech = null"
          >
            Clear filter
          </button>
        </div>

        <ProjectGrid v-else :projects="filteredProjects" />

        <!-- Pagination hidden while a client filter narrows the page. -->
        <ProjectPagination
          v-if="meta && !activeTech"
          v-model="page"
          :meta="meta"
        />
      </div>
    </Section>
  </div>
</template>

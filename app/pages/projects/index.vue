<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const page = ref(Math.max(1, Number(route.query.page) || 1));

watch(page, (p) => {
  router.replace({ query: { ...route.query, page: p > 1 ? String(p) : undefined } });
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' });
});

const { projects, meta } = useProjectsList(page, 9);
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

watch(technologies, (techs) => {
  if (activeTech.value && !techs.includes(activeTech.value)) activeTech.value = null;
});

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
      <div
        v-if="projects.length === 0"
        class="glass-surface rounded-2xl border-dashed p-12 text-center"
      >
        <p class="text-sm text-muted-foreground">New work is on the way — check back soon.</p>
      </div>

      <div v-else class="flex flex-col gap-10">
        <FilterBar v-model="activeTech" :technologies="technologies" />

        <div
          v-if="filteredProjects.length === 0"
          class="glass-surface rounded-2xl border-dashed p-12 text-center"
        >
          <p class="text-sm text-muted-foreground">
            No projects on this page use
            <span class="font-mono text-foreground">{{ activeTech }}</span
            >.
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

        <ProjectPagination v-if="meta && !activeTech" v-model="page" :meta="meta" />
      </div>
    </Section>
  </div>
</template>

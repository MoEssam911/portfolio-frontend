<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Live featured projects (backend-ordered, filtered by the `featured` flag).
const { pending, error, featuredProjects } = useProjects(12);

// Bento: the first tile is emphasised when we have 3+ to fill the larger cell.
const useBento = computed(() => featuredProjects.value.length >= 3);

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.08 });

function tileClass(index: number): string {
  if (!useBento.value) return '';
  // First tile spans two columns + two rows on large screens.
  return index === 0 ? 'sm:col-span-2 lg:row-span-2' : '';
}
</script>

<template>
  <Section>
    <template #header>
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="flex flex-col gap-3">
          <p class="label text-primary">Selected Work</p>
          <h2 class="font-display text-3xl text-foreground sm:text-4xl">Featured projects</h2>
          <p class="max-w-2xl text-lg text-muted-foreground">
            A few things I've designed and engineered end-to-end.
          </p>
        </div>
        <NuxtLink
          to="/projects"
          :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-4')"
        >
          All work
          <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </template>

    <div ref="sectionRef">
      <!-- Loading -->
      <div v-if="pending && featuredProjects.length === 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" class="h-72 rounded-2xl" />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-border bg-card p-10 text-center"
      >
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load projects right now.</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="featuredProjects.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">New work is on the way — check back soon.</p>
      </div>

      <!-- Populated -->
      <div v-else class="grid auto-rows-[1fr] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="(project, i) in featuredProjects"
          :key="project.id"
          :project="project"
          :large="useBento && i === 0"
          data-reveal
          :class="tileClass(i)"
        />
      </div>
    </div>
  </Section>
</template>

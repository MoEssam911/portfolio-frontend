<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const { featuredProjects } = useProjects(12);

const useBento = computed(() => featuredProjects.value.length >= 3);

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.08 });

function tileClass(index: number): string {
  if (!useBento.value) return '';
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
      <div
        v-if="featuredProjects.length === 0"
        class="glass-surface rounded-2xl border-dashed p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">New work is on the way — check back soon.</p>
      </div>

      <div v-else class="grid auto-rows-[1fr] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="(project, i) in featuredProjects"
          :key="project.slug"
          :project="project"
          :large="useBento && i === 0"
          data-reveal
          :class="tileClass(i)"
        />
      </div>
    </div>
  </Section>
</template>

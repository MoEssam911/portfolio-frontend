<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Project } from '~/modules/projects/types';

interface Props {
  project: Project;
}

defineProps<Props>();

// Gentle pointer parallax on the cinematic hero cover (translate-only, no tilt).
const mediaRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);
useParallax(mediaRef, imageRef, { strength: 18 });
</script>

<template>
  <header class="relative overflow-hidden border-b border-border">
    <SectionAurora class="-z-10" />
    <div class="bg-hero-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
    <Container class="py-14 sm:py-20">
      <NuxtLink
        to="/projects"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
        All projects
      </NuxtLink>

      <div class="mt-8 flex flex-col gap-6">
        <div class="flex flex-wrap items-center gap-3">
          <p class="label text-primary">Case Study</p>
          <Badge v-if="project.featured" variant="outline" class="gap-1">
            <Icon name="lucide:star" class="size-3" />
            Featured
          </Badge>
        </div>

        <h1
          class="max-w-4xl text-balance font-display text-4xl text-foreground sm:text-5xl lg:text-6xl"
        >
          {{ project.title }}
        </h1>

        <p v-if="project.excerpt" class="max-w-2xl text-pretty text-lg text-muted-foreground">
          {{ project.excerpt }}
        </p>

        <div
          v-if="project.liveUrl || project.repoUrl"
          class="mt-2 flex flex-wrap items-center gap-3"
        >
          <a
            v-if="project.liveUrl"
            :href="project.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="cn(buttonVariants({ size: 'lg' }), 'h-10 px-5')"
          >
            Visit live site
            <Icon name="lucide:arrow-up-right" class="size-4" />
          </a>
          <a
            v-if="project.repoUrl"
            :href="project.repoUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-5')"
          >
            <Icon name="lucide:github" class="size-4" />
            Source code
          </a>
        </div>
      </div>

      <!-- Hero media — glass-framed, neon-edged, with pointer parallax. -->
      <div
        v-if="project.thumbnailUrl"
        ref="mediaRef"
        class="glass-surface relative mt-12 overflow-hidden rounded-3xl shadow-glow ring-1 ring-primary/20"
      >
        <img
          ref="imageRef"
          :src="project.thumbnailUrl"
          :alt="project.title"
          class="aspect-video w-full scale-105 object-cover transition-transform duration-500 ease-out"
          fetchpriority="high"
          decoding="async"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent"
          aria-hidden="true"
        />
      </div>
    </Container>
  </header>
</template>

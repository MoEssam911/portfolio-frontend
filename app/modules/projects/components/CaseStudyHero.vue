<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Project } from '~/modules/projects/types';

interface Props {
  project: Project;
}

defineProps<Props>();
</script>

<template>
  <header class="relative overflow-hidden border-b border-border">
    <div class="bg-hero-glow pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
    <Container class="py-14 sm:py-20">
      <NuxtLink
        to="/projects"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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

        <h1 class="max-w-4xl text-balance font-display text-4xl text-foreground sm:text-5xl lg:text-6xl">
          {{ project.title }}
        </h1>

        <p
          v-if="project.excerpt"
          class="max-w-2xl text-pretty text-lg text-muted-foreground"
        >
          {{ project.excerpt }}
        </p>

        <div v-if="project.liveUrl || project.repoUrl" class="mt-2 flex flex-wrap items-center gap-3">
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

      <!-- Hero media -->
      <div
        v-if="project.thumbnail"
        class="relative mt-12 overflow-hidden rounded-3xl border border-primary-border bg-card shadow-glow ring-1 ring-primary/20"
      >
        <img
          :src="project.thumbnail.url"
          :alt="project.thumbnail.alt || project.title"
          class="aspect-[16/9] w-full object-cover"
          fetchpriority="high"
          decoding="async"
        />
      </div>
    </Container>
  </header>
</template>

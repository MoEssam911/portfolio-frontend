<script setup lang="ts">
import type { Project } from '~/modules/projects/types';

interface Props {
  project: Project;
}

defineProps<Props>();
</script>

<template>
  <NuxtLink
    :to="`/projects/${project.slug}`"
    class="group relative flex items-center gap-6 overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary-border sm:p-8"
  >
    <!-- Thumbnail -->
    <div class="hidden size-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:block">
      <img
        v-if="project.thumbnail"
        :src="project.thumbnail.url"
        :alt="project.thumbnail.alt || project.title"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="bg-card-glow flex size-full items-center justify-center">
        <span class="font-display text-2xl text-primary/30">{{ project.title.charAt(0) }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <p class="label text-muted-foreground">Next project</p>
      <h3 class="font-display text-2xl text-foreground transition-colors group-hover:text-primary">
        {{ project.title }}
      </h3>
    </div>

    <Icon
      name="lucide:arrow-right"
      class="ml-auto size-6 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
    />
  </NuxtLink>
</template>

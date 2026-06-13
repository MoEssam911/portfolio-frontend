<script setup lang="ts">
import type { Project } from '~/modules/projects/types';

interface Props {
  projects: Project[];
}

defineProps<Props>();

// Auto-fill grid with scroll-reveal stagger on first mount.
const gridRef = ref<HTMLElement>();
useScrollReveal(gridRef, { selector: '[data-reveal]', stagger: 0.06 });
</script>

<template>
  <div
    ref="gridRef"
    class="grid auto-rows-[1fr] gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]"
  >
    <ProjectCard v-for="project in projects" :key="project.id" :project="project" data-reveal />
  </div>
</template>

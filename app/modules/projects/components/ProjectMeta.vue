<script setup lang="ts">
import type { Project } from '~/modules/projects/types';

interface Props {
  project: Project;
}

const props = defineProps<Props>();

const { formatDate } = useFormatters();

const year = computed(() => formatDate(props.project.createdAt, 'YYYY'));
</script>

<template>
  <aside class="flex flex-col gap-8 rounded-2xl border border-border bg-card p-6">
    <!-- Year -->
    <div class="flex flex-col gap-1.5">
      <p class="label text-muted-foreground">Year</p>
      <p class="font-mono text-sm text-foreground">{{ year }}</p>
    </div>

    <!-- Stack -->
    <div v-if="project.technologies.length" class="flex flex-col gap-2.5">
      <p class="label text-muted-foreground">Stack</p>
      <div class="flex flex-wrap gap-1.5">
        <Badge
          v-for="tech in project.technologies"
          :key="tech"
          variant="outline"
          class="font-mono"
        >
          {{ tech }}
        </Badge>
      </div>
    </div>

    <!-- Links -->
    <div v-if="project.liveUrl || project.repoUrl" class="flex flex-col gap-2.5">
      <p class="label text-muted-foreground">Links</p>
      <div class="flex flex-col gap-2">
        <a
          v-if="project.liveUrl"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <Icon name="lucide:external-link" class="size-4" />
          Live site
          <Icon
            name="lucide:arrow-up-right"
            class="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
        <a
          v-if="project.repoUrl"
          :href="project.repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <Icon name="lucide:github" class="size-4" />
          Repository
          <Icon
            name="lucide:arrow-up-right"
            class="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </div>
  </aside>
</template>

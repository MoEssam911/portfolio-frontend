<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { Project } from '~/modules/projects/types';

interface Props {
  project: Project;
  /** Emphasised bento tile — larger media + visible excerpt. */
  large?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  large: false,
});

const visibleTech = computed(() => props.project.technologies.slice(0, props.large ? 5 : 3));
const extraTech = computed(() =>
  Math.max(0, props.project.technologies.length - visibleTech.value.length),
);

const mediaRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);
useParallax(mediaRef, imageRef, { strength: 14 });
</script>

<template>
  <!-- Real NuxtLink so SSG crawlLinks / crawlers see href. -->
  <NuxtLink
    :to="`/projects/${project.slug}`"
    :class="
      cn(
        'glass-surface neon-glow group relative flex h-full flex-col overflow-hidden rounded-2xl',
        props.class,
      )
    "
  >
    <div
      ref="mediaRef"
      :class="
        cn('relative w-full overflow-hidden bg-muted', large ? 'aspect-16/10' : 'aspect-video')
      "
    >
      <div
        v-if="project.thumbnailUrl"
        ref="imageRef"
        class="size-full scale-105 transition-transform duration-500 ease-out"
      >
        <NuxtImg
          :src="project.thumbnailUrl"
          :alt="project.title"
          class="size-full object-cover"
          loading="lazy"
          format="webp"
          quality="75"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div v-else class="bg-card-glow flex size-full items-center justify-center">
        <span class="font-display text-4xl text-primary/30">{{ project.title.charAt(0) }}</span>
      </div>
      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-t from-background/70 via-transparent to-transparent"
        aria-hidden="true"
      />
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <div class="flex items-start justify-between gap-3">
        <h3
          :class="
            cn(
              'font-display font-semibold text-foreground transition-colors group-hover:text-primary',
              large ? 'text-2xl' : 'text-lg',
            )
          "
        >
          {{ project.title }}
        </h3>
        <Icon
          name="lucide:arrow-up-right"
          class="mt-1 size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <p
        v-if="project.excerpt"
        :class="
          cn('text-pretty text-sm text-muted-foreground', large ? 'line-clamp-3' : 'line-clamp-2')
        "
      >
        {{ project.excerpt }}
      </p>

      <div v-if="visibleTech.length" class="mt-auto flex flex-wrap gap-1.5 pt-2">
        <Badge v-for="tech in visibleTech" :key="tech" variant="outline" class="font-mono">
          {{ tech }}
        </Badge>
        <Badge v-if="extraTech > 0" variant="ghost" class="font-mono">+{{ extraTech }}</Badge>
      </div>

      <p v-if="project.projectType === 'professional'" class="text-xs text-muted-foreground">
        Professional Work
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';

const { data: resume, pending, error } = useResume();

// Skill groups, pre-ordered by the backend.
const skillGroups = computed(() =>
  [...(resume.value?.skillGroups ?? [])].sort((a, b) => a.order - b.order),
);

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.07 });
</script>

<template>
  <Section
    label="Capabilities"
    title="Skills & tools"
    description="The technologies I reach for, grouped by what they do."
  >
    <div ref="sectionRef">
      <!-- Loading -->
      <div v-if="pending && skillGroups.length === 0" class="grid gap-5 sm:grid-cols-2">
        <Skeleton v-for="n in 4" :key="n" class="h-40 rounded-2xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl border border-border bg-card p-10 text-center">
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load skills right now.</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="skillGroups.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">Skills are being curated.</p>
      </div>

      <!-- Populated -->
      <div v-else class="grid auto-rows-[1fr] gap-5 sm:grid-cols-2">
        <div
          v-for="group in skillGroups"
          :key="group.id"
          data-reveal
          class="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6"
        >
          <h3 class="font-display text-lg font-semibold text-foreground">{{ group.name }}</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in group.skills"
              :key="skill"
              class="rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground"
            >
              {{ skill }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Section>
</template>

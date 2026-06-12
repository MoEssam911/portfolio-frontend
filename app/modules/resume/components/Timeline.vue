<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import type { Education, Experience, TimelineEntry } from '~/modules/resume/types';

const { data: resume, pending, error } = useResume();

const byOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);

const experiences = computed<TimelineEntry[]>(() =>
  byOrder(resume.value?.experiences ?? []).map((e: Experience) => ({
    id: e.id,
    title: e.title,
    org: e.company,
    location: e.location,
    start: e.startDate,
    end: e.endDate,
    current: e.current,
    bullets: e.bullets ?? [],
  })),
);

const educations = computed<TimelineEntry[]>(() =>
  byOrder(resume.value?.educations ?? []).map((e: Education) => ({
    id: e.id,
    title: e.degree,
    org: e.school,
    location: null,
    start: e.startDate,
    end: e.endDate,
    current: e.current,
    bullets: e.description ? [e.description] : [],
    meta: e.field,
  })),
);

const isEmpty = computed(() => experiences.value.length === 0 && educations.value.length === 0);
const showSkeleton = computed(() => pending.value && isEmpty.value);

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.06 });
</script>

<template>
  <Section
    label="The path so far"
    title="Experience & education"
    description="A chronological view of where I've worked and what I studied."
    class="bg-card/30"
  >
    <div ref="sectionRef">
      <!-- Loading -->
      <div v-if="showSkeleton" class="flex flex-col gap-4">
        <Skeleton v-for="n in 4" :key="n" class="h-28 rounded-2xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl border border-border bg-card p-10 text-center">
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load the timeline right now.</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="isEmpty"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">The timeline is being written.</p>
      </div>

      <!-- Populated -->
      <div v-else class="grid gap-x-16 gap-y-12 lg:grid-cols-2">
        <div v-if="experiences.length" data-reveal>
          <p class="label mb-8 text-muted-foreground">Experience</p>
          <div>
            <TimelineItem
              v-for="(entry, i) in experiences"
              :key="entry.id"
              :entry="entry"
              :last="i === experiences.length - 1"
            />
          </div>
        </div>

        <div v-if="educations.length" data-reveal>
          <p class="label mb-8 text-muted-foreground">Education</p>
          <div>
            <TimelineItem
              v-for="(entry, i) in educations"
              :key="entry.id"
              :entry="entry"
              :last="i === educations.length - 1"
            />
          </div>
        </div>
      </div>
    </div>
  </Section>
</template>

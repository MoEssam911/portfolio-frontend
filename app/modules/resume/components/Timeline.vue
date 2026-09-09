<script setup lang="ts">
import type { Education, Experience, TimelineEntry } from '~/modules/resume/types';

const { data: resume } = useResume();

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
      <div v-if="isEmpty" class="glass-surface rounded-2xl border-dashed p-10 text-center">
        <p class="text-sm text-muted-foreground">The timeline is being written.</p>
      </div>

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

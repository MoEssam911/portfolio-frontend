<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import type { Education, Experience, TimelineEntry } from '~/modules/resume/types';

const { data: resume, pending, error } = useResume();
const { settings } = useSiteSettings();
const { formatDate } = useFormatters();

// Document identity comes from settings; the resume profile supplies the detail.
const name = computed(() => settings.value?.siteTitle || 'Mohamed Essam');
const headline = computed(() => resume.value?.headline || settings.value?.heroSubtitle || '');
const summary = computed(() => resume.value?.summary || '');
const location = computed(() => resume.value?.location || '');
const email = computed(() => settings.value?.contactEmail || '');

const byOrder = <T extends { order: number }>(items: T[] | undefined) =>
  [...(items ?? [])].sort((a, b) => a.order - b.order);

// Experiences + educations normalised onto the shared TimelineEntry shape, pre-sorted.
const experiences = computed<TimelineEntry[]>(() =>
  byOrder(resume.value?.experiences).map((e: Experience) => ({
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
  byOrder(resume.value?.educations).map((e: Education) => ({
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

const skillGroups = computed(() => byOrder(resume.value?.skillGroups));
const certifications = computed(() => byOrder(resume.value?.certifications));
const links = computed(() => byOrder(resume.value?.links));

// Contact line links (email first, then resume links), shown under the name.
const contactItems = computed(() => {
  const items: { label: string; href: string; icon: string; external: boolean }[] = [];
  if (email.value) {
    items.push({
      label: email.value,
      href: `mailto:${email.value}`,
      icon: 'lucide:mail',
      external: false,
    });
  }
  for (const link of links.value) {
    items.push({ label: link.label, href: link.url, icon: 'lucide:link', external: true });
  }
  return items;
});

const isEmpty = computed(
  () =>
    !resume.value ||
    (experiences.value.length === 0 &&
      educations.value.length === 0 &&
      skillGroups.value.length === 0 &&
      certifications.value.length === 0 &&
      !summary.value),
);
const showSkeleton = computed(() => pending.value && !resume.value);

const certRange = (issue: string | null, expiry: string | null) =>
  [issue ? formatDate(issue, 'MMM YYYY') : '', expiry ? formatDate(expiry, 'MMM YYYY') : '']
    .filter(Boolean)
    .join(' — ');
</script>

<template>
  <!-- Loading -->
  <div
    v-if="showSkeleton"
    class="flex flex-col gap-8 rounded-3xl border border-border bg-card p-8 sm:p-12"
  >
    <div class="flex flex-col gap-3">
      <Skeleton class="h-9 w-64" />
      <Skeleton class="h-5 w-80" />
      <Skeleton class="h-4 w-72" />
    </div>
    <Skeleton v-for="n in 3" :key="n" class="h-28 w-full rounded-2xl" />
  </div>

  <!-- Error -->
  <div v-else-if="error" class="rounded-3xl border border-border bg-card p-12 text-center">
    <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
    <p class="mt-3 text-sm text-muted-foreground">Couldn't load the résumé right now.</p>
  </div>

  <!-- Empty -->
  <div
    v-else-if="isEmpty"
    class="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center"
  >
    <Icon name="lucide:file-text" class="mx-auto size-6 text-muted-foreground" />
    <p class="mt-3 text-sm text-muted-foreground">The résumé is being written.</p>
  </div>

  <!-- Populated — the printable sheet. -->
  <article
    v-else
    id="resume-sheet"
    class="flex flex-col gap-12 rounded-3xl border border-border bg-card p-8 sm:p-12"
  >
    <!-- Identity header -->
    <div class="flex flex-col gap-3 border-b border-border pb-8">
      <h2 class="font-display text-3xl text-foreground sm:text-4xl">{{ name }}</h2>
      <p v-if="headline" class="text-lg text-muted-foreground">{{ headline }}</p>
      <p v-if="location" class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon name="lucide:map-pin" class="size-3.5" />
        {{ location }}
      </p>
      <div v-if="contactItems.length" class="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          v-for="item in contactItems"
          :key="item.href"
          :href="item.href"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noopener noreferrer' : undefined"
          class="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <Icon :name="item.icon" class="size-3.5" />
          {{ item.label }}
        </a>
      </div>
    </div>

    <!-- Summary -->
    <section v-if="summary" class="flex flex-col gap-3">
      <p class="label text-primary">Summary</p>
      <p class="text-pretty leading-relaxed text-muted-foreground">{{ summary }}</p>
    </section>

    <!-- Experience -->
    <section v-if="experiences.length" class="flex flex-col gap-6">
      <p class="label text-primary">Experience</p>
      <div>
        <TimelineItem
          v-for="(entry, i) in experiences"
          :key="entry.id"
          :entry="entry"
          :last="i === experiences.length - 1"
        />
      </div>
    </section>

    <!-- Education -->
    <section v-if="educations.length" class="flex flex-col gap-6">
      <p class="label text-primary">Education</p>
      <div>
        <TimelineItem
          v-for="(entry, i) in educations"
          :key="entry.id"
          :entry="entry"
          :last="i === educations.length - 1"
        />
      </div>
    </section>

    <!-- Skills -->
    <section v-if="skillGroups.length" class="flex flex-col gap-6">
      <p class="label text-primary">Skills</p>
      <div class="grid gap-5 sm:grid-cols-2">
        <div v-for="group in skillGroups" :key="group.id" class="flex flex-col gap-3">
          <h3 class="font-display text-base text-foreground">{{ group.name }}</h3>
          <div class="flex flex-wrap gap-2">
            <SkillBadge v-for="skill in group.skills" :key="skill.name" :label="skill.name" />
          </div>
        </div>
      </div>
    </section>

    <!-- Certifications -->
    <section v-if="certifications.length" class="flex flex-col gap-6">
      <p class="label text-primary">Certifications</p>
      <ul class="flex flex-col gap-4">
        <li v-for="cert in certifications" :key="cert.id" class="flex flex-col gap-0.5">
          <div class="flex items-baseline justify-between gap-4">
            <component
              :is="cert.url ? 'a' : 'span'"
              :href="cert.url || undefined"
              :target="cert.url ? '_blank' : undefined"
              :rel="cert.url ? 'noopener noreferrer' : undefined"
              class="font-display text-base text-foreground"
              :class="cert.url && 'transition-colors hover:text-primary'"
            >
              {{ cert.name }}
              <Icon
                v-if="cert.url"
                name="lucide:external-link"
                class="ml-1 inline size-3.5 align-baseline text-muted-foreground"
              />
            </component>
            <span
              v-if="certRange(cert.issueDate, cert.expiryDate)"
              class="shrink-0 font-mono text-xs text-muted-foreground"
            >
              {{ certRange(cert.issueDate, cert.expiryDate) }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground">{{ cert.issuer }}</p>
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const { settings, pending: settingsPending } = useSiteSettings();
const { data: resume, pending: resumePending, error: resumeError } = useResume();

const url = useRequestURL();

const name = computed(() => settings.value?.siteTitle || 'Mohamed Essam');
const role = computed(() => resume.value?.headline || settings.value?.heroSubtitle || '');
const location = computed(() => resume.value?.location || '');
const email = computed(() => settings.value?.contactEmail || '');
const availableForWork = computed(() => settings.value?.availableForWork ?? false);

// Bio — full `about`, split into paragraphs on blank lines (story arc).
const bioParagraphs = computed(() => {
  const text = settings.value?.about?.trim() || '';
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
});
const showBioSkeleton = computed(() => settingsPending.value && !settings.value);

// Stack — every skill across groups, de-duplicated into one dense cloud.
const stack = computed(() => {
  const set = new Set<string>();
  for (const group of resume.value?.skillGroups ?? []) {
    for (const skill of group.skills) set.add(skill.name);
  }
  return [...set];
});
const showStackSkeleton = computed(() => resumePending.value && stack.value.length === 0);

// Owner-authored principles — no backend field; this is brand copy.
const values = [
  {
    icon: 'lucide:target',
    title: 'Precision over polish',
    body: 'Details compound. I sweat the alignment, the easing curve, the empty state — the things people feel before they notice.',
  },
  {
    icon: 'lucide:gauge',
    title: 'Performance is a feature',
    body: 'Fast is a design decision. I budget for it from the first commit, not as a clean-up pass before launch.',
  },
  {
    icon: 'lucide:accessibility',
    title: 'Accessible by default',
    body: 'Keyboard paths, focus states, reduced motion, semantic markup — built in, never bolted on.',
  },
  {
    icon: 'lucide:layers',
    title: 'Systems, not screens',
    body: 'I build tokens and primitives that scale, so the tenth screen is as considered as the first.',
  },
];

const bioRef = ref<HTMLElement>();
useScrollReveal(bioRef, { selector: '[data-reveal]', stagger: 0.1 });

const valuesRef = ref<HTMLElement>();
useScrollReveal(valuesRef, { selector: '[data-reveal]', stagger: 0.07 });

useSeo({
  title: 'About',
  description: `Who I am, how I work, and the path that got me here — ${name.value}.`,
});

// Person JSON-LD — richer than the home page (job title + location).
const personLd = computed(() => {
  const s = settings.value;
  const sameAs = [s?.githubUrl, s?.linkedinUrl, s?.twitterUrl].filter((v): v is string =>
    Boolean(v),
  );
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name.value,
    jobTitle: role.value || undefined,
    description: s?.about || s?.siteDescription || undefined,
    url: `${url.origin}/about`,
    email: email.value || undefined,
    ...(location.value
      ? { address: { '@type': 'PostalAddress', addressLocality: location.value } }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(personLd.value)),
    },
  ],
});
</script>

<template>
  <div>
    <PageHero
      eyebrow="About"
      :title="name"
      :description="[role, location].filter(Boolean).join(' · ')"
    />

    <!-- Bio + featured portrait -->
    <Section>
      <div ref="bioRef" class="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div class="order-2 flex flex-col gap-5 lg:order-1">
          <p data-reveal class="label text-primary">The story</p>

          <template v-if="showBioSkeleton">
            <Skeleton class="h-5 w-full" />
            <Skeleton class="h-5 w-11/12" />
            <Skeleton class="h-5 w-10/12" />
            <Skeleton class="h-5 w-4/5" />
          </template>

          <template v-else-if="bioParagraphs.length">
            <p
              v-for="(paragraph, i) in bioParagraphs"
              :key="i"
              data-reveal
              class="text-pretty text-lg leading-relaxed text-muted-foreground"
            >
              {{ paragraph }}
            </p>
          </template>

          <p v-else data-reveal class="text-pretty text-lg leading-relaxed text-muted-foreground">
            I build interfaces that behave like products — fast, accessible, and considered down to
            the last interaction.
          </p>
        </div>

        <!-- Featured professional portrait (PHOTO SWAP via <Portrait>). -->
        <div data-reveal class="relative order-1 mx-auto w-full max-w-sm lg:order-2">
          <div class="glow-spot absolute -inset-6 -z-10 rounded-full blur-2xl" aria-hidden="true" />
          <div
            class="relative overflow-hidden rounded-3xl border border-primary-border bg-card shadow-glow ring-1 ring-primary/20"
          >
            <!-- PHOTO SWAP: featured About-page portrait. -->
            <Portrait class="aspect-4/5 w-full" :alt="`Portrait of ${name}`" />
          </div>
        </div>
      </div>
    </Section>

    <!-- Timeline (experiences + educations) -->
    <Timeline />

    <!-- Values -->
    <Section label="How I work" title="Principles I build by">
      <div ref="valuesRef" class="grid gap-5 sm:grid-cols-2">
        <div
          v-for="value in values"
          :key="value.title"
          data-reveal
          class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary-border"
        >
          <span
            class="inline-flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-subtle text-primary"
          >
            <Icon :name="value.icon" class="size-5" />
          </span>
          <h3 class="font-display text-lg text-foreground">{{ value.title }}</h3>
          <p class="text-sm leading-relaxed text-muted-foreground">{{ value.body }}</p>
        </div>
      </div>
    </Section>

    <!-- Skills — interactive orbital visualization. -->
    <SkillsOrbit />

    <!-- Stack — flat, de-duplicated technology cloud. -->
    <Section label="Tooling" title="The stack" class="bg-card/30">
      <div v-if="showStackSkeleton" class="flex flex-wrap gap-2.5">
        <Skeleton v-for="n in 14" :key="n" class="h-8 w-20 rounded-lg" />
      </div>

      <div
        v-else-if="resumeError"
        class="rounded-2xl border border-border bg-card p-10 text-center"
      >
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load the stack right now.</p>
      </div>

      <div
        v-else-if="stack.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">The stack is being assembled.</p>
      </div>

      <div v-else class="flex flex-wrap gap-2.5">
        <span
          v-for="skill in stack"
          :key="skill"
          class="rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-sm text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground"
        >
          {{ skill }}
        </span>
      </div>
    </Section>

    <!-- Availability -->
    <section class="py-20 sm:py-28">
      <Container>
        <div
          class="relative overflow-hidden rounded-3xl border border-primary-border bg-card px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          <div class="bg-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

          <div class="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <span
              v-if="availableForWork"
              class="inline-flex items-center gap-2 rounded-full border border-success-muted bg-success-muted px-3 py-1 text-sm text-success-muted-foreground"
            >
              <span class="pulse-dot size-1.5 rounded-full bg-success" aria-hidden="true" />
              Available for work
            </span>
            <span
              v-else
              class="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              <span class="size-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
              Currently engaged — open to conversations
            </span>

            <h2 class="text-balance font-display text-4xl text-foreground sm:text-5xl">
              {{ availableForWork ? "Let's work together." : "Let's stay in touch." }}
            </h2>
            <p class="text-pretty text-lg text-muted-foreground">
              Whether you're scoping a new product or want a second pair of eyes on an existing one,
              I'd love to hear what you're building.
            </p>

            <div class="mt-2 flex flex-wrap items-center justify-center gap-4">
              <NuxtLink
                to="/contact"
                :class="cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 shadow-cta')"
              >
                Start a conversation
                <Icon name="lucide:arrow-right" class="size-4" />
              </NuxtLink>
              <a
                v-if="email"
                :href="`mailto:${email}`"
                :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-6')"
              >
                <Icon name="lucide:mail" class="size-4" />
                {{ email }}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  </div>
</template>

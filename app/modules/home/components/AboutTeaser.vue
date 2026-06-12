<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const { settings, pending } = useSiteSettings();

const about = computed(() => settings.value?.about?.trim() || '');
const availableForWork = computed(() => settings.value?.availableForWork ?? false);

// Keep the teaser tight — a couple of sentences, full story lives on /about.
const teaser = computed(() => {
  const text = about.value;
  if (!text) return '';
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3);
  return sentences.join(' ');
});

const showSkeleton = computed(() => pending.value && !settings.value);

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.1 });
</script>

<template>
  <Section>
    <div ref="sectionRef" class="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <!-- Portrait -->
      <div data-reveal class="relative mx-auto w-full max-w-xs lg:max-w-sm">
        <div class="glow-spot absolute -inset-6 -z-10 rounded-full blur-2xl" aria-hidden="true" />
        <div
          class="relative overflow-hidden rounded-3xl border border-primary-border bg-card shadow-glow ring-1 ring-primary/20"
        >
          <!-- PHOTO SWAP: <Portrait> centralises the placeholder swap point. -->
          <Portrait class="aspect-[4/5] w-full" alt="Portrait of Mohamed Essam" />
        </div>
      </div>

      <!-- Copy -->
      <div class="flex flex-col gap-5">
        <p data-reveal class="label text-primary">About</p>

        <template v-if="showSkeleton">
          <Skeleton class="h-9 w-3/4" />
          <Skeleton class="h-5 w-full" />
          <Skeleton class="h-5 w-11/12" />
          <Skeleton class="h-5 w-4/5" />
        </template>

        <template v-else>
          <h2 data-reveal class="font-display text-3xl text-foreground sm:text-4xl">
            Engineering precision, design sensibility.
          </h2>
          <p
            v-if="teaser"
            data-reveal
            class="text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            {{ teaser }}
          </p>
          <p v-else data-reveal class="text-pretty text-lg leading-relaxed text-muted-foreground">
            I build interfaces that behave like products — fast, accessible, and considered down to
            the last interaction.
          </p>

          <div data-reveal class="mt-2 flex flex-wrap items-center gap-4">
            <NuxtLink to="/about" :class="cn(buttonVariants({ size: 'lg' }), 'h-10 px-5')">
              More about me
              <Icon name="lucide:arrow-right" class="size-4" />
            </NuxtLink>
            <span
              v-if="availableForWork"
              class="inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span class="pulse-dot size-1.5 rounded-full bg-success" aria-hidden="true" />
              Available for work
            </span>
          </div>
        </template>
      </div>
    </div>
  </Section>
</template>

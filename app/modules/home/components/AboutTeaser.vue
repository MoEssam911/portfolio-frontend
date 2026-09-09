<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const { settings } = useSiteSettings();

const about = computed(() => settings.value?.about?.trim() || '');
const name = computed(() => settings.value?.siteTitle || 'Mohamed Essam');

// Tight teaser — full story lives on /about; portrait returns here on home.
const teaser = computed(() => {
  const text = about.value;
  if (!text) return '';
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3);
  return sentences.join(' ');
});

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.1 });
</script>

<template>
  <Section class="relative overflow-hidden">
    <SectionAurora class="-z-10" />
    <div
      ref="sectionRef"
      class="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14"
    >
      <div data-reveal class="relative mx-auto w-full max-w-xs lg:mx-0">
        <div
          class="absolute -inset-5 -z-10 rounded-full bg-[radial-gradient(circle_at_center,var(--lime-glow)_0%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />
        <div class="glass-surface-strong overflow-hidden rounded-3xl p-1.5">
          <div class="overflow-hidden rounded-[1.35rem]">
            <Portrait
              class="aspect-4/5 w-full"
              :alt="`Portrait of ${name}`"
              loading="lazy"
              sizes="(max-width: 1024px) 280px, 320px"
            />
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
        <p data-reveal class="label text-primary">About</p>
        <h2 data-reveal class="mt-3 font-display text-3xl text-foreground sm:text-4xl">
          Engineering with craft and clarity.
        </h2>
        <p
          data-reveal
          class="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground"
        >
          {{
            teaser ||
            'I build interfaces that behave like products — fast, accessible, and considered down to the last interaction.'
          }}
        </p>

        <div
          data-reveal
          class="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
        >
          <NuxtLink to="/about" :class="cn(buttonVariants({ size: 'lg' }), 'h-10 px-5 shadow-cta')">
            More about me
            <Icon name="lucide:arrow-right" class="size-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </Section>
</template>

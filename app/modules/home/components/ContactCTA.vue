<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const { settings } = useSiteSettings();

const email = computed(() => settings.value?.contactEmail || '');

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.08 });
</script>

<template>
  <section ref="sectionRef" class="py-20 sm:py-28">
    <Container>
      <div
        data-reveal
        class="glass-surface-strong relative overflow-hidden rounded-3xl px-6 py-16 text-center ring-1 ring-primary/15 sm:px-12 sm:py-20"
      >
        <!-- Decorative neon aurora + grid behind the copy. -->
        <SectionAurora />
        <div class="bg-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

        <div class="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <p
            class="label glass-surface inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-primary-light"
          >
            <span
              class="size-1.5 rounded-full bg-primary shadow-(--shadow-neon-soft)"
              aria-hidden="true"
            />
            Let's talk
          </p>
          <h2 class="text-balance font-display text-4xl text-foreground sm:text-5xl">
            Let's build something worth shipping.
          </h2>
          <p class="text-pretty text-lg text-muted-foreground">
            Have a project in mind, or just want to compare notes on the craft? My inbox is open.
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
</template>

<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const { settings, heroSubtitle, availableForWork, titleWords, showSkeleton } = useHeroContent();
const { role, location, topSkills } = useHeroStats();

const name = computed(() => settings.value?.siteTitle || 'Mohamed Essam');
const stack = computed(() =>
  topSkills.value.length ? topSkills.value.slice(0, 3).join(' · ') : 'Vue · Nuxt · TypeScript',
);

// CLI-style lines for the status card — all values are real, from the API.
const lines = computed(() => [
  { key: 'name', value: name.value },
  { key: 'role', value: role.value || 'Frontend Engineer' },
  { key: 'stack', value: stack.value },
  { key: 'location', value: location.value || 'Remote' },
]);

const heroRef = ref<HTMLElement>();
useHeroIntro(heroRef, 'home');
</script>

<template>
  <section
    ref="heroRef"
    class="relative flex min-h-[100svh] items-center overflow-hidden"
    aria-label="Introduction"
  >
    <!-- Signature futuristic background — violet aurora + grid, off when reduced. -->
    <AuroraBackground class="-z-10" />

    <Container class="py-28 lg:py-32">
      <div class="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <!-- ── Headline column ─────────────────────────────────────────── -->
        <div class="max-w-xl">
          <template v-if="showSkeleton">
            <Skeleton class="mb-7 h-7 w-44 rounded-full" />
            <Skeleton class="mb-4 h-14 w-full" />
            <Skeleton class="mb-4 h-14 w-4/5" />
            <Skeleton class="mb-9 h-6 w-3/4" />
            <div class="flex gap-4">
              <Skeleton class="h-11 w-36" />
              <Skeleton class="h-11 w-32" />
            </div>
          </template>

          <template v-else>
            <span
              v-if="availableForWork"
              data-hero-reveal
              class="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-subtle px-3.5 py-1.5 text-xs font-medium text-foreground"
            >
              <span class="pulse-dot size-1.5 rounded-full bg-success" aria-hidden="true" />
              Available for work
            </span>

            <h1
              class="text-balance font-display text-5xl font-semibold leading-tight tracking-tightest text-foreground sm:text-6xl lg:text-7xl"
            >
              <span
                v-for="(word, i) in titleWords"
                :key="`${word}-${i}`"
                data-word
                class="mr-[0.22em] inline-block"
              >{{ word }}</span>
            </h1>

            <p data-hero-reveal class="mt-6 max-w-lg text-pretty text-lg text-muted-foreground sm:text-xl">
              {{ heroSubtitle }}
            </p>

            <div data-hero-reveal class="mt-10 flex flex-wrap items-center gap-4">
              <NuxtLink
                to="/projects"
                :class="cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 text-sm shadow-cta')"
              >
                View Work
                <Icon name="lucide:arrow-right" class="size-4" />
              </NuxtLink>
              <NuxtLink
                to="/blog"
                :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-6 text-sm')"
              >
                Read Blog
              </NuxtLink>
            </div>
          </template>
        </div>

        <!-- ── Status card (signature visual — replaces a portrait here) ── -->
        <div data-hero-reveal class="relative mx-auto w-full max-w-md lg:mx-0">
          <div class="glow-spot absolute -inset-6 -z-10 rounded-full blur-2xl" aria-hidden="true" />

          <div
            class="overflow-hidden rounded-2xl border border-primary-border bg-card/80 shadow-glow-strong ring-1 ring-primary/15 backdrop-blur-sm"
          >
            <!-- Title bar -->
            <div class="flex items-center gap-2 border-b border-border px-4 py-3">
              <span class="size-2.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
              <span class="size-2.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
              <span class="size-2.5 rounded-full bg-primary/60" aria-hidden="true" />
              <span class="ml-2 font-mono text-xs text-muted-foreground">~/mohamed-essam</span>
            </div>

            <!-- Body -->
            <div class="space-y-2.5 p-5 font-mono text-sm leading-relaxed sm:p-6">
              <p class="text-muted-foreground">
                <span class="text-primary">$</span> whoami
              </p>
              <p v-for="line in lines" :key="line.key" class="text-muted-foreground">
                <span class="text-primary/70">{{ line.key }}:</span>
                <span class="ml-2 text-foreground">{{ line.value }}</span>
              </p>
              <p class="text-muted-foreground">
                <span class="text-primary/70">status:</span>
                <span class="ml-2" :class="availableForWork ? 'text-success' : 'text-muted-foreground'">
                  {{ availableForWork ? 'open to work' : 'currently engaged' }}
                </span>
                <span
                  class="ml-1 inline-block size-1.5 rounded-full align-middle"
                  :class="availableForWork ? 'bg-success' : 'bg-muted-foreground'"
                  aria-hidden="true"
                />
              </p>
              <p class="flex items-center text-muted-foreground" aria-hidden="true">
                <span class="text-primary">$</span>
                <span class="terminal-caret ml-2 inline-block h-4 w-2 bg-foreground/70" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </section>
</template>

<style scoped>
.terminal-caret {
  animation: terminal-blink 1.1s steps(1) infinite;
}

@keyframes terminal-blink {
  0%,
  50% {
    opacity: 1;
  }
  50.01%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .terminal-caret {
    animation: none;
  }
}
</style>

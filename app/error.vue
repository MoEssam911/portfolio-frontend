<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

const is404 = computed(() => props.error.statusCode === 404);

const heading = computed(() => (is404.value ? 'Page not found' : 'Something broke'));
const blurb = computed(() =>
  is404.value
    ? 'The page you’re after has moved, been unpublished, or never existed. Let’s get you back on track.'
    : 'An unexpected error occurred on our end. Try again, or head back home while we sort it out.',
);

// Error screens should never be indexed.
useSeoMeta({
  title: () => `${props.error.statusCode} — ${heading.value}`,
  robots: 'noindex,nofollow',
});

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <NuxtLayout>
    <Container class="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p
        class="bg-linear-to-b from-foreground to-muted-foreground/30 bg-clip-text font-display text-7xl font-bold leading-none text-transparent sm:text-8xl"
      >
        {{ props.error.statusCode }}
      </p>

      <h1 class="mt-6 font-display text-3xl text-foreground sm:text-4xl">
        {{ heading }}
      </h1>
      <p class="mt-4 max-w-md text-pretty text-muted-foreground">
        {{ blurb }}
      </p>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          :class="cn(buttonVariants({ size: 'lg' }), 'h-10 px-5 shadow-cta')"
          @click="handleError"
        >
          <Icon name="lucide:home" class="size-4" />
          Back home
        </button>
        <NuxtLink
          to="/projects"
          :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-5')"
        >
          <Icon name="lucide:layout-grid" class="size-4" />
          View work
        </NuxtLink>
      </div>
    </Container>
  </NuxtLayout>
</template>

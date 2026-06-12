<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';

const { settings, pending } = useSiteSettings();

const email = computed(() => settings.value?.contactEmail?.trim() || '');
const availableForWork = computed(() => settings.value?.availableForWork ?? false);

const socials = computed(() =>
  [
    { label: 'GitHub', icon: 'lucide:github', url: settings.value?.githubUrl },
    { label: 'LinkedIn', icon: 'lucide:linkedin', url: settings.value?.linkedinUrl },
    { label: 'Twitter / X', icon: 'lucide:twitter', url: settings.value?.twitterUrl },
  ].filter((s): s is { label: string; icon: string; url: string } => Boolean(s.url)),
);

const showSkeleton = computed(() => pending.value && !settings.value);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Availability -->
    <div
      class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
    >
      <span
        class="size-2 rounded-full" :class="[
          availableForWork ? 'pulse-dot bg-success' : 'bg-muted-foreground',
        ]"
        aria-hidden="true"
      />
      <span class="text-muted-foreground">
        {{ availableForWork ? 'Available for new work' : 'Currently at capacity' }}
      </span>
    </div>

    <template v-if="showSkeleton">
      <Skeleton class="h-20 w-full rounded-2xl" />
      <Skeleton class="h-10 w-2/3" />
    </template>

    <template v-else>
      <!-- Direct email -->
      <a
        v-if="email"
        :href="`mailto:${email}`"
        class="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary-border"
      >
        <span
          class="bg-primary-muted flex size-11 shrink-0 items-center justify-center rounded-xl text-primary"
        >
          <Icon name="lucide:mail" class="size-5" />
        </span>
        <span class="flex flex-col">
          <span class="text-sm text-muted-foreground">Email me directly</span>
          <span class="font-medium text-foreground group-hover:text-primary">{{ email }}</span>
        </span>
        <Icon
          name="lucide:arrow-up-right"
          class="ml-auto size-4 text-muted-foreground transition-colors group-hover:text-primary"
        />
      </a>

      <!-- Social links -->
      <div v-if="socials.length" class="flex flex-col gap-3">
        <p class="label text-muted-foreground">Elsewhere</p>
        <div class="flex flex-wrap gap-3">
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground"
          >
            <Icon :name="social.icon" class="size-4" />
            {{ social.label }}
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

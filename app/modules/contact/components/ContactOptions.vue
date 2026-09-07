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
      class="glass-surface inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm"
    >
      <span
        class="size-2 rounded-full"
        :class="[
          availableForWork
            ? 'pulse-dot bg-success shadow-[0_0_8px_var(--color-success)]'
            : 'bg-muted-foreground',
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
        class="glass-surface neon-glow group flex min-h-11 items-center gap-4 rounded-2xl p-5"
      >
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary shadow-(--shadow-neon-soft) transition-shadow group-hover:shadow-(--shadow-neon)"
        >
          <Icon name="lucide:mail" class="size-5" />
        </span>
        <span class="flex min-w-0 flex-col">
          <span class="text-sm text-muted-foreground">Email me directly</span>
          <span
            class="truncate font-medium text-foreground transition-colors group-hover:text-primary-light"
            >{{ email }}</span
          >
        </span>
        <Icon
          name="lucide:arrow-up-right"
          class="ml-auto size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
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
            class="glass-surface neon-glow inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary-light"
          >
            <Icon :name="social.icon" class="size-4" />
            {{ social.label }}
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

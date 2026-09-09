<script setup lang="ts">
const { settings } = useSiteSettings();

const email = computed(() => settings.value?.contactEmail?.trim() || '');

const socials = computed(() =>
  [
    { label: 'GitHub', icon: 'lucide:github', url: settings.value?.githubUrl },
    { label: 'LinkedIn', icon: 'lucide:linkedin', url: settings.value?.linkedinUrl },
    { label: 'Twitter / X', icon: 'lucide:twitter', url: settings.value?.twitterUrl },
  ].filter((s): s is { label: string; icon: string; url: string } => Boolean(s.url)),
);
</script>

<template>
  <div class="flex flex-col gap-6">
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
  </div>
</template>

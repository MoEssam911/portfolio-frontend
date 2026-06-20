<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminSettings } from '~/modules/dashboard/composables/useAdminSettings';
import type { SettingsInput } from '~/modules/settings/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Settings' });

const { settings, pending, error, refresh, save } = useAdminSettings();

async function onSubmit(payload: SettingsInput) {
  await save.mutate(payload);
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader
      title="Settings"
      description="Your site's identity, hero, social links, contact address and availability."
    />

    <!-- Loading -->
    <div v-if="pending && !settings" class="flex flex-col gap-6">
      <Skeleton class="h-40 w-full rounded-2xl" />
      <Skeleton class="h-56 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error && !settings"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your settings</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Empty (no settings row yet) + Populated both render the form. -->
    <template v-else>
      <!-- This affects the live public site — make that explicit. -->
      <p
        class="flex items-start gap-2 rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-muted-foreground"
      >
        <Icon name="lucide:globe" class="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          These settings power the <strong class="text-foreground">public site</strong> — saving
          updates what visitors see (titles, hero, social links, contact address) on the next load.
        </span>
      </p>

      <!-- Empty-state notice: no settings persisted yet. -->
      <p
        v-if="!settings"
        class="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"
      >
        <Icon name="lucide:sparkles" class="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          You haven't set up your site yet. Fill in the fields below and save to create your
          settings — sensible defaults are pre-filled.
        </span>
      </p>

      <section class="rounded-2xl border border-border bg-card/40 p-4 sm:p-6">
        <SettingsForm :initial="settings" :pending="save.pending.value" @submit="onSubmit" />
      </section>
    </template>
  </div>
</template>

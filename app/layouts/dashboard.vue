<script setup lang="ts">
// Authenticated dashboard shell — persistent collapsible Sidebar (desktop) +
// Topbar with the page title, command-palette trigger, and user menu. On mobile
// the sidebar becomes a Sheet opened from the Topbar. Dark-only, semantic tokens.
//
// Auth: dashboard PAGES opt in with `definePageMeta({ middleware: 'auth' })` —
// Nuxt runs route middleware per page, not per layout, so the guard lives there
// (see app/pages/dashboard/index.vue). This layout assumes an authenticated user.

// Surface connectivity loss while editing — admin reads/writes will fail offline,
// so warn proactively (and confirm recovery) rather than only on a failed save.
const { isOnline } = useNetwork();
const toast = useToast();
watch(isOnline, (online, was) => {
  if (!online) {
    toast.warning('You’re offline', 'Changes can’t be saved until you reconnect.');
  } else if (was === false) {
    toast.success('Back online');
  }
});
</script>

<template>
  <div class="flex min-h-dvh bg-background text-foreground">
    <DashboardSidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <DashboardTopbar />
      <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto w-full max-w-6xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

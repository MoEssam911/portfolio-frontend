<script setup lang="ts">
import { cn } from '@/lib/utils';

/**
 * DashboardSidebar — the persistent desktop rail. Collapses to an icon-only rail
 * (state persisted via `useDashboardNav`). Hidden on mobile, where the same nav
 * is shown in a Sheet from the Topbar.
 */
const { collapsed, toggleCollapsed } = useDashboardNav();
</script>

<template>
  <aside
    :class="
      cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-16' : 'w-60',
      )
    "
  >
    <!-- Brand -->
    <div class="flex h-14 items-center gap-2 border-b border-border px-4">
      <NuxtLink to="/dashboard" class="flex items-center gap-2 overflow-hidden">
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
        >
          <Icon name="lucide:command" class="size-4" />
        </span>
        <span v-if="!collapsed" class="font-display text-sm text-foreground">Dashboard</span>
      </NuxtLink>
    </div>

    <!-- Nav -->
    <div class="flex-1 overflow-y-auto p-2">
      <DashboardNavList :collapsed="collapsed" />
    </div>

    <!-- Collapse toggle -->
    <div class="border-t border-border p-2">
      <button
        type="button"
        :class="
          cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && 'justify-center px-2',
          )
        "
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleCollapsed"
      >
        <Icon
          :name="collapsed ? 'lucide:chevrons-right' : 'lucide:chevrons-left'"
          class="size-4.5 shrink-0"
        />
        <span v-if="!collapsed">Collapse</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

/**
 * DashboardTopbar — sticky header: mobile nav trigger (Sheet) + current page
 * title, then the command-palette trigger and the user menu (with logout).
 */
const { title, mobileOpen } = useDashboardNav();
const { show: openCommandMenu } = useCommandMenu();
const { user, logout } = useAuth();

const initial = computed(() =>
  (user.value?.username ?? user.value?.email ?? '?').charAt(0).toUpperCase(),
);
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md"
  >
    <!-- Mobile: open nav sheet -->
    <Sheet v-model:open="mobileOpen">
      <Button
        variant="ghost"
        size="icon"
        class="lg:hidden"
        aria-label="Open navigation"
        @click="mobileOpen = true"
      >
        <Icon name="lucide:menu" class="size-5" />
      </Button>
      <SheetContent side="left" class="w-72 p-0">
        <SheetHeader class="h-14 justify-center border-b border-border px-4 text-left">
          <SheetTitle class="font-display text-sm">Dashboard</SheetTitle>
          <SheetDescription class="sr-only">Dashboard navigation</SheetDescription>
        </SheetHeader>
        <div class="p-2">
          <DashboardNavList @navigate="mobileOpen = false" />
        </div>
      </SheetContent>
    </Sheet>

    <h1 class="min-w-0 flex-1 truncate font-display text-base text-foreground">{{ title }}</h1>

    <!-- Command palette trigger -->
    <Button
      variant="outline"
      size="sm"
      class="h-8 gap-2 text-muted-foreground"
      aria-label="Open command palette"
      @click="openCommandMenu"
    >
      <Icon name="lucide:search" class="size-4" />
      <span class="hidden sm:inline">Search</span>
      <kbd
        class="hidden rounded border border-border bg-muted px-1 font-mono text-[10px] sm:inline-block"
      >
        ⌘K
      </kbd>
    </Button>

    <!-- User menu -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <span
            class="flex size-7 items-center justify-center rounded-full bg-primary-muted text-xs font-medium text-primary"
          >
            {{ initial }}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>
          <div class="flex flex-col">
            <span class="truncate text-sm text-foreground">{{ user?.username }}</span>
            <span class="truncate text-xs font-normal text-muted-foreground">{{
              user?.email
            }}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem as-child>
          <NuxtLink to="/" class="cursor-pointer">
            <Icon name="lucide:external-link" />
            View site
          </NuxtLink>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" class="cursor-pointer" @select="logout">
          <Icon name="lucide:log-out" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>

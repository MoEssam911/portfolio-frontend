<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const route = useRoute();
const { show: showCommandMenu } = useCommandMenu();
const { y } = useWindowScroll();

const scrolled = computed(() => y.value > 8);
const mobileOpen = ref(false);

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`);

// Close the mobile sheet whenever navigation happens.
watch(
  () => route.path,
  () => (mobileOpen.value = false),
);
</script>

<template>
  <header class="sticky top-0 z-40 w-full pt-3 sm:pt-4">
    <Container>
      <div
        :class="
          cn(
            'glass-surface flex h-14 items-center justify-between gap-4 rounded-2xl px-3 pl-4 transition-all duration-300 sm:px-4',
            scrolled
              ? 'shadow-[var(--glass-shadow),0_0_0_1px_var(--lime-line),inset_0_1px_0_0_var(--glass-highlight)]'
              : '',
          )
        "
      >
        <NuxtLink
          to="/"
          class="group flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppLogo mark-only />
          <span class="text-gradient font-display text-base font-semibold tracking-tight">
            Mohamed Essam
          </span>
        </NuxtLink>

        <!-- Desktop navigation -->
        <nav
          class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          <NuxtLink
            v-for="link in PRIMARY_NAV"
            :key="link.to"
            :to="link.to"
            :aria-current="isActive(link.to) ? 'page' : undefined"
            :class="
              cn(
                'group relative py-1 text-sm transition-colors hover:text-foreground',
                isActive(link.to) ? 'text-foreground' : 'text-muted-foreground',
              )
            "
          >
            {{ link.label }}
            <span
              :class="
                cn(
                  'absolute -bottom-1 left-0 h-px rounded-full bg-primary shadow-[0_0_8px_var(--lime-glow),0_0_2px_var(--color-primary)] transition-all duration-300 ease-out',
                  isActive(link.to)
                    ? 'w-full opacity-100'
                    : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100',
                )
              "
              aria-hidden="true"
            />
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Command palette trigger (⌘K). Glass pill on desktop, icon on mobile. -->
          <button
            type="button"
            aria-label="Search (press Command K)"
            class="hidden h-9 items-center gap-2 rounded-full border border-border bg-glass py-1 pl-3 pr-1.5 text-sm text-muted-foreground outline-none backdrop-blur-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
            @click="showCommandMenu"
          >
            <Icon name="lucide:search" class="size-3.5" />
            <span class="hidden lg:inline">Search</span>
            <kbd
              class="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] shadow-none"
              >⌘ K</kbd
            >
          </button>
          <Button
            variant="ghost"
            size="icon"
            class="size-11 sm:hidden"
            aria-label="Search"
            @click="showCommandMenu"
          >
            <Icon name="lucide:search" class="size-5" />
          </Button>

          <NuxtLink
            to="/contact"
            :class="
              cn(
                buttonVariants({ size: 'sm' }),
                'neon-glow h-9 border-none px-4 shadow-cta outline-none',
              )
            "
          >
            Contact me
          </NuxtLink>

          <!-- Mobile menu -->
          <Sheet v-model:open="mobileOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="size-11 md:hidden" aria-label="Open menu">
                <Icon name="lucide:menu" class="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              class="w-4/5 max-w-xs border-l border-border bg-background-elevated/85 backdrop-blur-xl"
            >
              <SheetHeader class="p-6 pb-0">
                <SheetTitle class="text-left">
                  <AppLogo size="sm" mark-only />
                </SheetTitle>
                <SheetDescription class="sr-only">Site navigation</SheetDescription>
              </SheetHeader>

              <nav class="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
                <NuxtLink
                  v-for="(link, index) in PRIMARY_NAV"
                  :key="link.to"
                  :to="link.to"
                  :aria-current="isActive(link.to) ? 'page' : undefined"
                  :style="{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }"
                  class="animate-in fade-in slide-in-from-right-2 flex min-h-11 items-center rounded-xl px-3 py-3 font-display text-lg transition-colors"
                  :class="
                    isActive(link.to)
                      ? 'border border-primary-border bg-primary-muted text-foreground'
                      : 'text-muted-foreground hover:bg-glass hover:text-foreground'
                  "
                >
                  {{ link.label }}
                </NuxtLink>
              </nav>

              <div class="mt-auto flex flex-col gap-3 p-6">
                <NuxtLink to="/contact" :class="cn(buttonVariants({ size: 'lg' }), 'shadow-cta')">
                  Contact me
                </NuxtLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Container>
  </header>
</template>

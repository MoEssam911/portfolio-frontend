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
const { settings } = useSiteSettings();
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
  <header
    :class="
      cn(
        'sticky top-0 z-40 w-full transition-colors duration-300',
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )
    "
  >
    <Container class="flex h-16 items-center justify-between gap-4">
      <NuxtLink
        to="/"
        class="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Home"
      >
        <AppLogo mark-only />
      </NuxtLink>

      <!-- Desktop navigation -->
      <nav class="hidden items-center gap-8 md:flex" aria-label="Main navigation">
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
                'absolute -bottom-0.5 left-0 h-px bg-primary transition-all duration-300 ease-out',
                isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full',
              )
            "
          />
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <!-- Command palette trigger (⌘K). Full pill on desktop, icon on mobile. -->
        <button
          type="button"
          aria-label="Search (press Command K)"
          class="hidden items-center gap-2 rounded-full border border-border bg-card/60 py-1 pl-3 pr-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          @click="showCommandMenu"
        >
          <Icon name="lucide:search" class="size-3.5" />
          <span class="hidden lg:inline">Search</span>
          <kbd
            class="rounded border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-none"
            >⌘ K</kbd
          >
        </button>
        <Button
          variant="ghost"
          size="icon"
          class="sm:hidden"
          aria-label="Search"
          @click="showCommandMenu"
        >
          <Icon name="lucide:search" class="size-5" />
        </Button>

        <NuxtLink
          to="/contact"
          :class="cn(buttonVariants({ size: 'sm' }), 'hidden shadow-cta sm:inline-flex')"
        >
          Hire me
        </NuxtLink>

        <!-- Mobile menu -->
        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="md:hidden" aria-label="Open menu">
              <Icon name="lucide:menu" class="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-4/5 max-w-xs">
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
                class="animate-in fade-in slide-in-from-right-2 rounded-lg px-3 py-3 font-display text-lg transition-colors"
                :class="
                  isActive(link.to)
                    ? 'bg-primary-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                "
              >
                {{ link.label }}
              </NuxtLink>
            </nav>

            <div class="mt-auto flex flex-col gap-3 p-6">
              <span
                v-if="settings?.availableForWork"
                class="inline-flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span class="pulse-dot size-1.5 rounded-full bg-success" aria-hidden="true" />
                Available for work
              </span>
              <NuxtLink to="/contact" :class="cn(buttonVariants({ size: 'lg' }), 'shadow-cta')">
                Hire me
              </NuxtLink>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Container>
  </header>
</template>

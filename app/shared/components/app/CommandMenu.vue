<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui';

import { cn } from '@/lib/utils';

interface CommandItem {
  group: string;
  label: string;
  sublabel?: string;
  to: string;
  icon: string;
}

const { open, hide } = useCommandMenu();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;

const query = ref('');
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement>();
const listRef = ref<HTMLElement>();

// ── Global shortcut: ⌘K / Ctrl+K toggles, "/" opens when not typing. ──────────
useEventListener('keydown', (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  const typing = target?.matches('input, textarea, [contenteditable="true"]');

  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    open.value = !open.value;
  } else if (e.key === '/' && !open.value && !typing) {
    e.preventDefault();
    open.value = true;
  }
});

// ── Content, fetched client-side the first time the palette opens. ────────────
const projects = ref<Array<{ slug: string; title: string }>>([]);
const posts = ref<Array<{ slug: string; title: string }>>([]);
const loaded = ref(false);

async function loadContent() {
  if (loaded.value) return;
  loaded.value = true;
  const [pr, po] = await Promise.allSettled([
    $fetch<{ data: Array<{ slug: string; title: string }> }>(`${apiBase}/projects`, {
      query: { limit: 100 },
    }),
    $fetch<{ data: Array<{ slug: string; title: string }> }>(`${apiBase}/blogs`, {
      query: { limit: 100 },
    }),
  ]);
  if (pr.status === 'fulfilled') projects.value = pr.value?.data ?? [];
  if (po.status === 'fulfilled') posts.value = po.value?.data ?? [];
}

const NAV: CommandItem[] = [
  { group: 'Navigation', label: 'Home', to: '/', icon: 'lucide:home' },
  { group: 'Navigation', label: 'Work', to: '/projects', icon: 'lucide:layout-grid' },
  { group: 'Navigation', label: 'About', to: '/about', icon: 'lucide:user' },
  { group: 'Navigation', label: 'Blog', to: '/blog', icon: 'lucide:newspaper' },
  { group: 'Navigation', label: 'Résumé', to: '/resume', icon: 'lucide:file-text' },
  { group: 'Navigation', label: 'Contact', to: '/contact', icon: 'lucide:mail' },
];

const match = (text: string, q: string) => text.toLowerCase().includes(q.toLowerCase());

// Flat, ordered list — the single source of truth for keyboard indexing.
const items = computed<CommandItem[]>(() => {
  const q = query.value.trim();
  const nav = q ? NAV.filter((n) => match(n.label, q)) : NAV;
  const proj = projects.value
    .filter((p) => !q || match(p.title, q))
    .slice(0, 6)
    .map<CommandItem>((p) => ({
      group: 'Projects',
      label: p.title,
      to: `/projects/${p.slug}`,
      icon: 'lucide:folder-open',
    }));
  const blog = posts.value
    .filter((p) => !q || match(p.title, q))
    .slice(0, 6)
    .map<CommandItem>((p) => ({
      group: 'Blog',
      label: p.title,
      to: `/blog/${p.slug}`,
      icon: 'lucide:file-text',
    }));
  return [...nav, ...proj, ...blog];
});

// Render grouped while keeping each item's flat index for highlight/keyboard.
const groups = computed(() => {
  const out: Array<{ name: string; items: Array<{ item: CommandItem; index: number }> }> = [];
  items.value.forEach((item, index) => {
    let g = out.find((x) => x.name === item.group);
    if (!g) {
      g = { name: item.group, items: [] };
      out.push(g);
    }
    g.items.push({ item, index });
  });
  return out;
});

function clampActive() {
  if (activeIndex.value >= items.value.length) activeIndex.value = Math.max(0, items.value.length - 1);
}
watch(query, () => {
  activeIndex.value = 0;
});
watch(items, clampActive);

async function select(item?: CommandItem) {
  const target = item ?? items.value[activeIndex.value];
  if (!target) return;
  hide();
  await navigateTo(target.to);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % Math.max(1, items.value.length);
    scrollActiveIntoView();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + items.value.length) % Math.max(1, items.value.length);
    scrollActiveIntoView();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    void select();
  }
}

function scrollActiveIntoView() {
  void nextTick(() => {
    listRef.value
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex.value}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  });
}

// Reset + focus on open; load content lazily.
watch(open, (isOpen) => {
  if (!isOpen) return;
  query.value = '';
  activeIndex.value = 0;
  void loadContent();
  void nextTick(() => inputRef.value?.focus());
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      />
      <DialogContent
        class="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-modal outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        @keydown="onKeydown"
      >
        <VisuallyHidden>
          <DialogTitle>Command menu</DialogTitle>
          <DialogDescription>Search projects, posts, and pages, then press Enter to go.</DialogDescription>
        </VisuallyHidden>

        <!-- Search input -->
        <div class="flex items-center gap-3 border-b border-border px-4">
          <Icon name="lucide:search" class="size-4 shrink-0 text-muted-foreground" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Search projects, posts, pages…"
            class="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            aria-label="Search the site"
          />
          <kbd
            class="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block"
          >
            ESC
          </kbd>
        </div>

        <!-- Results -->
        <div ref="listRef" class="max-h-[60vh] overflow-y-auto p-2">
          <p v-if="!items.length" class="px-3 py-8 text-center text-sm text-muted-foreground">
            No results for "{{ query }}".
          </p>

          <div v-for="group in groups" :key="group.name" class="mb-1 last:mb-0">
            <p
              class="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {{ group.name }}
            </p>
            <button
              v-for="entry in group.items"
              :key="entry.item.to"
              type="button"
              :data-index="entry.index"
              :class="
                cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  entry.index === activeIndex
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60',
                )
              "
              @mousemove="activeIndex = entry.index"
              @click="select(entry.item)"
            >
              <Icon :name="entry.item.icon" class="size-4 shrink-0 text-muted-foreground" />
              <span class="truncate">{{ entry.item.label }}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

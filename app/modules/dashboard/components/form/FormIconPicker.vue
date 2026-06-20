<script setup lang="ts">
import { useField } from 'vee-validate';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import FieldShell from './FieldShell.vue';

/**
 * FormIconPicker — choose a Lucide icon for a resource (Services use it). Stores
 * the FULL `@nuxt/icon` id (e.g. `lucide:server`) so the value can be rendered
 * directly by `<Icon :name>` on the public site (ServiceCard does exactly that).
 *
 * It offers a searchable grid of common, service-relevant Lucide icons plus a
 * free-text fallback so any valid Lucide name can be entered (the curated set is
 * a convenience, not a hard limit). Bound by `name`; must live in a <FormShell>.
 * The field value is `string | null` (null = no icon → the card falls back to a
 * default glyph).
 */
const props = defineProps<{
  name: string;
  label?: string;
  description?: string;
}>();

const { value, errorMessage } = useField<string | null>(() => props.name);

const id = useId();

// A curated, searchable set of common service / portfolio icons. The user can
// also type any other Lucide name in the custom field below the grid.
const CURATED = [
  'server',
  'code',
  'code-2',
  'terminal',
  'database',
  'cloud',
  'cloud-cog',
  'globe',
  'layout',
  'layout-dashboard',
  'layout-grid',
  'palette',
  'pen-tool',
  'figma',
  'smartphone',
  'tablet',
  'monitor',
  'cpu',
  'box',
  'boxes',
  'package',
  'rocket',
  'zap',
  'gauge',
  'activity',
  'line-chart',
  'bar-chart-3',
  'pie-chart',
  'trending-up',
  'search',
  'shopping-cart',
  'credit-card',
  'shield',
  'shield-check',
  'lock',
  'key',
  'plug',
  'plug-zap',
  'workflow',
  'git-branch',
  'git-merge',
  'container',
  'wrench',
  'settings',
  'sliders-horizontal',
  'wand-sparkles',
  'sparkles',
  'bot',
  'brain',
  'brain-circuit',
  'message-square',
  'mail',
  'send',
  'megaphone',
  'users',
  'user-check',
  'briefcase',
  'file-text',
  'book-open',
  'graduation-cap',
  'lightbulb',
  'target',
  'compass',
  'map',
  'camera',
  'image',
  'video',
  'music',
  'mic',
  'headphones',
  'feather',
  'accessibility',
  'languages',
] as const;

const open = ref(false);
const search = ref('');
const custom = ref('');

/** Strip the `lucide:` prefix for display/search; null when unset. */
const currentName = computed(() => value.value?.replace(/^lucide:/, '') ?? null);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return CURATED as readonly string[];
  return CURATED.filter((n) => n.includes(q));
});

function openPicker() {
  search.value = '';
  custom.value = currentName.value ?? '';
  open.value = true;
}

function choose(name: string) {
  value.value = `lucide:${name}`;
  open.value = false;
}

function applyCustom() {
  const name = custom.value
    .trim()
    .toLowerCase()
    .replace(/^lucide:/, '');
  if (!name) return;
  choose(name);
}

function clear() {
  value.value = null;
}

const describedBy = computed(() =>
  errorMessage.value ? `${id}-error` : props.description ? `${id}-description` : undefined,
);
</script>

<template>
  <FieldShell :id="id" :label="label" :description="description" :error="errorMessage">
    <div class="flex items-center gap-3" :aria-describedby="describedBy">
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground"
      >
        <Icon v-if="value" :name="value" class="size-5" />
        <Icon v-else name="lucide:image-off" class="size-5 text-muted-foreground" />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" @click="openPicker">
          <Icon name="lucide:shapes" class="size-4" />
          {{ value ? 'Change icon' : 'Choose icon' }}
        </Button>
        <span v-if="currentName" class="font-mono text-xs text-muted-foreground">{{
          currentName
        }}</span>
        <Button
          v-if="value"
          type="button"
          variant="ghost"
          size="sm"
          class="text-muted-foreground"
          @click="clear"
        >
          Remove
        </Button>
      </div>
    </div>
  </FieldShell>

  <Dialog :open="open" @update:open="open = $event">
    <DialogContent class="flex max-h-[80vh] flex-col gap-4 sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Choose an icon</DialogTitle>
        <DialogDescription> Pick a Lucide icon, or type any Lucide name below. </DialogDescription>
      </DialogHeader>

      <div class="relative">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="search"
          type="search"
          placeholder="Search icons…"
          class="h-9 pl-8"
          aria-label="Search icons"
        />
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <div v-if="filtered.length" class="grid grid-cols-6 gap-2 sm:grid-cols-8">
          <button
            v-for="iconName in filtered"
            :key="iconName"
            type="button"
            :title="iconName"
            :aria-label="iconName"
            class="flex aspect-square items-center justify-center rounded-lg border transition-colors hover:border-primary-border hover:bg-accent"
            :class="
              currentName === iconName
                ? 'border-primary bg-primary-subtle text-primary'
                : 'border-border text-foreground'
            "
            @click="choose(iconName)"
          >
            <Icon :name="`lucide:${iconName}`" class="size-5" />
          </button>
        </div>
        <p v-else class="px-2 py-8 text-center text-sm text-muted-foreground">
          No curated icon matches “{{ search }}”. Type the exact Lucide name below.
        </p>
      </div>

      <DialogFooter
        class="flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex w-full items-center gap-2 sm:w-auto">
          <Input
            v-model="custom"
            placeholder="custom-lucide-name"
            class="h-9 font-mono text-sm"
            aria-label="Custom Lucide icon name"
            @keydown.enter.prevent="applyCustom"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            :disabled="!custom.trim()"
            @click="applyCustom"
          >
            Use
          </Button>
        </div>
        <Button type="button" variant="ghost" @click="open = false">Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

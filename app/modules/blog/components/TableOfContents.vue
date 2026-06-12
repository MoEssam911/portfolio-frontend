<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { PostHeading } from '~/modules/blog/composables/usePostContent';

interface Props {
  headings: PostHeading[];
}

const props = defineProps<Props>();

const activeId = ref<string | null>(null);
const reduced = useReducedMotion();

let observer: IntersectionObserver | null = null;

function observe() {
  observer?.disconnect();
  if (!props.headings.length || typeof IntersectionObserver === 'undefined') return;

  observer = new IntersectionObserver(
    (entries) => {
      // Track the topmost heading currently intersecting the upper viewport band.
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id;
          break;
        }
      }
    },
    { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
  );

  for (const h of props.headings) {
    const el = document.getElementById(h.id);
    if (el) observer.observe(el);
  }
}

function scrollTo(id: string, e: MouseEvent) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: reduced.value ? 'auto' : 'smooth' });
  activeId.value = id;
  history.replaceState(null, '', `#${id}`);
}

onMounted(async () => {
  await nextTick();
  observe();
});

// Re-observe when a client-side post change swaps the heading set.
watch(() => props.headings, () => nextTick().then(observe));

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <nav v-if="headings.length" aria-label="Table of contents" class="flex flex-col gap-3">
    <p class="label text-muted-foreground">On this page</p>
    <ul class="flex flex-col gap-1 border-l border-border">
      <li v-for="h in headings" :key="h.id">
        <a
          :href="`#${h.id}`"
          :class="
            cn(
              '-ml-px block border-l-2 py-1 text-sm transition-colors',
              h.level === 3 ? 'pl-6' : 'pl-4',
              activeId === h.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )
          "
          @click="scrollTo(h.id, $event)"
        >
          {{ h.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface Props {
  images: string[];
}

const props = defineProps<Props>();

const open = ref(false);
const activeIndex = ref(0);

const activeImage = computed(() => props.images[activeIndex.value] ?? null);

function openAt(index: number) {
  activeIndex.value = index;
  open.value = true;
}

function step(delta: number) {
  const count = props.images.length;
  if (count === 0) return;
  activeIndex.value = (activeIndex.value + delta + count) % count;
}

// Arrow-key navigation while the lightbox is open.
function onKeydown(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === 'ArrowRight') step(1);
  else if (e.key === 'ArrowLeft') step(-1);
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// Staggered scroll reveal as the gallery enters the viewport.
const gridRef = ref<HTMLElement>();
useScrollReveal(gridRef, { selector: '[data-reveal]', stagger: 0.06 });
</script>

<template>
  <div v-if="images.length">
    <div ref="gridRef" class="grid gap-4 sm:grid-cols-2">
      <ProjectGalleryTile
        v-for="(image, i) in images"
        :key="image"
        :src="image"
        :index="i"
        :wide="i === 0 && images.length > 1"
        data-reveal
        @open="openAt"
      />
    </div>

    <!-- Lightbox -->
    <Dialog v-model:open="open">
      <DialogContent
        class="glass-surface-strong w-full max-w-[calc(100%-2rem)] gap-3 p-3 sm:max-w-4xl"
      >
        <DialogTitle class="sr-only">Project gallery image</DialogTitle>

        <div class="relative overflow-hidden rounded-xl bg-muted/40">
          <img
            v-if="activeImage"
            :src="activeImage"
            alt="Gallery image"
            class="max-h-[75vh] w-full object-contain"
            decoding="async"
          />

          <template v-if="images.length > 1">
            <button
              type="button"
              aria-label="Previous image"
              class="glass-surface-strong neon-glow absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-colors"
              @click="step(-1)"
            >
              <Icon name="lucide:chevron-left" class="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              class="glass-surface-strong neon-glow absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-colors"
              @click="step(1)"
            >
              <Icon name="lucide:chevron-right" class="size-5" />
            </button>
          </template>
        </div>

        <p v-if="images.length > 1" class="text-center font-mono text-xs text-muted-foreground">
          {{ activeIndex + 1 }} / {{ images.length }}
        </p>
      </DialogContent>
    </Dialog>
  </div>
</template>

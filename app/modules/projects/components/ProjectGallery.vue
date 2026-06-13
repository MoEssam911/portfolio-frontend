<script setup lang="ts">
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { ProjectGalleryImage } from '~/modules/projects/types';

interface Props {
  images: ProjectGalleryImage[];
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
</script>

<template>
  <div v-if="images.length">
    <div class="grid gap-4 sm:grid-cols-2">
      <button
        v-for="(image, i) in images"
        :key="image.id"
        type="button"
        class="group relative overflow-hidden rounded-2xl border border-border bg-muted transition-colors hover:border-primary-border"
        :class="i === 0 && images.length > 1 ? 'sm:col-span-2' : ''"
        @click="openAt(i)"
      >
        <img
          :src="image.media.url"
          :alt="image.media.alt || `Gallery image ${i + 1}`"
          class="aspect-16/10 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <span
          class="pointer-events-none absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-background/70 p-2 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
        >
          <Icon name="lucide:maximize-2" class="size-4" />
        </span>
      </button>
    </div>

    <!-- Lightbox -->
    <Dialog v-model:open="open">
      <DialogContent class="w-full max-w-[calc(100%-2rem)] gap-3 bg-card p-3 sm:max-w-4xl">
        <DialogTitle class="sr-only">Project gallery image</DialogTitle>

        <div class="relative overflow-hidden rounded-xl bg-muted">
          <img
            v-if="activeImage"
            :src="activeImage.media.url"
            :alt="activeImage.media.alt || 'Gallery image'"
            class="max-h-[75vh] w-full object-contain"
            decoding="async"
          />

          <template v-if="images.length > 1">
            <button
              type="button"
              aria-label="Previous image"
              class="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background"
              @click="step(-1)"
            >
              <Icon name="lucide:chevron-left" class="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              class="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background"
              @click="step(1)"
            >
              <Icon name="lucide:chevron-right" class="size-5" />
            </button>
          </template>
        </div>

        <p v-if="activeImage?.media.caption" class="px-1 text-center text-sm text-muted-foreground">
          {{ activeImage.media.caption }}
        </p>
        <p v-if="images.length > 1" class="text-center font-mono text-xs text-muted-foreground">
          {{ activeIndex + 1 }} / {{ images.length }}
        </p>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from '~/modules/dashboard/components/media/MediaCard.vue';
import MediaEditDialog from '~/modules/dashboard/components/media/MediaEditDialog.vue';
import MediaUploadZone from '~/modules/dashboard/components/media/MediaUploadZone.vue';
import { useMedia } from '~/modules/dashboard/composables/useMedia';
import type { MediaItem } from '~/shared/types/api';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Media' });

const { items, meta, page, pending, error, refresh, update, removeWithConfirm } = useMedia();

const search = ref('');
const filteredItems = computed<MediaItem[]>(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((m) =>
    [m.originalName, m.alt, m.caption]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q)),
  );
});

const totalPages = computed(() => meta.value?.totalPages ?? 1);
const canPrev = computed(() => page.value > 1);
const canNext = computed(() => page.value < totalPages.value);

const isEmpty = computed(() => !pending.value && !error.value && items.value.length === 0);

// Edit dialog
const editOpen = ref(false);
const editing = ref<MediaItem | null>(null);

function onEdit(media: MediaItem) {
  editing.value = media;
  editOpen.value = true;
}

async function onEditSubmit(values: { alt: string; caption: string }) {
  if (!editing.value) return;
  const result = await update.mutate({ id: editing.value.id, input: values });
  if (result) editOpen.value = false;
}

function onUploaded() {
  refresh();
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader
      title="Media"
      description="Upload and manage the images and files used across your site."
    />

    <!-- Upload -->
    <MediaUploadZone @uploaded="onUploaded" />

    <!-- Toolbar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-xs">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="search"
          type="search"
          placeholder="Search this page…"
          class="h-9 pl-8"
          aria-label="Search media"
        />
      </div>
      <p v-if="meta" class="text-sm text-muted-foreground">
        {{ meta.total }} file{{ meta.total === 1 ? '' : 's' }}
      </p>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your media</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Loading -->
    <div
      v-else-if="pending"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    >
      <div v-for="n in 12" :key="`media-sk-${n}`" class="flex flex-col gap-2">
        <Skeleton class="aspect-square w-full rounded-xl" />
        <Skeleton class="h-3 w-3/4" />
      </div>
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="isEmpty"
      icon="lucide:image"
      title="No media yet"
      description="Drag files onto the upload area above, or click to browse."
    />

    <!-- Empty search -->
    <EmptyState
      v-else-if="filteredItems.length === 0"
      icon="lucide:search-x"
      title="No matches on this page"
      description="Try a different search term, or page through to find the file."
    />

    <!-- Populated -->
    <template v-else>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <MediaCard
          v-for="media in filteredItems"
          :key="media.id"
          :media="media"
          @edit="onEdit"
          @remove="removeWithConfirm"
        />
      </div>

      <!-- Pager -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-3 text-sm text-muted-foreground"
      >
        <Button variant="outline" size="sm" :disabled="!canPrev" @click="page--">
          <Icon name="lucide:chevron-left" class="size-4" />
          Previous
        </Button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <Button variant="outline" size="sm" :disabled="!canNext" @click="page++">
          Next
          <Icon name="lucide:chevron-right" class="size-4" />
        </Button>
      </div>
    </template>

    <!-- Edit dialog -->
    <MediaEditDialog
      v-model:open="editOpen"
      :media="editing"
      :pending="update.pending.value"
      @submit="onEditSubmit"
    />
  </div>
</template>

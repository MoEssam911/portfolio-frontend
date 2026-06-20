<script setup lang="ts">
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatFileSize } from '~/modules/dashboard/composables/useMedia';
import type { MediaItem } from '~/shared/types/api';

/**
 * MediaEditDialog — edit a single file's `alt` + `caption`. Presentational: the
 * parent owns the mutation and passes `pending`; this dialog only collects values
 * and emits `submit`. `v-model:open` controls visibility.
 */
const props = defineProps<{
  open: boolean;
  media: MediaItem | null;
  pending?: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [value: { alt: string; caption: string }];
}>();

const alt = ref('');
const caption = ref('');

// Re-seed the form whenever a different file is opened for editing.
watch(
  () => props.media,
  (media) => {
    alt.value = media?.alt ?? '';
    caption.value = media?.caption ?? '';
  },
  { immediate: true },
);

const isImage = computed(
  () => props.media?.type === 'IMAGE' || props.media?.mimeType.startsWith('image/'),
);

function onSubmit() {
  emit('submit', { alt: alt.value.trim(), caption: caption.value.trim() });
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit details</DialogTitle>
        <DialogDescription>
          Set the alt text and caption used wherever this file appears.
        </DialogDescription>
      </DialogHeader>

      <div v-if="media" class="flex flex-col gap-4">
        <!-- Preview + meta -->
        <div class="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
          <div class="size-14 shrink-0 overflow-hidden rounded-md bg-muted/40">
            <img
              v-if="isImage"
              :src="media.url"
              :alt="media.alt ?? media.originalName ?? ''"
              class="size-full object-cover"
            />
            <div v-else class="flex size-full items-center justify-center text-muted-foreground">
              <Icon name="lucide:file-text" class="size-5" />
            </div>
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm text-foreground">{{ media.originalName ?? 'Untitled' }}</p>
            <p class="text-xs text-muted-foreground">
              {{ media.mimeType }} · {{ formatFileSize(media.size) }}
            </p>
          </div>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <div class="flex flex-col gap-1.5">
            <Label for="media-alt">Alt text</Label>
            <Input
              id="media-alt"
              v-model="alt"
              placeholder="Describe the image for screen readers"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="media-caption">Caption</Label>
            <Textarea
              id="media-caption"
              v-model="caption"
              rows="3"
              placeholder="Optional caption"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              :disabled="pending"
              @click="emit('update:open', false)"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="pending">
              <Icon v-if="pending" name="lucide:loader-circle" class="size-4 animate-spin" />
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>

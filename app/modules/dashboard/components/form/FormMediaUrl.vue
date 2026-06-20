<script setup lang="ts">
import { useField } from 'vee-validate';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MediaItem } from '~/shared/types/api';

import MediaPicker from '../media/MediaPicker.vue';
import FieldShell from './FieldShell.vue';

/**
 * FormMediaUrl — a URL field bound by `name` that can EITHER be typed directly OR
 * filled by picking an uploaded file from the media library (the picker writes the
 * selected item's public `url` into the field). Used for `resumeFileUrl` on the
 * Settings page, where the value stored is a URL (not a media id). Must live
 * inside a <FormShell>.
 */
const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    pickerTitle?: string;
    required?: boolean;
    disabled?: boolean;
  }>(),
  { pickerTitle: 'Select a file' },
);

const { value, errorMessage, handleBlur } = useField<string | undefined>(() => props.name);

const id = useId();
const describedBy = computed(() =>
  errorMessage.value ? `${id}-error` : props.description ? `${id}-description` : undefined,
);

function onSelect({ items }: { ids: string[]; items: MediaItem[] }) {
  const picked = items[0];
  if (picked) value.value = picked.url;
}

function clear() {
  value.value = '';
}
</script>

<template>
  <FieldShell
    :id="id"
    :label="label"
    :description="description"
    :error="errorMessage"
    :required="required"
  >
    <div class="flex items-center gap-2">
      <Input
        :id="id"
        v-model="value"
        type="url"
        :placeholder="placeholder"
        :disabled="disabled"
        class="h-9"
        :aria-invalid="Boolean(errorMessage) || undefined"
        :aria-describedby="describedBy"
        @blur="handleBlur"
      />
      <MediaPicker :title="pickerTitle" @select="onSelect">
        <template #default="{ open }">
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="h-9 shrink-0"
            :disabled="disabled"
            @click="open"
          >
            <Icon name="lucide:folder-open" class="size-4" />
            Browse
          </Button>
        </template>
      </MediaPicker>
      <Button
        v-if="value"
        type="button"
        variant="ghost"
        size="icon-sm"
        class="shrink-0 text-muted-foreground hover:text-destructive"
        aria-label="Clear file"
        title="Clear"
        :disabled="disabled"
        @click="clear"
      >
        <Icon name="lucide:x" class="size-4" />
      </Button>
    </div>
  </FieldShell>
</template>

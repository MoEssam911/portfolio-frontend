<script setup lang="ts">
import { useField } from 'vee-validate';

import { cn } from '@/lib/utils';

import FieldShell from './FieldShell.vue';

/**
 * FormTagInput — edits a `string[]` field (technologies, tags, bullets, skills).
 * Type a value and press Enter or comma to add; Backspace on an empty input
 * removes the last tag. Duplicates are ignored. Bound by `name`; inside <FormShell>.
 */
const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /** Max number of tags. */
    max?: number;
  }>(),
  { placeholder: 'Add and press Enter' },
);

const { value, errorMessage, handleBlur } = useField<string[]>(() => props.name, undefined, {
  initialValue: [],
});

const draft = ref('');
const inputRef = ref<HTMLInputElement>();
const id = useId();

const tags = computed<string[]>(() => value.value ?? []);
const atMax = computed(() => props.max != null && tags.value.length >= props.max);

const describedBy = computed(() =>
  errorMessage.value ? `${id}-error` : props.description ? `${id}-description` : undefined,
);

function addTag() {
  const next = draft.value.trim().replace(/,$/, '').trim();
  draft.value = '';
  if (!next || atMax.value) return;
  if (tags.value.some((t) => t.toLowerCase() === next.toLowerCase())) return;
  value.value = [...tags.value, next];
}

function removeTag(index: number) {
  value.value = tags.value.filter((_, i) => i !== index);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTag();
  } else if (e.key === 'Backspace' && !draft.value && tags.value.length) {
    removeTag(tags.value.length - 1);
  }
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
    <div
      :class="
        cn(
          'flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          errorMessage && 'border-destructive ring-destructive/20',
          disabled && 'pointer-events-none opacity-50',
        )
      "
      @click="inputRef?.focus()"
    >
      <span
        v-for="(tag, index) in tags"
        :key="`${tag}-${index}`"
        class="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
      >
        {{ tag }}
        <button
          type="button"
          class="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :aria-label="`Remove ${tag}`"
          @click.stop="removeTag(index)"
        >
          <Icon name="lucide:x" class="size-3" />
        </button>
      </span>
      <input
        :id="id"
        ref="inputRef"
        v-model="draft"
        type="text"
        :placeholder="atMax ? '' : placeholder"
        :disabled="disabled || atMax"
        class="h-6 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        :aria-invalid="Boolean(errorMessage) || undefined"
        :aria-describedby="describedBy"
        autocomplete="off"
        @keydown="onKeydown"
        @blur="
          addTag();
          handleBlur($event);
        "
      />
    </div>
  </FieldShell>
</template>

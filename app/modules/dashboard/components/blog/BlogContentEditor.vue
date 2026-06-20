<script setup lang="ts">
import { useField } from 'vee-validate';

import { Textarea } from '@/components/ui/textarea';

import FieldShell from '../form/FieldShell.vue';

/**
 * BlogContentEditor — the post body field. A plain HTML textarea with a live
 * preview, bound by `name` through the <FormShell> context (so its `min(20)`
 * zod rule and error surface like any other field).
 *
 * The preview runs the draft through the EXACT public pipeline — `usePostContent`
 * (sanitize-html allowlist + heading-id injection) rendered via `PostBody` — so
 * what you see here is byte-for-byte what the published article renders. Content
 * is therefore authored as sanitized HTML, matching how the backend stores it.
 */
const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    description?: string;
    required?: boolean;
    rows?: number;
  }>(),
  { rows: 18 },
);

const { value, errorMessage, handleBlur } = useField<string | undefined>(() => props.name);

const id = useId();
const tab = ref<'write' | 'preview'>('write');

// Same sanitize + heading-id pass the public article uses → preview == output.
const { html } = usePostContent(() => value.value ?? '');
const isEmpty = computed(() => !(value.value ?? '').trim());

const describedBy = computed(() =>
  errorMessage.value ? `${id}-error` : props.description ? `${id}-description` : undefined,
);
</script>

<template>
  <FieldShell
    :id="id"
    :label="label"
    :description="description"
    :error="errorMessage"
    :required="required"
  >
    <div class="overflow-hidden rounded-lg border border-input">
      <!-- Write / Preview toggle -->
      <div class="flex items-center gap-1 border-b border-border bg-muted/30 p-1">
        <button
          v-for="t in ['write', 'preview'] as const"
          :key="t"
          type="button"
          class="rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors"
          :class="
            tab === t
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          :aria-pressed="tab === t"
          @click="tab = t"
        >
          {{ t }}
        </button>
        <span class="ml-auto px-2 text-xs text-muted-foreground">HTML</span>
      </div>

      <!-- Write -->
      <Textarea
        v-show="tab === 'write'"
        :id="id"
        v-model="value"
        :rows="rows"
        placeholder="<p>Write your post in HTML…</p>"
        class="rounded-none border-0 font-mono text-sm focus-visible:ring-0"
        :aria-invalid="Boolean(errorMessage) || undefined"
        :aria-describedby="describedBy"
        @blur="handleBlur"
      />

      <!-- Preview -->
      <div v-show="tab === 'preview'" class="min-h-40 px-4 py-3">
        <p v-if="isEmpty" class="text-sm text-muted-foreground">Nothing to preview yet.</p>
        <PostBody v-else :html="html" />
      </div>
    </div>
  </FieldShell>
</template>

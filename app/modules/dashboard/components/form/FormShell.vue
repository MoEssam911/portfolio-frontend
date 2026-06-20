<script setup lang="ts" generic="T extends Record<string, unknown>">
import { toTypedSchema } from '@vee-validate/zod';
import type { ZodType } from 'zod';

import { Button } from '@/components/ui/button';

/**
 * FormShell — the vee-validate + zod form container every dashboard form uses.
 *
 * Owns the `useForm` context: pass a zod `schema` (and optional `initialValues`)
 * and it wires validation. Child `Form*` field wrappers bind by `name` through
 * vee-validate's injected context — no prop drilling. The page does the async
 * work in `@submit` and passes its mutation `pending` back in so the footer
 * disables and shows progress (double-submit-safe).
 *
 *   <FormShell :schema="schema" :initial-values="values" :pending="create.pending.value"
 *     submit-label="Create project" @submit="onSubmit">
 *     <FormText name="title" label="Title" required />
 *   </FormShell>
 */
const props = withDefaults(
  defineProps<{
    schema: ZodType<T>;
    initialValues?: Partial<T>;
    /** External in-flight flag (e.g. a mutation's `pending`). Disables the footer. */
    pending?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    /** Show a cancel button in the footer; listen via `@cancel`. */
    cancelable?: boolean;
  }>(),
  { pending: false, submitLabel: 'Save', cancelLabel: 'Cancel', cancelable: false },
);

const emit = defineEmits<{ submit: [values: T]; cancel: [] }>();

const { handleSubmit, errors, meta } = useForm<T>({
  validationSchema: toTypedSchema(props.schema),
  initialValues: props.initialValues as never,
});

const errorCount = computed(() => Object.keys(errors.value).length);

const onSubmit = handleSubmit((values) => {
  emit('submit', values as T);
});
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit="onSubmit">
    <!-- Error summary — appears only after a failed submit attempt. -->
    <p
      v-if="meta.touched && errorCount > 0"
      class="rounded-lg border border-destructive/40 bg-destructive-muted px-3 py-2 text-sm text-destructive-muted-foreground"
      role="alert"
    >
      Please fix {{ errorCount }} {{ errorCount === 1 ? 'field' : 'fields' }} below.
    </p>

    <div class="flex flex-col gap-5">
      <slot />
    </div>

    <div class="flex items-center justify-end gap-2 border-t border-border pt-4">
      <slot name="actions">
        <Button
          v-if="cancelable"
          type="button"
          variant="outline"
          :disabled="pending"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </Button>
        <Button type="submit" :disabled="pending">
          <Icon v-if="pending" name="lucide:loader-circle" class="size-4 animate-spin" />
          {{ submitLabel }}
        </Button>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import { z } from 'zod';

import type { Service, ServiceInput } from '~/modules/services/types';

/**
 * ServiceForm — the shared create/edit form for a service, rendered inside a
 * dialog on the Services index. FormShell owns the scalar fields (zod schema
 * mirrors the backend CreateServiceDto); the icon is picked through
 * FormIconPicker. On submit it assembles a `ServiceInput` payload with only the
 * whitelisted keys (empty optionals sent as `null`). `order` is never sent here —
 * position is managed by the reorder endpoint. The parent owns the mutation.
 */
const props = withDefaults(
  defineProps<{
    /** Existing service to edit; omit for create. */
    initial?: Service | null;
    /** Mutation in-flight — disables the footer (double-submit-safe). */
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save service' },
);

const emit = defineEmits<{
  submit: [payload: ServiceInput];
  cancel: [];
}>();

const schema = z.object({
  title: z
    .string()
    .min(2, 'Title needs at least 2 characters')
    .max(150, 'Keep the title under 150 characters'),
  description: z
    .string()
    .min(10, 'Description needs at least 10 characters')
    .max(2000, 'Keep the description under 2000 characters'),
  priceRange: z.string().max(100, 'Keep the price range under 100 characters').optional(),
  icon: z.string().max(50).nullable().optional(),
  featured: z.boolean(),
  published: z.boolean(),
});
type ServiceFormValues = z.infer<typeof schema>;

const initialValues: Partial<ServiceFormValues> = {
  title: props.initial?.title ?? '',
  description: props.initial?.description ?? '',
  priceRange: props.initial?.priceRange ?? '',
  icon: props.initial?.icon ?? null,
  featured: props.initial?.featured ?? false,
  published: props.initial?.published ?? false,
};

function onSubmit(values: ServiceFormValues) {
  const payload: ServiceInput = {
    title: values.title.trim(),
    description: values.description.trim(),
    priceRange: values.priceRange?.trim() || null,
    icon: values.icon?.trim() || null,
    featured: values.featured,
    published: values.published,
  };
  emit('submit', payload);
}
</script>

<template>
  <FormShell
    :schema="schema"
    :initial-values="initialValues"
    :pending="pending"
    :submit-label="submitLabel"
    cancelable
    @submit="onSubmit"
    @cancel="emit('cancel')"
  >
    <FormText name="title" label="Title" placeholder="e.g. Backend API Development" required />
    <FormTextarea
      name="description"
      label="Description"
      :rows="5"
      placeholder="What this service includes and who it's for."
      required
    />
    <FormText
      name="priceRange"
      label="Price range"
      placeholder="e.g. $500 – $2,000"
      description="Optional. Shown on the service card."
    />
    <FormIconPicker
      name="icon"
      label="Icon"
      description="Optional. The glyph shown on the service card."
    />

    <div class="grid gap-3 sm:grid-cols-2">
      <FormSwitch name="published" label="Published" description="Visible on the public site." />
      <FormSwitch name="featured" label="Featured" description="Pin above other services." />
    </div>
  </FormShell>
</template>

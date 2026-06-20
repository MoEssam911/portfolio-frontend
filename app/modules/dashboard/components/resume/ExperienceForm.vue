<script setup lang="ts">
import dayjs from 'dayjs';
import { z } from 'zod';

import type { Experience, ExperienceInput } from '~/modules/resume/types';

import ResumeDateRange from './ResumeDateRange.vue';

/**
 * ExperienceForm — create/edit a work experience (dialog on the Resume page).
 * The zod schema mirrors CreateExperienceDto. Dates are `YYYY-MM-DD` strings
 * (seeded from the stored ISO timestamp via dayjs, sent back as-is — the backend
 * `new Date()`-parses them). When `current` is on, no end date is sent. `order`
 * is never sent — the reorder endpoint owns position.
 */
const props = withDefaults(
  defineProps<{
    initial?: Experience | null;
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save' },
);

const emit = defineEmits<{ submit: [payload: ExperienceInput]; cancel: [] }>();

const schema = z.object({
  company: z.string().min(2, 'Company needs at least 2 characters').max(150),
  title: z.string().min(2, 'Title needs at least 2 characters').max(150),
  location: z.string().max(150).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  bullets: z.array(z.string()).optional(),
});
type ExperienceFormValues = z.infer<typeof schema>;

const toDateInput = (iso: string | null | undefined) =>
  iso ? dayjs(iso).format('YYYY-MM-DD') : '';

const initialValues: Partial<ExperienceFormValues> = {
  company: props.initial?.company ?? '',
  title: props.initial?.title ?? '',
  location: props.initial?.location ?? '',
  startDate: toDateInput(props.initial?.startDate),
  endDate: toDateInput(props.initial?.endDate),
  current: props.initial?.current ?? false,
  bullets: props.initial?.bullets ?? [],
};

function onSubmit(values: ExperienceFormValues) {
  emit('submit', {
    company: values.company.trim(),
    title: values.title.trim(),
    location: values.location?.trim() || null,
    startDate: values.startDate,
    endDate: values.current ? null : values.endDate || null,
    current: values.current,
    bullets: (values.bullets ?? []).map((b) => b.trim()).filter(Boolean),
  });
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
    <div class="grid gap-5 sm:grid-cols-2">
      <FormText name="title" label="Title" placeholder="e.g. Senior Backend Engineer" required />
      <FormText name="company" label="Company" placeholder="e.g. Acme Corp" required />
    </div>
    <FormText name="location" label="Location" placeholder="e.g. Cairo, Egypt" />
    <ResumeDateRange start-required />
    <FormTagInput
      name="bullets"
      label="Highlights"
      placeholder="Add a highlight and press Enter"
      description="One achievement or responsibility per entry."
    />
  </FormShell>
</template>

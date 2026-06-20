<script setup lang="ts">
import dayjs from 'dayjs';
import { z } from 'zod';

import type { Education, EducationInput } from '~/modules/resume/types';

import ResumeDateRange from './ResumeDateRange.vue';

/**
 * EducationForm — create/edit an education entry (dialog on the Resume page).
 * Mirrors CreateEducationDto. Both dates are optional here (school start/end can
 * be unknown). `current` on ⇒ no end date. `order` is owned by the reorder
 * endpoint and never sent.
 */
const props = withDefaults(
  defineProps<{
    initial?: Education | null;
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save' },
);

const emit = defineEmits<{ submit: [payload: EducationInput]; cancel: [] }>();

const schema = z.object({
  school: z.string().min(2, 'School needs at least 2 characters').max(150),
  degree: z.string().min(2, 'Degree needs at least 2 characters').max(150),
  field: z.string().max(150).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(2000).optional(),
});
type EducationFormValues = z.infer<typeof schema>;

const toDateInput = (iso: string | null | undefined) =>
  iso ? dayjs(iso).format('YYYY-MM-DD') : '';

const initialValues: Partial<EducationFormValues> = {
  school: props.initial?.school ?? '',
  degree: props.initial?.degree ?? '',
  field: props.initial?.field ?? '',
  startDate: toDateInput(props.initial?.startDate),
  endDate: toDateInput(props.initial?.endDate),
  current: props.initial?.current ?? false,
  description: props.initial?.description ?? '',
};

function onSubmit(values: EducationFormValues) {
  emit('submit', {
    school: values.school.trim(),
    degree: values.degree.trim(),
    field: values.field?.trim() || null,
    startDate: values.startDate || null,
    endDate: values.current ? null : values.endDate || null,
    current: values.current,
    description: values.description?.trim() || null,
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
      <FormText name="degree" label="Degree" placeholder="e.g. B.Sc. Computer Science" required />
      <FormText name="school" label="School" placeholder="e.g. Cairo University" required />
    </div>
    <FormText name="field" label="Field of study" placeholder="e.g. Software Engineering" />
    <ResumeDateRange />
    <FormTextarea
      name="description"
      label="Description"
      :rows="3"
      placeholder="Honors, focus areas, notable coursework."
    />
  </FormShell>
</template>

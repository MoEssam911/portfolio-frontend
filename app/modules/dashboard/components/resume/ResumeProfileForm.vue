<script setup lang="ts">
import { z } from 'zod';

import type { ResumeProfile, ResumeProfileInput } from '~/modules/resume/types';

/**
 * ResumeProfileForm — the singleton profile form at the top of the Resume page.
 * Unlike the collection forms it is NOT a dialog: it sits inline and PATCHes
 * `/resume`. The zod schema mirrors `UpdateResumeProfileDto`; empty optionals are
 * sent as `null` (the backend writes them through, clearing the field).
 */
const props = withDefaults(
  defineProps<{
    initial?: ResumeProfile | null;
    /** Mutation in-flight — disables the footer (double-submit-safe). */
    pending?: boolean;
  }>(),
  { initial: null, pending: false },
);

const emit = defineEmits<{ submit: [payload: ResumeProfileInput] }>();

const schema = z.object({
  headline: z.string().max(120, 'Keep the headline under 120 characters').optional(),
  summary: z.string().max(2000, 'Keep the summary under 2000 characters').optional(),
  location: z.string().max(100, 'Keep the location under 100 characters').optional(),
  downloadUrl: z
    .string()
    .url('Enter a valid URL')
    .max(500, 'Keep the URL under 500 characters')
    .optional()
    .or(z.literal('')),
});
type ProfileFormValues = z.infer<typeof schema>;

const initialValues: Partial<ProfileFormValues> = {
  headline: props.initial?.headline ?? '',
  summary: props.initial?.summary ?? '',
  location: props.initial?.location ?? '',
  downloadUrl: props.initial?.downloadUrl ?? '',
};

function onSubmit(values: ProfileFormValues) {
  emit('submit', {
    headline: values.headline?.trim() || null,
    summary: values.summary?.trim() || null,
    location: values.location?.trim() || null,
    downloadUrl: values.downloadUrl?.trim() || null,
  });
}
</script>

<template>
  <FormShell
    :schema="schema"
    :initial-values="initialValues"
    :pending="pending"
    submit-label="Save profile"
    @submit="onSubmit"
  >
    <FormText
      name="headline"
      label="Headline"
      placeholder="e.g. Senior Backend Engineer"
      description="The tagline shown at the top of your resume."
    />
    <FormTextarea
      name="summary"
      label="Summary"
      :rows="4"
      placeholder="A short professional summary."
    />
    <div class="grid gap-5 sm:grid-cols-2">
      <FormText name="location" label="Location" placeholder="e.g. Cairo, Egypt" />
      <FormText
        name="downloadUrl"
        label="Download URL"
        type="url"
        placeholder="https://…/resume.pdf"
        description="Link to a downloadable PDF."
      />
    </div>
  </FormShell>
</template>

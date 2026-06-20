<script setup lang="ts">
import { z } from 'zod';

import type { ResumeLink, ResumeLinkInput } from '~/modules/resume/types';

/**
 * LinkForm — create/edit a resume link (dialog on the Resume page). Mirrors
 * CreateResumeLinkDto: a label and a required URL. `order` is owned by the
 * reorder endpoint and never sent.
 */
const props = withDefaults(
  defineProps<{
    initial?: ResumeLink | null;
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save' },
);

const emit = defineEmits<{ submit: [payload: ResumeLinkInput]; cancel: [] }>();

const schema = z.object({
  label: z.string().min(1, 'Label is required').max(100),
  url: z.string().url('Enter a valid URL').max(500),
});
type LinkFormValues = z.infer<typeof schema>;

const initialValues: Partial<LinkFormValues> = {
  label: props.initial?.label ?? '',
  url: props.initial?.url ?? '',
};

function onSubmit(values: LinkFormValues) {
  emit('submit', { label: values.label.trim(), url: values.url.trim() });
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
    <FormText name="label" label="Label" placeholder="e.g. GitHub" required />
    <FormText name="url" label="URL" type="url" placeholder="https://github.com/me" required />
  </FormShell>
</template>

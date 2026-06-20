<script setup lang="ts">
import dayjs from 'dayjs';
import { z } from 'zod';

import type { Certification, CertificationInput } from '~/modules/resume/types';

/**
 * CertificationForm — create/edit a certification (dialog on the Resume page).
 * Mirrors CreateCertificationDto. Dates are optional `YYYY-MM-DD` strings; `url`
 * is optional. `order` is owned by the reorder endpoint and never sent.
 */
const props = withDefaults(
  defineProps<{
    initial?: Certification | null;
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save' },
);

const emit = defineEmits<{ submit: [payload: CertificationInput]; cancel: [] }>();

const schema = z.object({
  name: z.string().min(2, 'Name needs at least 2 characters').max(150),
  issuer: z.string().min(2, 'Issuer needs at least 2 characters').max(150),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  url: z.string().url('Enter a valid URL').max(500).optional().or(z.literal('')),
});
type CertificationFormValues = z.infer<typeof schema>;

const toDateInput = (iso: string | null | undefined) =>
  iso ? dayjs(iso).format('YYYY-MM-DD') : '';

const initialValues: Partial<CertificationFormValues> = {
  name: props.initial?.name ?? '',
  issuer: props.initial?.issuer ?? '',
  issueDate: toDateInput(props.initial?.issueDate),
  expiryDate: toDateInput(props.initial?.expiryDate),
  url: props.initial?.url ?? '',
};

function onSubmit(values: CertificationFormValues) {
  emit('submit', {
    name: values.name.trim(),
    issuer: values.issuer.trim(),
    issueDate: values.issueDate || null,
    expiryDate: values.expiryDate || null,
    url: values.url?.trim() || null,
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
      <FormText name="name" label="Name" placeholder="e.g. AWS Certified Developer" required />
      <FormText name="issuer" label="Issuer" placeholder="e.g. Amazon Web Services" required />
    </div>
    <div class="grid gap-5 sm:grid-cols-2">
      <FormDate name="issueDate" label="Issue date" />
      <FormDate name="expiryDate" label="Expiry date" />
    </div>
    <FormText
      name="url"
      label="Credential URL"
      type="url"
      placeholder="https://…/verify/abc"
      description="Optional. A link to verify the credential."
    />
  </FormShell>
</template>

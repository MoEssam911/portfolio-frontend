<script setup lang="ts">
import { useField } from 'vee-validate';

import { Textarea } from '@/components/ui/textarea';

import FieldShell from './FieldShell.vue';

/** FormTextarea — multi-line text field. Must live inside a <FormShell>. */
const props = defineProps<{
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
}>();

const { value, errorMessage, handleBlur } = useField<string | undefined>(() => props.name);

const id = useId();
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
    <Textarea
      :id="id"
      v-model="value"
      :placeholder="placeholder"
      :rows="rows ?? 4"
      :disabled="disabled"
      :aria-invalid="Boolean(errorMessage) || undefined"
      :aria-describedby="describedBy"
      @blur="handleBlur"
    />
  </FieldShell>
</template>

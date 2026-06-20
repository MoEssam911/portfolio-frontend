<script setup lang="ts">
import { useField } from 'vee-validate';

import { Input } from '@/components/ui/input';

import FieldShell from './FieldShell.vue';

/**
 * FormDate — native date picker bound by `name`. Value is a `YYYY-MM-DD` string
 * (convert to/from ISO at the page boundary if the API needs full timestamps).
 */
const props = defineProps<{
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  min?: string;
  max?: string;
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
    <Input
      :id="id"
      v-model="value"
      type="date"
      :min="min"
      :max="max"
      :disabled="disabled"
      class="h-9 w-fit"
      :aria-invalid="Boolean(errorMessage) || undefined"
      :aria-describedby="describedBy"
      @blur="handleBlur"
    />
  </FieldShell>
</template>

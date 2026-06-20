<script setup lang="ts">
import { useField } from 'vee-validate';

import { Input } from '@/components/ui/input';

import FieldShell from './FieldShell.vue';

/**
 * FormText — single-line text field bound to a vee-validate field by `name`.
 * Covers `text` / `url` / `email` / `number` via the `type` prop (use FormDate
 * for dates, FormTextarea for multi-line). Must live inside a <FormShell>.
 */
const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    type?: 'text' | 'url' | 'email' | 'number' | 'tel';
    required?: boolean;
    autocomplete?: string;
    disabled?: boolean;
  }>(),
  { type: 'text' },
);

const { value, errorMessage, handleBlur } = useField<string | number | undefined>(() => props.name);

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
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      class="h-9"
      :aria-invalid="Boolean(errorMessage) || undefined"
      :aria-describedby="describedBy"
      @blur="handleBlur"
    />
  </FieldShell>
</template>

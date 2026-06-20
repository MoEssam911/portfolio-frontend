<script setup lang="ts">
import { useField } from 'vee-validate';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import FieldShell from './FieldShell.vue';

export interface SelectOption {
  label: string;
  value: string;
}

/** FormSelect — single-select dropdown bound by `name`. Inside a <FormShell>. */
const props = defineProps<{
  name: string;
  options: SelectOption[];
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}>();

const { value, errorMessage } = useField<string | undefined>(() => props.name);

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
    <SelectRoot v-model="value" :disabled="disabled">
      <SelectTrigger
        :id="id"
        class="h-9"
        :aria-invalid="Boolean(errorMessage) || undefined"
        :aria-describedby="describedBy"
      >
        <SelectValue :placeholder="placeholder ?? 'Select…'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </SelectRoot>
  </FieldShell>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

/**
 * FormSwitch — boolean toggle (published / featured / availability). Horizontal
 * layout: label + optional description on the left, switch on the right. Bound
 * by `name`; must live inside a <FormShell>.
 */
const props = defineProps<{
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
}>();

const { value, errorMessage } = useField<boolean>(() => props.name);

const id = useId();
const describedBy = computed(() =>
  errorMessage.value ? `${id}-error` : props.description ? `${id}-description` : undefined,
);
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div
      class="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3.5 py-3"
    >
      <div class="flex flex-col gap-0.5">
        <Label :for="id" class="text-foreground">{{ label }}</Label>
        <p v-if="description" :id="`${id}-description`" class="text-xs text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <Switch :id="id" v-model="value" :disabled="disabled" :aria-describedby="describedBy" />
    </div>
    <p v-if="errorMessage" :id="`${id}-error`" class="text-xs text-destructive" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>

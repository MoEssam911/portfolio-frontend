<script setup lang="ts">
import { Label } from '@/components/ui/label';

/**
 * FieldShell — the label + control + message layout shared by every form field
 * wrapper. Not used directly by pages; each `Form*` field renders its control
 * into the default slot. Wires the error/description ids so the control can set
 * `aria-describedby` (the field components compute and pass it in).
 */
defineProps<{
  id: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <Label v-if="label" :for="id" class="text-foreground">
      {{ label }}
      <span v-if="required" class="text-destructive" aria-hidden="true">*</span>
    </Label>

    <slot />

    <p v-if="description && !error" :id="`${id}-description`" class="text-xs text-muted-foreground">
      {{ description }}
    </p>
    <p v-if="error" :id="`${id}-error`" class="text-xs text-destructive" role="alert">
      {{ error }}
    </p>
  </div>
</template>

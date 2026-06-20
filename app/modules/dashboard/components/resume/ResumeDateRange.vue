<script setup lang="ts">
import { useField } from 'vee-validate';

/**
 * ResumeDateRange — the shared start/end/current trio for experiences and
 * educations. It must live INSIDE <FormShell> so it can reach the vee-validate
 * form context (the parent form component is not a descendant and can't inject
 * it). When `current` is switched on, the end date is disabled and cleared — a
 * current role/study has no end date.
 */
withDefaults(defineProps<{ startRequired?: boolean }>(), { startRequired: false });

const { value: current } = useField<boolean>('current');
const { value: endDate } = useField<string | undefined>('endDate');

watch(current, (on) => {
  if (on) endDate.value = '';
});
</script>

<template>
  <div class="grid gap-5 sm:grid-cols-2">
    <FormDate name="startDate" label="Start date" :required="startRequired" />
    <FormDate
      name="endDate"
      label="End date"
      :disabled="current"
      :description="current ? 'Disabled while “Current” is on.' : undefined"
    />
  </div>
  <FormSwitch name="current" label="Current" description="Still ongoing — no end date." />
</template>

<script setup lang="ts">
import { z } from 'zod';

import type { SkillGroup, SkillGroupInput } from '~/modules/resume/types';

/**
 * SkillGroupForm — create/edit a skill group (dialog on the Resume page).
 * Mirrors CreateSkillGroupDto. Per the phase brief, skills are managed as a
 * `string[]` (names) through FormTagInput and mapped to `{ name }[]` at submit;
 * a group's optional `icon` is a full lucide id via FormIconPicker. `order` is
 * owned by the reorder endpoint and never sent.
 *
 * Note: editing keeps skill NAMES only — any per-skill icons set elsewhere are
 * not surfaced here and are replaced on save. That's the intended scope.
 */
const props = withDefaults(
  defineProps<{
    initial?: SkillGroup | null;
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save' },
);

const emit = defineEmits<{ submit: [payload: SkillGroupInput]; cancel: [] }>();

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().max(100).nullable().optional(),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
});
type SkillGroupFormValues = z.infer<typeof schema>;

const initialValues: Partial<SkillGroupFormValues> = {
  name: props.initial?.name ?? '',
  icon: props.initial?.icon ?? null,
  skills: props.initial?.skills.map((s) => s.name) ?? [],
};

function onSubmit(values: SkillGroupFormValues) {
  emit('submit', {
    name: values.name.trim(),
    icon: values.icon?.trim() || null,
    skills: values.skills.map((name) => ({ name: name.trim() })).filter((s) => s.name),
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
    <FormText name="name" label="Group name" placeholder="e.g. Languages" required />
    <FormIconPicker name="icon" label="Icon" description="Optional. Shown next to the group." />
    <FormTagInput
      name="skills"
      label="Skills"
      placeholder="Add a skill and press Enter"
      description="At least one. e.g. TypeScript, Go, PostgreSQL."
      required
    />
  </FormShell>
</template>

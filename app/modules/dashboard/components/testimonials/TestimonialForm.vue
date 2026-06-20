<script setup lang="ts">
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import type { Testimonial, TestimonialInput } from '~/modules/testimonials/types';
import type { MediaItem } from '~/shared/types/api';

/**
 * TestimonialForm — the shared create/edit form for a testimonial, rendered
 * inside a dialog on the Testimonials index. FormShell owns the scalar fields
 * (zod schema mirrors the backend CreateTestimonialDto); the avatar is chosen via
 * the MediaPicker (single) and tracked as local `MediaItem` state, merged into the
 * `TestimonialInput` at submit (avatar referenced by id; sent as `null` to clear).
 *
 * The backend does NOT ownership-validate `avatarId`, so we only ever surface the
 * owner's media — MediaPicker reads the admin media library, which is already
 * scoped to the authenticated user.
 */
const props = withDefaults(
  defineProps<{
    /** Existing testimonial to edit; omit for create. */
    initial?: Testimonial | null;
    /** Mutation in-flight — disables the footer (double-submit-safe). */
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save testimonial' },
);

const emit = defineEmits<{
  submit: [payload: TestimonialInput];
  cancel: [];
}>();

const schema = z.object({
  name: z
    .string()
    .min(2, 'Name needs at least 2 characters')
    .max(100, 'Keep the name under 100 characters'),
  role: z
    .string()
    .min(2, 'Role needs at least 2 characters')
    .max(100, 'Keep the role under 100 characters'),
  company: z.string().max(100, 'Keep the company under 100 characters').optional(),
  quote: z
    .string()
    .min(10, 'Quote needs at least 10 characters')
    .max(1000, 'Keep the quote under 1000 characters'),
  featured: z.boolean(),
  published: z.boolean(),
});
type TestimonialFormValues = z.infer<typeof schema>;

const initialValues: Partial<TestimonialFormValues> = {
  name: props.initial?.name ?? '',
  role: props.initial?.role ?? '',
  company: props.initial?.company ?? '',
  quote: props.initial?.quote ?? '',
  featured: props.initial?.featured ?? false,
  published: props.initial?.published ?? false,
};

// ── Avatar (local; seeded from the entity's resolved object) ──────────────────
const avatar = ref<MediaItem | null>(props.initial?.avatar ?? null);
const avatarId = computed(() => avatar.value?.id ?? null);

function onAvatarSelect({ items }: { ids: string[]; items: MediaItem[] }) {
  avatar.value = items[0] ?? null;
}

function isImage(media: MediaItem): boolean {
  return media.type === 'IMAGE' || media.mimeType.startsWith('image/');
}

function onSubmit(values: TestimonialFormValues) {
  const payload: TestimonialInput = {
    name: values.name.trim(),
    role: values.role.trim(),
    company: values.company?.trim() || null,
    quote: values.quote.trim(),
    avatarId: avatar.value?.id ?? null,
    featured: values.featured,
    published: values.published,
  };
  emit('submit', payload);
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
      <FormText name="name" label="Name" placeholder="e.g. Jane Smith" required />
      <FormText name="role" label="Role" placeholder="e.g. Engineering Manager" required />
    </div>
    <FormText name="company" label="Company" placeholder="e.g. Acme Corp" description="Optional." />
    <FormTextarea
      name="quote"
      label="Quote"
      :rows="4"
      placeholder="What they said about working with you."
      required
    />

    <!-- Avatar -->
    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-foreground">Avatar</span>
      <p class="text-xs text-muted-foreground">Optional. A photo of the person quoted.</p>
      <div class="mt-1 flex items-center gap-3">
        <div class="size-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted/40">
          <img
            v-if="avatar && isImage(avatar)"
            :src="avatar.url"
            :alt="avatar.alt ?? avatar.originalName ?? ''"
            class="size-full object-cover"
          />
          <div v-else class="flex size-full items-center justify-center text-muted-foreground">
            <Icon name="lucide:user" class="size-5" />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <MediaPicker
            :model-value="avatarId"
            title="Choose an avatar"
            description="Pick a photo of the person quoted."
            @select="onAvatarSelect"
          >
            <template #default="{ open }">
              <Button type="button" variant="outline" size="sm" @click="open">
                <Icon name="lucide:image" class="size-4" />
                {{ avatar ? 'Change' : 'Choose image' }}
              </Button>
            </template>
          </MediaPicker>
          <Button
            v-if="avatar"
            type="button"
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            @click="avatar = null"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <FormSwitch name="published" label="Published" description="Visible on the public site." />
      <FormSwitch name="featured" label="Featured" description="Pin above other testimonials." />
    </div>
  </FormShell>
</template>

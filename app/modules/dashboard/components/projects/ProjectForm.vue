<script setup lang="ts">
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import type { Project, ProjectInput } from '~/modules/projects/types';
import type { MediaItem } from '~/shared/types/api';

/**
 * ProjectForm — the shared create/edit form for a project. Wraps the FormShell
 * primitive for the scalar fields and manages the two media relations
 * (thumbnail + ordered gallery) as local state alongside it, since those are
 * chosen through the MediaPicker dialog rather than typed.
 *
 * On submit it assembles a `ProjectInput` payload that mirrors the backend DTO
 * exactly (only whitelisted keys; empty optionals sent as `null`; the gallery
 * sent as an ordered id array that REPLACES the existing gallery). The parent
 * owns the actual create/update mutation + navigation.
 */
const props = withDefaults(
  defineProps<{
    /** Existing project to edit; omit for create. */
    initial?: Project | null;
    /** Mutation in-flight — disables the footer (double-submit-safe). */
    pending?: boolean;
    submitLabel?: string;
  }>(),
  { initial: null, pending: false, submitLabel: 'Save project' },
);

const emit = defineEmits<{
  submit: [payload: ProjectInput];
  cancel: [];
}>();

// Scalar fields only — media is managed below and merged in at submit time.
const schema = z.object({
  title: z.string().min(3, 'Title needs at least 3 characters'),
  excerpt: z.string().max(300, 'Keep the excerpt under 300 characters').optional(),
  description: z.string().min(20, 'Description needs at least 20 characters'),
  liveUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  repoUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  technologies: z.array(z.string()),
  featured: z.boolean(),
  published: z.boolean(),
});
type ProjectFormValues = z.infer<typeof schema>;

const initialValues: Partial<ProjectFormValues> = {
  title: props.initial?.title ?? '',
  excerpt: props.initial?.excerpt ?? '',
  description: props.initial?.description ?? '',
  liveUrl: props.initial?.liveUrl ?? '',
  repoUrl: props.initial?.repoUrl ?? '',
  technologies: props.initial?.technologies ?? [],
  featured: props.initial?.featured ?? false,
  published: props.initial?.published ?? false,
};

// ── Media relations (local; seeded from the entity's resolved objects) ────────
const thumbnail = ref<MediaItem | null>(props.initial?.thumbnail ?? null);
const gallery = ref<MediaItem[]>(
  [...(props.initial?.gallery ?? [])].sort((a, b) => a.order - b.order).map((g) => g.media),
);

const thumbnailId = computed(() => thumbnail.value?.id ?? null);
const galleryIds = computed(() => gallery.value.map((m) => m.id));

function onThumbnailSelect({ items }: { ids: string[]; items: MediaItem[] }) {
  thumbnail.value = items[0] ?? null;
}

function onGallerySelect({ items }: { ids: string[]; items: MediaItem[] }) {
  gallery.value = items;
}

function isImage(media: MediaItem): boolean {
  return media.type === 'IMAGE' || media.mimeType.startsWith('image/');
}

function onSubmit(values: ProjectFormValues) {
  const payload: ProjectInput = {
    title: values.title.trim(),
    excerpt: values.excerpt?.trim() || null,
    description: values.description.trim(),
    liveUrl: values.liveUrl?.trim() || null,
    repoUrl: values.repoUrl?.trim() || null,
    technologies: values.technologies ?? [],
    featured: values.featured,
    published: values.published,
    thumbnailId: thumbnail.value?.id ?? null,
    galleryImageIds: gallery.value.map((m) => m.id),
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
    <FormText name="title" label="Title" placeholder="Project name" required />
    <FormTextarea
      name="excerpt"
      label="Excerpt"
      :rows="2"
      placeholder="A one-line summary for cards and previews."
      description="Optional. Shown on the projects index and meta previews."
    />
    <FormTextarea
      name="description"
      label="Description"
      :rows="8"
      placeholder="The full case study. Markdown is supported."
      description="Markdown is supported."
      required
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <FormText name="liveUrl" type="url" label="Live URL" placeholder="https://…" />
      <FormText
        name="repoUrl"
        type="url"
        label="Repository URL"
        placeholder="https://github.com/…"
      />
    </div>

    <FormTagInput
      name="technologies"
      label="Technologies"
      placeholder="Add a tech, press Enter"
      description="The stack this project was built with."
    />

    <!-- Thumbnail -->
    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-foreground">Thumbnail</span>
      <p class="text-xs text-muted-foreground">
        The cover image used on cards and at the top of the case study.
      </p>
      <div class="mt-1 flex items-center gap-3">
        <div class="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
          <img
            v-if="thumbnail && isImage(thumbnail)"
            :src="thumbnail.url"
            :alt="thumbnail.alt ?? thumbnail.originalName ?? ''"
            class="size-full object-cover"
          />
          <div v-else class="flex size-full items-center justify-center text-muted-foreground">
            <Icon name="lucide:image" class="size-6" />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <MediaPicker
            :model-value="thumbnailId"
            title="Choose a thumbnail"
            description="Pick the project's cover image."
            @select="onThumbnailSelect"
          >
            <template #default="{ open }">
              <Button type="button" variant="outline" size="sm" @click="open">
                <Icon name="lucide:image" class="size-4" />
                {{ thumbnail ? 'Change' : 'Choose image' }}
              </Button>
            </template>
          </MediaPicker>
          <Button
            v-if="thumbnail"
            type="button"
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            @click="thumbnail = null"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>

    <!-- Gallery -->
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <span class="text-sm font-medium text-foreground">Gallery</span>
          <p class="text-xs text-muted-foreground">
            Drag tiles (or use the arrows) to set the display order.
          </p>
        </div>
        <MediaPicker
          :model-value="galleryIds"
          multiple
          title="Choose gallery images"
          description="Select and order the images shown in the case study gallery."
          @select="onGallerySelect"
        >
          <template #default="{ open }">
            <Button type="button" variant="outline" size="sm" @click="open">
              <Icon name="lucide:images" class="size-4" />
              {{ gallery.length ? 'Edit selection' : 'Add images' }}
            </Button>
          </template>
        </MediaPicker>
      </div>

      <MediaReorderList v-if="gallery.length" v-model="gallery" class="mt-1" />
      <p
        v-else
        class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground"
      >
        No gallery images yet.
      </p>
    </div>

    <!-- Status toggles -->
    <div class="grid gap-3 sm:grid-cols-2">
      <FormSwitch name="published" label="Published" description="Visible on the public site." />
      <FormSwitch name="featured" label="Featured" description="Pin above other projects." />
    </div>
  </FormShell>
</template>

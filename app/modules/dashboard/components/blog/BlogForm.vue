<script setup lang="ts">
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import type { BlogInput, BlogPost } from '~/modules/blog/types';
import type { MediaItem } from '~/shared/types/api';

import BlogContentEditor from './BlogContentEditor.vue';

/**
 * BlogForm — the shared create/edit form for a post. Wraps FormShell for the
 * scalar fields (title/excerpt/tags/published + the HTML content editor) and
 * manages the single cover image relation as local state alongside it, since it
 * is chosen through the MediaPicker dialog rather than typed.
 *
 * On submit it assembles a `BlogInput` payload that mirrors the backend DTO
 * exactly (only whitelisted keys; `excerpt`/`coverImageId` sent as `null` to
 * clear; `tags` as an array of tag NAMES). The parent owns the create/update
 * mutation + navigation. A separate "Save draft" / "Publish" affordance is
 * exposed so the publish state has a clear, explicit control.
 */
const props = withDefaults(
  defineProps<{
    /** Existing post to edit; omit for create. */
    initial?: BlogPost | null;
    /** Mutation in-flight — disables the footer (double-submit-safe). */
    pending?: boolean;
  }>(),
  { initial: null, pending: false },
);

const emit = defineEmits<{
  submit: [payload: BlogInput];
  cancel: [];
}>();

const isEdit = computed(() => props.initial != null);

// Scalar fields only — cover image is managed below and merged in at submit.
// `published` lives outside the schema: the footer's draft/publish buttons set
// it explicitly per-submit so the action and the state can never disagree.
const schema = z.object({
  title: z.string().min(5, 'Title needs at least 5 characters'),
  excerpt: z.string().max(300, 'Keep the excerpt under 300 characters').optional(),
  content: z.string().min(20, 'Content needs at least 20 characters'),
  tags: z.array(z.string()),
});
type BlogFormValues = z.infer<typeof schema>;

const initialValues: Partial<BlogFormValues> = {
  title: props.initial?.title ?? '',
  excerpt: props.initial?.excerpt ?? '',
  content: props.initial?.content ?? '',
  tags: props.initial?.tags.map((t) => t.name) ?? [],
};

// ── Cover image (local; seeded from the entity's resolved object) ─────────────
const cover = ref<MediaItem | null>(props.initial?.coverImage ?? null);
const coverId = computed(() => cover.value?.id ?? null);

function onCoverSelect({ items }: { ids: string[]; items: MediaItem[] }) {
  cover.value = items[0] ?? null;
}

function isImage(media: MediaItem): boolean {
  return media.type === 'IMAGE' || media.mimeType.startsWith('image/');
}

// The publish flag is decided by which footer button was pressed, not a field.
const publishOnSubmit = ref(props.initial?.published ?? false);

function buildPayload(values: BlogFormValues): BlogInput {
  return {
    title: values.title.trim(),
    excerpt: values.excerpt?.trim() || null,
    content: values.content,
    published: publishOnSubmit.value,
    coverImageId: cover.value?.id ?? null,
    tags: values.tags ?? [],
  };
}

function onSubmit(values: BlogFormValues) {
  emit('submit', buildPayload(values));
}
</script>

<template>
  <FormShell
    :schema="schema"
    :initial-values="initialValues"
    :pending="pending"
    cancelable
    @submit="onSubmit"
    @cancel="emit('cancel')"
  >
    <FormText name="title" label="Title" placeholder="Post title" required />
    <FormTextarea
      name="excerpt"
      label="Excerpt"
      :rows="2"
      placeholder="A one-line summary for cards, previews, and SEO."
      description="Optional. Shown on the blog index and meta previews."
    />

    <BlogContentEditor
      name="content"
      label="Content"
      description="Authored as HTML. The Preview tab renders exactly what the published article shows."
      required
    />

    <!-- Cover image -->
    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-foreground">Cover image</span>
      <p class="text-xs text-muted-foreground">
        Shown at the top of the article and on blog cards.
      </p>
      <div class="mt-1 flex items-center gap-3">
        <div class="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
          <img
            v-if="cover && isImage(cover)"
            :src="cover.url"
            :alt="cover.alt ?? cover.originalName ?? ''"
            class="size-full object-cover"
          />
          <div v-else class="flex size-full items-center justify-center text-muted-foreground">
            <Icon name="lucide:image" class="size-6" />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <MediaPicker
            :model-value="coverId"
            title="Choose a cover image"
            description="Pick the post's cover image."
            @select="onCoverSelect"
          >
            <template #default="{ open }">
              <Button type="button" variant="outline" size="sm" @click="open">
                <Icon name="lucide:image" class="size-4" />
                {{ cover ? 'Change' : 'Choose image' }}
              </Button>
            </template>
          </MediaPicker>
          <Button
            v-if="cover"
            type="button"
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            @click="cover = null"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>

    <FormTagInput
      name="tags"
      label="Tags"
      placeholder="Add a tag, press Enter"
      description="New tags are created automatically; existing ones are reused."
    />

    <!-- Draft / Publish footer — explicit status affordances replace a toggle. -->
    <template #actions>
      <Button type="button" variant="outline" :disabled="pending" @click="emit('cancel')">
        Cancel
      </Button>
      <Button type="submit" variant="outline" :disabled="pending" @click="publishOnSubmit = false">
        <Icon
          v-if="pending && !publishOnSubmit"
          name="lucide:loader-circle"
          class="size-4 animate-spin"
        />
        Save draft
      </Button>
      <Button type="submit" :disabled="pending" @click="publishOnSubmit = true">
        <Icon
          v-if="pending && publishOnSubmit"
          name="lucide:loader-circle"
          class="size-4 animate-spin"
        />
        {{ isEdit && initial?.published ? 'Update & keep published' : 'Publish' }}
      </Button>
    </template>
  </FormShell>
</template>

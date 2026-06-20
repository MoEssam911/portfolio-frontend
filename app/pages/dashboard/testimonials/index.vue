<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminTestimonials } from '~/modules/dashboard/composables/useAdminTestimonials';
import { useReorderableList } from '~/modules/dashboard/composables/useReorderableList';
import type { Testimonial, TestimonialInput } from '~/modules/dashboard/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Testimonials' });

const { items, pending, error, refresh, create, update, removeWithConfirm } =
  useAdminTestimonials();

// Drag-to-reorder over a local working copy; persists to /testimonials/reorder.
const reorder = useReorderableList<Testimonial>('testimonials', items, {
  label: 'testimonials',
});

const isEmpty = computed(() => !pending.value && !error.value && items.value.length === 0);

// ── Create / edit dialog ─────────────────────────────────────────────────────
const dialogOpen = ref(false);
const editing = ref<Testimonial | null>(null);
const saving = computed(() => create.pending.value || update.pending.value);

function openCreate() {
  editing.value = null;
  dialogOpen.value = true;
}

function openEdit(testimonial: Testimonial) {
  editing.value = testimonial;
  dialogOpen.value = true;
}

async function onSubmit(payload: TestimonialInput) {
  const result = editing.value
    ? await update.mutate({ id: editing.value.id, input: payload })
    : await create.mutate(payload);
  if (result) {
    dialogOpen.value = false;
    editing.value = null;
  }
}

async function togglePublished(testimonial: Testimonial) {
  await update.mutate({ id: testimonial.id, input: { published: !testimonial.published } });
}

function isImage(media: { type: string; mimeType: string }): boolean {
  return media.type === 'IMAGE' || media.mimeType.startsWith('image/');
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader title="Testimonials" description="Social proof — drag to set the display order.">
      <template #actions>
        <Button size="sm" class="h-9" @click="openCreate">
          <Icon name="lucide:plus" class="size-4" />
          New testimonial
        </Button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <ul v-if="pending && items.length === 0" class="flex flex-col gap-2">
      <li v-for="n in 4" :key="`sk-${n}`">
        <Skeleton class="h-24 w-full rounded-xl" />
      </li>
    </ul>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your testimonials</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="isEmpty"
      icon="lucide:quote"
      title="No testimonials yet"
      description="Add your first testimonial to build social proof."
    >
      <Button size="sm" @click="openCreate">
        <Icon name="lucide:plus" class="size-4" />
        New testimonial
      </Button>
    </EmptyState>

    <!-- Populated: reorderable list -->
    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="(testimonial, index) in reorder.ordered.value"
        :key="testimonial.id"
        draggable="true"
        class="group flex items-start gap-3 rounded-xl border bg-card px-3 py-3 transition-colors"
        :class="[
          reorder.overIndex.value === index && reorder.dragIndex.value !== index
            ? 'border-primary ring-1 ring-primary'
            : 'border-border',
          reorder.dragIndex.value === index ? 'opacity-50' : '',
        ]"
        @dragstart="reorder.onDragStart(index, $event)"
        @dragover.prevent="reorder.onDragOver(index)"
        @drop.prevent="reorder.onDrop(index)"
        @dragend="reorder.onDragEnd"
      >
        <!-- Drag handle + keyboard reorder -->
        <span
          class="mt-0.5 flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground active:cursor-grabbing"
          aria-hidden="true"
          title="Drag to reorder"
        >
          <Icon name="lucide:grip-vertical" class="size-4" />
        </span>
        <div class="flex shrink-0 flex-col">
          <Button
            variant="ghost"
            size="icon-sm"
            class="size-5"
            :disabled="index === 0 || reorder.persisting.value"
            :aria-label="`Move ${testimonial.name} up`"
            @click="reorder.moveBy(index, -1)"
          >
            <Icon name="lucide:chevron-up" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="size-5"
            :disabled="index === reorder.ordered.value.length - 1 || reorder.persisting.value"
            :aria-label="`Move ${testimonial.name} down`"
            @click="reorder.moveBy(index, 1)"
          >
            <Icon name="lucide:chevron-down" class="size-4" />
          </Button>
        </div>

        <!-- Avatar -->
        <div class="size-11 shrink-0 overflow-hidden rounded-full border border-border bg-muted/40">
          <img
            v-if="testimonial.avatar && isImage(testimonial.avatar)"
            :src="testimonial.avatar.url"
            :alt="testimonial.avatar.alt ?? testimonial.name"
            class="size-full object-cover"
          />
          <div v-else class="flex size-full items-center justify-center text-muted-foreground">
            <Icon name="lucide:user" class="size-5" />
          </div>
        </div>

        <!-- Body -->
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="text-left font-medium text-foreground transition-colors hover:text-primary"
              @click="openEdit(testimonial)"
            >
              {{ testimonial.name }}
            </button>
            <span class="text-xs text-muted-foreground">
              {{ testimonial.role
              }}<template v-if="testimonial.company"> · {{ testimonial.company }}</template>
            </span>
            <StatusBadge
              v-if="testimonial.featured"
              tone="info"
              label="Featured"
              icon="lucide:star"
            />
          </div>
          <p class="line-clamp-2 text-sm text-muted-foreground">“{{ testimonial.quote }}”</p>
        </div>

        <!-- Status -->
        <StatusBadge :published="testimonial.published" class="mt-0.5 shrink-0" />

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="update.pending.value"
            :aria-label="testimonial.published ? 'Unpublish' : 'Publish'"
            :title="testimonial.published ? 'Unpublish' : 'Publish'"
            @click="togglePublished(testimonial)"
          >
            <Icon :name="testimonial.published ? 'lucide:eye-off' : 'lucide:eye'" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit"
            title="Edit"
            @click="openEdit(testimonial)"
          >
            <Icon name="lucide:pencil" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:text-destructive"
            aria-label="Delete"
            title="Delete"
            @click="removeWithConfirm(testimonial.id, testimonial.name)"
          >
            <Icon name="lucide:trash-2" class="size-4" />
          </Button>
        </div>
      </li>
    </ul>

    <!-- Create / edit dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="flex max-h-[90vh] flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Edit testimonial' : 'New testimonial' }}</DialogTitle>
          <DialogDescription>
            {{
              editing ? 'Update this testimonial.' : 'Add a new testimonial to your social proof.'
            }}
          </DialogDescription>
        </DialogHeader>
        <TestimonialForm
          :key="editing?.id ?? 'new'"
          :initial="editing"
          :pending="saving"
          :submit-label="editing ? 'Save changes' : 'Create testimonial'"
          @submit="onSubmit"
          @cancel="dialogOpen = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

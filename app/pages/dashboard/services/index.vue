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
import { useAdminServices } from '~/modules/dashboard/composables/useAdminServices';
import { useReorderableList } from '~/modules/dashboard/composables/useReorderableList';
import type { Service, ServiceInput } from '~/modules/dashboard/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Services' });

const { items, pending, error, refresh, create, update, removeWithConfirm } = useAdminServices();

// Drag-to-reorder over a local working copy; persists to /services/reorder.
const reorder = useReorderableList<Service>('services', items, { label: 'services' });

const isEmpty = computed(() => !pending.value && !error.value && items.value.length === 0);

// ── Create / edit dialog ─────────────────────────────────────────────────────
const dialogOpen = ref(false);
const editing = ref<Service | null>(null);
const saving = computed(() => create.pending.value || update.pending.value);

function openCreate() {
  editing.value = null;
  dialogOpen.value = true;
}

function openEdit(service: Service) {
  editing.value = service;
  dialogOpen.value = true;
}

async function onSubmit(payload: ServiceInput) {
  const result = editing.value
    ? await update.mutate({ id: editing.value.id, input: payload })
    : await create.mutate(payload);
  if (result) {
    dialogOpen.value = false;
    editing.value = null;
  }
}

async function togglePublished(service: Service) {
  await update.mutate({ id: service.id, input: { published: !service.published } });
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader title="Services" description="What you offer — drag to set the display order.">
      <template #actions>
        <Button size="sm" class="h-9" @click="openCreate">
          <Icon name="lucide:plus" class="size-4" />
          New service
        </Button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <ul v-if="pending && items.length === 0" class="flex flex-col gap-2">
      <li v-for="n in 4" :key="`sk-${n}`">
        <Skeleton class="h-18 w-full rounded-xl" />
      </li>
    </ul>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your services</p>
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
      icon="lucide:wrench"
      title="No services yet"
      description="Add your first service to show what you offer."
    >
      <Button size="sm" @click="openCreate">
        <Icon name="lucide:plus" class="size-4" />
        New service
      </Button>
    </EmptyState>

    <!-- Populated: reorderable list -->
    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="(service, index) in reorder.ordered.value"
        :key="service.id"
        draggable="true"
        class="group flex items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-colors"
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
        <div class="flex shrink-0 flex-col items-center">
          <span
            class="flex size-7 cursor-grab items-center justify-center rounded-md text-muted-foreground active:cursor-grabbing"
            aria-hidden="true"
            title="Drag to reorder"
          >
            <Icon name="lucide:grip-vertical" class="size-4" />
          </span>
        </div>
        <div class="flex shrink-0 flex-col">
          <Button
            variant="ghost"
            size="icon-sm"
            class="size-5"
            :disabled="index === 0 || reorder.persisting.value"
            :aria-label="`Move ${service.title} up`"
            @click="reorder.moveBy(index, -1)"
          >
            <Icon name="lucide:chevron-up" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="size-5"
            :disabled="index === reorder.ordered.value.length - 1 || reorder.persisting.value"
            :aria-label="`Move ${service.title} down`"
            @click="reorder.moveBy(index, 1)"
          >
            <Icon name="lucide:chevron-down" class="size-4" />
          </Button>
        </div>

        <!-- Icon -->
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground"
        >
          <Icon :name="service.icon || 'lucide:sparkles'" class="size-5" />
        </div>

        <!-- Title + meta -->
        <div class="flex min-w-0 flex-1 flex-col">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="truncate text-left font-medium text-foreground transition-colors hover:text-primary"
              @click="openEdit(service)"
            >
              {{ service.title }}
            </button>
            <StatusBadge v-if="service.featured" tone="info" label="Featured" icon="lucide:star" />
          </div>
          <span class="truncate text-xs text-muted-foreground">{{ service.description }}</span>
        </div>

        <!-- Status -->
        <StatusBadge :published="service.published" class="shrink-0" />

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="update.pending.value"
            :aria-label="service.published ? 'Unpublish' : 'Publish'"
            :title="service.published ? 'Unpublish' : 'Publish'"
            @click="togglePublished(service)"
          >
            <Icon :name="service.published ? 'lucide:eye-off' : 'lucide:eye'" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit"
            title="Edit"
            @click="openEdit(service)"
          >
            <Icon name="lucide:pencil" class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:text-destructive"
            aria-label="Delete"
            title="Delete"
            @click="removeWithConfirm(service.id, service.title)"
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
          <DialogTitle>{{ editing ? 'Edit service' : 'New service' }}</DialogTitle>
          <DialogDescription>
            {{ editing ? 'Update this service.' : 'Add a new service to your offerings.' }}
          </DialogDescription>
        </DialogHeader>
        <ServiceForm
          :key="editing?.id ?? 'new'"
          :initial="editing"
          :pending="saving"
          :submit-label="editing ? 'Save changes' : 'Create service'"
          @submit="onSubmit"
          @cancel="dialogOpen = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import type { SelectOption } from '~/modules/dashboard/components/form/FormSelect.vue';
import type { DataTableColumn, SortState } from '~/modules/dashboard/types';

/**
 * TEMPORARY showcase route (`/dashboard/primitives`). Demonstrates every shared
 * primitive in isolation so Phase 3 can be verified without a real resource page.
 * DELETE once the resource CRUD phases (4+) exercise these for real.
 */
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Primitives' });

const toast = useToast();
const confirm = useConfirm();

// ── Form demo ────────────────────────────────────────────────────────────────
const demoSchema = z.object({
  title: z.string().min(3, 'At least 3 characters'),
  description: z.string().min(10, 'At least 10 characters'),
  website: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  category: z.string().min(1, 'Pick a category'),
  launchDate: z.string().optional(),
  technologies: z.array(z.string()).min(1, 'Add at least one'),
  published: z.boolean(),
  featured: z.boolean(),
});
type DemoForm = z.infer<typeof demoSchema>;

const initialValues: Partial<DemoForm> = {
  title: '',
  description: '',
  website: '',
  category: '',
  technologies: [],
  published: false,
  featured: false,
};

const categories: SelectOption[] = [
  { label: 'Web app', value: 'web' },
  { label: 'Mobile app', value: 'mobile' },
  { label: 'Library', value: 'library' },
];

const submitting = ref(false);
async function onSubmit(values: DemoForm) {
  submitting.value = true;
  await new Promise((r) => setTimeout(r, 600)); // simulate a mutation
  submitting.value = false;
  toast.success('Form submitted', JSON.stringify(values).slice(0, 80) + '…');
}

// ── Table demo ───────────────────────────────────────────────────────────────
interface DemoRow {
  id: string;
  name: string;
  type: string;
  published: boolean;
  updated: string;
}

const allRows: DemoRow[] = [
  { id: '1', name: 'Aurora landing', type: 'Web', published: true, updated: '2026-06-10' },
  { id: '2', name: 'Pocket ledger', type: 'Mobile', published: false, updated: '2026-06-12' },
  { id: '3', name: 'Reka charts', type: 'Library', published: true, updated: '2026-05-30' },
  { id: '4', name: 'Nimbus CMS', type: 'Web', published: false, updated: '2026-06-01' },
  { id: '5', name: 'Drift player', type: 'Mobile', published: true, updated: '2026-06-13' },
];

const columns: DataTableColumn<DemoRow>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type', width: '10rem' },
  { key: 'status', label: 'Status', width: '9rem' },
  { key: 'updated', label: 'Updated', sortable: true, width: '11rem', align: 'end' },
];

const search = ref('');
const sort = ref<SortState>({ key: 'updated', direction: 'desc' });
const page = ref(1);
const limit = 3;
const loading = ref(false);

const filtered = computed(() =>
  allRows.filter((r) => r.name.toLowerCase().includes(search.value.toLowerCase())),
);
const sorted = computed(() => {
  const dir = sort.value.direction === 'asc' ? 1 : -1;
  return [...filtered.value].sort((a, b) => {
    const key = sort.value.key as keyof DemoRow;
    return a[key] < b[key] ? -dir : a[key] > b[key] ? dir : 0;
  });
});
const paged = computed(() => sorted.value.slice((page.value - 1) * limit, page.value * limit));
const meta = computed(() => {
  const total = sorted.value.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page: page.value,
    limit,
    totalPages,
    hasNextPage: page.value < totalPages,
    hasPrevPage: page.value > 1,
  };
});

watch([search, sort], () => (page.value = 1));

async function fakeDelete(row: DemoRow) {
  try {
    await confirm.ask({
      title: 'Delete item?',
      message: `"${row.name}" will be removed. (Demo only — nothing is deleted.)`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    toast.success('Deleted', `${row.name} (demo)`);
  } catch {
    /* cancelled */
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader
      title="Primitives"
      description="Temporary showcase of the shared dashboard building blocks (Phase 3)."
    />

    <!-- StatusBadge variants -->
    <section class="flex flex-col gap-3">
      <h2 class="font-display text-lg text-foreground">StatusBadge</h2>
      <div class="flex flex-wrap items-center gap-2">
        <StatusBadge :published="true" />
        <StatusBadge :published="false" />
        <StatusBadge tone="info" label="Featured" icon="lucide:star" />
        <StatusBadge tone="warning" label="Expiring" />
      </div>
    </section>

    <!-- DataTable: Toolbar + sort + pagination + actions + confirm -->
    <section class="flex flex-col gap-3">
      <h2 class="font-display text-lg text-foreground">DataTable + Toolbar</h2>
      <Toolbar v-model:search="search" placeholder="Search items…">
        <template #actions>
          <Button size="sm" class="h-9" @click="loading = !loading">
            <Icon name="lucide:loader-circle" class="size-4" />
            Toggle loading
          </Button>
        </template>
      </Toolbar>
      <DataTable
        :columns="columns"
        :rows="paged"
        :loading="loading"
        :sort="sort"
        :meta="meta"
        empty-title="No items match"
        @update:sort="sort = $event"
        @update:page="page = $event"
      >
        <template #cell-status="{ row }">
          <StatusBadge :published="row.published" />
        </template>
        <template #actions="{ row }">
          <Button variant="ghost" size="icon-sm" aria-label="Delete" @click="fakeDelete(row)">
            <Icon name="lucide:trash-2" class="size-4" />
          </Button>
        </template>
      </DataTable>
    </section>

    <!-- FormShell + every field wrapper -->
    <section class="flex max-w-xl flex-col gap-3">
      <h2 class="font-display text-lg text-foreground">FormShell + fields</h2>
      <div class="rounded-xl border border-border bg-card p-5">
        <FormShell
          :schema="demoSchema"
          :initial-values="initialValues"
          :pending="submitting"
          submit-label="Submit demo"
          @submit="onSubmit"
        >
          <FormText name="title" label="Title" placeholder="Project title" required />
          <FormTextarea
            name="description"
            label="Description"
            placeholder="What is it?"
            description="Markdown is fine."
            required
          />
          <FormText name="website" type="url" label="Website" placeholder="https://…" />
          <FormSelect
            name="category"
            label="Category"
            :options="categories"
            placeholder="Pick one"
            required
          />
          <FormDate name="launchDate" label="Launch date" />
          <FormTagInput
            name="technologies"
            label="Technologies"
            placeholder="Add a tech, press Enter"
            required
          />
          <FormSwitch
            name="published"
            label="Published"
            description="Visible on the public site."
          />
          <FormSwitch name="featured" label="Featured" description="Pin to the top." />
        </FormShell>
      </div>
    </section>
  </div>
</template>

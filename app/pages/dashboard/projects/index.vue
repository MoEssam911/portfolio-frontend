<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminProjects } from '~/modules/dashboard/composables/useAdminProjects';
import type { DataTableColumn, Project } from '~/modules/dashboard/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Projects' });

const { items, meta, pending, error, refresh, update, removeWithConfirm } = useAdminProjects();
const { formatRelative } = useFormatters();

// ── Client-side search + filters (over the loaded page) ──────────────────────
const search = ref('');
const publishedFilter = ref<'all' | 'published' | 'draft'>('all');
const featuredFilter = ref<'all' | 'featured' | 'standard'>('all');

const hasActiveFilter = computed(
  () =>
    search.value.trim() !== '' || publishedFilter.value !== 'all' || featuredFilter.value !== 'all',
);

const filtered = computed<Project[]>(() => {
  const q = search.value.trim().toLowerCase();
  return items.value.filter((p) => {
    if (publishedFilter.value === 'published' && !p.published) return false;
    if (publishedFilter.value === 'draft' && p.published) return false;
    if (featuredFilter.value === 'featured' && !p.featured) return false;
    if (featuredFilter.value === 'standard' && p.featured) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.excerpt?.toLowerCase().includes(q) ?? false) ||
      p.technologies.some((t) => t.toLowerCase().includes(q))
    );
  });
});

const isEmpty = computed(() => !pending.value && !error.value && items.value.length === 0);

const columns: DataTableColumn<Project>[] = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status', width: '9rem' },
  { key: 'featured', label: 'Featured', width: '8rem' },
  { key: 'updatedAt', label: 'Updated', width: '11rem', align: 'end' },
];

async function togglePublished(project: Project) {
  await update.mutate({ id: project.id, input: { published: !project.published } });
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader title="Projects" description="Manage your case studies and portfolio work.">
      <template #actions>
        <Button as-child size="sm" class="h-9">
          <NuxtLink to="/dashboard/projects/new">
            <Icon name="lucide:plus" class="size-4" />
            New project
          </NuxtLink>
        </Button>
      </template>
    </PageHeader>

    <!-- Error -->
    <div
      v-if="error"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your projects</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Empty (no projects at all) -->
    <EmptyState
      v-else-if="isEmpty"
      icon="lucide:folder-git-2"
      title="No projects yet"
      description="Create your first project to showcase your work."
    >
      <Button as-child size="sm">
        <NuxtLink to="/dashboard/projects/new">
          <Icon name="lucide:plus" class="size-4" />
          New project
        </NuxtLink>
      </Button>
    </EmptyState>

    <!-- Loading + populated -->
    <template v-else>
      <Toolbar v-model:search="search" placeholder="Search title, excerpt, or tech…">
        <template #filters>
          <SelectRoot v-model="publishedFilter">
            <SelectTrigger class="h-9 w-[8.5rem]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </SelectRoot>
          <SelectRoot v-model="featuredFilter">
            <SelectTrigger class="h-9 w-[8.5rem]" aria-label="Filter by featured">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="standard">Not featured</SelectItem>
            </SelectContent>
          </SelectRoot>
        </template>
      </Toolbar>

      <DataTable
        :columns="columns"
        :rows="filtered"
        :loading="pending"
        :meta="hasActiveFilter ? null : meta"
        empty-icon="lucide:search-x"
        empty-title="No matching projects"
        empty-description="Try a different search or clear the filters."
      >
        <template #cell-title="{ row }">
          <div class="flex min-w-0 flex-col">
            <NuxtLink
              :to="`/dashboard/projects/${row.slug}`"
              class="truncate font-medium text-foreground transition-colors hover:text-primary"
            >
              {{ row.title }}
            </NuxtLink>
            <span v-if="row.excerpt" class="truncate text-xs text-muted-foreground">{{
              row.excerpt
            }}</span>
          </div>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :published="row.published" />
        </template>
        <template #cell-featured="{ row }">
          <StatusBadge v-if="row.featured" tone="info" label="Featured" icon="lucide:star" />
          <span v-else class="text-muted-foreground">—</span>
        </template>
        <template #cell-updatedAt="{ row }">
          <span class="text-muted-foreground">{{ formatRelative(row.updatedAt) }}</span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              :disabled="update.pending.value"
              :aria-label="row.published ? 'Unpublish' : 'Publish'"
              :title="row.published ? 'Unpublish' : 'Publish'"
              @click="togglePublished(row)"
            >
              <Icon :name="row.published ? 'lucide:eye-off' : 'lucide:eye'" class="size-4" />
            </Button>
            <Button as-child variant="ghost" size="icon-sm" aria-label="Edit" title="Edit">
              <NuxtLink :to="`/dashboard/projects/${row.slug}`">
                <Icon name="lucide:pencil" class="size-4" />
              </NuxtLink>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground hover:text-destructive"
              aria-label="Delete"
              title="Delete"
              @click="removeWithConfirm(row.id, row.title)"
            >
              <Icon name="lucide:trash-2" class="size-4" />
            </Button>
          </div>
        </template>
      </DataTable>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminBlog } from '~/modules/dashboard/composables/useAdminBlog';
import type { BlogPost, DataTableColumn } from '~/modules/dashboard/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Blog' });

const { items, meta, pending, error, refresh, update, removeWithConfirm } = useAdminBlog();
const { formatRelative } = useFormatters();

// ── Client-side search + filter (over the loaded page) ───────────────────────
const search = ref('');
const publishedFilter = ref<'all' | 'published' | 'draft'>('all');

const hasActiveFilter = computed(
  () => search.value.trim() !== '' || publishedFilter.value !== 'all',
);

const filtered = computed<BlogPost[]>(() => {
  const q = search.value.trim().toLowerCase();
  return items.value.filter((p) => {
    if (publishedFilter.value === 'published' && !p.published) return false;
    if (publishedFilter.value === 'draft' && p.published) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.excerpt?.toLowerCase().includes(q) ?? false) ||
      p.tags.some((t) => t.name.toLowerCase().includes(q))
    );
  });
});

const isEmpty = computed(() => !pending.value && !error.value && items.value.length === 0);

const columns: DataTableColumn<BlogPost>[] = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status', width: '9rem' },
  { key: 'tags', label: 'Tags' },
  { key: 'updatedAt', label: 'Updated', width: '11rem', align: 'end' },
];

async function togglePublished(post: BlogPost) {
  await update.mutate({ id: post.id, input: { published: !post.published } });
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader title="Blog" description="Write and manage your articles.">
      <template #actions>
        <Button as-child size="sm" class="h-9">
          <NuxtLink to="/dashboard/blog/new">
            <Icon name="lucide:plus" class="size-4" />
            New post
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
        <p class="font-display text-base text-foreground">Couldn't load your posts</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Empty (no posts at all) -->
    <EmptyState
      v-else-if="isEmpty"
      icon="lucide:newspaper"
      title="No posts yet"
      description="Write your first article to share your thinking."
    >
      <Button as-child size="sm">
        <NuxtLink to="/dashboard/blog/new">
          <Icon name="lucide:plus" class="size-4" />
          New post
        </NuxtLink>
      </Button>
    </EmptyState>

    <!-- Loading + populated -->
    <template v-else>
      <Toolbar v-model:search="search" placeholder="Search title, excerpt, or tags…">
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
        </template>
      </Toolbar>

      <DataTable
        :columns="columns"
        :rows="filtered"
        :loading="pending"
        :meta="hasActiveFilter ? null : meta"
        empty-icon="lucide:search-x"
        empty-title="No matching posts"
        empty-description="Try a different search or clear the filter."
      >
        <template #cell-title="{ row }">
          <div class="flex min-w-0 flex-col">
            <NuxtLink
              :to="`/dashboard/blog/${row.slug}`"
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
        <template #cell-tags="{ row }">
          <div v-if="row.tags.length" class="flex flex-wrap gap-1">
            <span
              v-for="tag in row.tags.slice(0, 3)"
              :key="tag.id"
              class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {{ tag.name }}
            </span>
            <span v-if="row.tags.length > 3" class="text-xs text-muted-foreground">
              +{{ row.tags.length - 3 }}
            </span>
          </div>
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
              <NuxtLink :to="`/dashboard/blog/${row.slug}`">
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

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityItem } from '~/modules/dashboard/composables/useDashboardStats';
import type { DataTableColumn } from '~/modules/dashboard/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Overview' });

const { user } = useAuth();
const { stats, recent, pending, error, refresh } = useDashboardStats();

const totalCount = computed(() => stats.value.reduce((sum, s) => sum + s.total, 0));
const isEmpty = computed(() => !pending.value && !error.value && totalCount.value === 0);

const quickCreate = [
  { label: 'New project', to: '/dashboard/projects', icon: 'lucide:folder-git-2' },
  { label: 'New post', to: '/dashboard/blog', icon: 'lucide:newspaper' },
];

const activityColumns: DataTableColumn<ActivityItem>[] = [
  { key: 'title', label: 'Item' },
  { key: 'resource', label: 'Type', width: '10rem' },
  { key: 'status', label: 'Status', width: '9rem' },
  { key: 'updatedAt', label: 'Updated', width: '11rem', align: 'end' },
];

const { formatRelative } = useFormatters();
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader
      title="Overview"
      :description="`Welcome back${user ? `, ${user.username}` : ''}. Here's the state of your content.`"
    >
      <template #actions>
        <Button
          v-for="action in quickCreate"
          :key="action.to"
          as-child
          variant="outline"
          size="sm"
          class="h-9"
        >
          <NuxtLink :to="action.to">
            <Icon :name="action.icon" class="size-4" />
            {{ action.label }}
          </NuxtLink>
        </Button>
      </template>
    </PageHeader>

    <!-- Error state -->
    <div
      v-if="error"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your dashboard</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Check that you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Empty state (no content anywhere yet) -->
    <EmptyState
      v-else-if="isEmpty"
      icon="lucide:sparkles"
      title="Your portfolio is empty"
      description="Create your first project or blog post to see stats and activity here."
    >
      <div class="flex flex-wrap justify-center gap-2">
        <Button v-for="action in quickCreate" :key="action.to" as-child size="sm">
          <NuxtLink :to="action.to">
            <Icon :name="action.icon" class="size-4" />
            {{ action.label }}
          </NuxtLink>
        </Button>
      </div>
    </EmptyState>

    <!-- Loading + populated -->
    <template v-else>
      <!-- Stat cards -->
      <section
        aria-label="Content stats"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <template v-if="pending">
          <div
            v-for="n in 4"
            :key="`stat-sk-${n}`"
            class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-8 w-12" />
            <Skeleton class="h-3 w-32" />
          </div>
        </template>

        <NuxtLink
          v-for="stat in stats"
          v-else
          :key="stat.key"
          :to="stat.to"
          class="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary-border hover:bg-muted/30"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">{{ stat.label }}</span>
            <Icon
              :name="stat.icon"
              class="size-4 text-muted-foreground transition-colors group-hover:text-primary"
            />
          </div>
          <span class="font-display text-3xl text-foreground">{{ stat.total }}</span>
          <div class="flex items-center gap-3 text-xs text-muted-foreground">
            <span class="inline-flex items-center gap-1">
              <span class="size-1.5 rounded-full bg-success" aria-hidden="true" />
              {{ stat.published }} published
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="size-1.5 rounded-full bg-muted-foreground/60" aria-hidden="true" />
              {{ stat.draft }} draft
            </span>
          </div>
        </NuxtLink>
      </section>

      <!-- Recent activity -->
      <section aria-label="Recent activity" class="flex flex-col gap-3">
        <h2 class="font-display text-lg text-foreground">Recent activity</h2>
        <DataTable
          :columns="activityColumns"
          :rows="recent"
          :loading="pending"
          empty-icon="lucide:history"
          empty-title="No recent activity"
          empty-description="Edits to projects and posts will show up here."
        >
          <template #cell-title="{ row }">
            <div class="flex items-center gap-2">
              <Icon :name="row.icon" class="size-4 shrink-0 text-muted-foreground" />
              <span class="truncate font-medium">{{ row.title }}</span>
            </div>
          </template>
          <template #cell-resource="{ row }">
            <span class="text-muted-foreground">{{ row.resource }}</span>
          </template>
          <template #cell-status="{ row }">
            <StatusBadge :published="row.published" />
          </template>
          <template #cell-updatedAt="{ row }">
            <span class="text-muted-foreground">{{ formatRelative(row.updatedAt) }}</span>
          </template>
          <template #actions="{ row }">
            <Button as-child variant="ghost" size="icon-sm" aria-label="Open">
              <NuxtLink :to="row.to"><Icon name="lucide:arrow-up-right" class="size-4" /></NuxtLink>
            </Button>
          </template>
        </DataTable>
      </section>
    </template>
  </div>
</template>

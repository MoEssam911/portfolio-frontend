<script setup lang="ts" generic="T">
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DataTableColumn, SortState, TableAlign } from '~/modules/dashboard/types';
import type { PaginationMeta } from '~/shared/types/api';

/**
 * DataTable — the generic resource table every list page reuses.
 *
 * Generic over the row type `T`. Render cells with `#cell-<key>` slots
 * (`{ row, value }`), or rely on `column.accessor` for plain text. Row actions
 * go in the `#actions` slot (`{ row }`), rendered in a trailing column. Handles
 * the loading (skeleton) / empty / populated states; the page owns the error
 * state (show it instead of the table). Sorting and pagination are controlled —
 * the table emits `update:sort` / `update:page` and the page re-reads.
 *
 *   <DataTable :columns="columns" :rows="items" :loading="pending" :meta="meta"
 *     :sort="sort" @update:sort="..." @update:page="page = $event">
 *     <template #cell-status="{ row }"><StatusBadge :published="row.published" /></template>
 *     <template #actions="{ row }">…</template>
 *   </DataTable>
 */
const props = withDefaults(
  defineProps<{
    columns: DataTableColumn<T>[];
    rows: T[];
    /** Row identity — a key of `T` or an accessor. Defaults to `'id'`. */
    rowKey?: keyof T | ((row: T) => string | number);
    loading?: boolean;
    sort?: SortState | null;
    /** Pagination meta from `useResourceList`; omit to hide the footer. */
    meta?: PaginationMeta | null;
    skeletonRows?: number;
    emptyIcon?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  }>(),
  {
    rowKey: 'id' as never,
    loading: false,
    sort: null,
    meta: null,
    skeletonRows: 6,
    emptyIcon: 'lucide:inbox',
    emptyTitle: 'Nothing here yet',
    emptyDescription: undefined,
  },
);

const emit = defineEmits<{
  'update:sort': [value: SortState];
  'update:page': [page: number];
}>();

const slots = useSlots();
const hasActions = computed(() => Boolean(slots.actions));
const columnCount = computed(() => props.columns.length + (hasActions.value ? 1 : 0));
const showEmpty = computed(() => !props.loading && props.rows.length === 0);

const alignClass: Record<TableAlign, string> = {
  start: 'text-left',
  center: 'text-center',
  end: 'text-right',
};

function rowId(row: T, index: number): string | number {
  const rk = props.rowKey;
  if (typeof rk === 'function') return rk(row);
  const value = (row as Record<string, unknown>)[rk as string];
  return value == null ? index : (value as string | number);
}

function cellValue(row: T, column: DataTableColumn<T>): unknown {
  if (column.accessor) return column.accessor(row);
  return (row as Record<string, unknown>)[column.key];
}

function toggleSort(column: DataTableColumn<T>) {
  if (!column.sortable) return;
  const direction =
    props.sort?.key === column.key && props.sort.direction === 'asc' ? 'desc' : 'asc';
  emit('update:sort', { key: column.key, direction });
}

function sortIcon(column: DataTableColumn<T>): string {
  if (props.sort?.key !== column.key) return 'lucide:chevrons-up-down';
  return props.sort.direction === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down';
}

// ── Pagination ───────────────────────────────────────────────────────────────
const showPagination = computed(() => Boolean(props.meta && props.meta.totalPages > 1));
function goTo(page: number) {
  if (!props.meta) return;
  const clamped = Math.min(Math.max(1, page), props.meta.totalPages);
  if (clamped !== props.meta.page) emit('update:page', clamped);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-border">
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                :style="column.width ? { width: column.width } : undefined"
                :class="
                  cn(
                    'px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground',
                    alignClass[column.align ?? 'start'],
                    column.class,
                  )
                "
              >
                <button
                  v-if="column.sortable"
                  type="button"
                  :class="
                    cn(
                      'inline-flex items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      column.align === 'end' && 'flex-row-reverse',
                    )
                  "
                  :aria-label="`Sort by ${column.label}`"
                  @click="toggleSort(column)"
                >
                  {{ column.label }}
                  <Icon
                    :name="sortIcon(column)"
                    :class="
                      cn(
                        'size-3.5',
                        sort?.key === column.key ? 'text-foreground' : 'text-muted-foreground/60',
                      )
                    "
                  />
                </button>
                <span v-else>{{ column.label }}</span>
              </th>
              <th v-if="hasActions" scope="col" class="px-4 py-2.5 text-right">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- Loading skeletons -->
            <template v-if="loading">
              <tr
                v-for="n in skeletonRows"
                :key="`sk-${n}`"
                class="border-b border-border last:border-0"
              >
                <td v-for="column in columns" :key="column.key" class="px-4 py-3">
                  <Skeleton class="h-4" :class="n % 2 ? 'w-3/4' : 'w-1/2'" />
                </td>
                <td v-if="hasActions" class="px-4 py-3">
                  <Skeleton class="ml-auto h-7 w-7 rounded-md" />
                </td>
              </tr>
            </template>

            <!-- Empty -->
            <tr v-else-if="showEmpty">
              <td :colspan="columnCount" class="p-0">
                <slot name="empty">
                  <EmptyState
                    compact
                    :icon="emptyIcon"
                    :title="emptyTitle"
                    :description="emptyDescription"
                  />
                </slot>
              </td>
            </tr>

            <!-- Populated -->
            <template v-else>
              <tr
                v-for="(row, index) in rows"
                :key="rowId(row, index)"
                class="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="
                    cn(
                      'px-4 py-3 text-foreground',
                      alignClass[column.align ?? 'start'],
                      column.class,
                    )
                  "
                >
                  <slot :name="`cell-${column.key}`" :row="row" :value="cellValue(row, column)">
                    {{ cellValue(row, column) ?? '—' }}
                  </slot>
                </td>
                <td v-if="hasActions" class="px-4 py-3 text-right">
                  <slot name="actions" :row="row" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination control -->
    <div
      v-if="showPagination && meta"
      class="flex items-center justify-between gap-3 text-sm text-muted-foreground"
    >
      <p>
        Page <span class="text-foreground">{{ meta.page }}</span> of {{ meta.totalPages }}
        <span class="hidden sm:inline">· {{ meta.total }} total</span>
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="h-8"
          :disabled="!meta.hasPrevPage"
          @click="goTo(meta.page - 1)"
        >
          <Icon name="lucide:chevron-left" class="size-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="h-8"
          :disabled="!meta.hasNextPage"
          @click="goTo(meta.page + 1)"
        >
          Next
          <Icon name="lucide:chevron-right" class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

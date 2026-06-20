<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminMessages } from '~/modules/dashboard/composables/useAdminMessages';
import type { ContactMessage, DataTableColumn } from '~/modules/dashboard/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Messages' });

const { items, meta, page, pending, error, refresh, unreadCount, setRead, removeWithConfirm } =
  useAdminMessages();
const { formatDateTime, formatRelative } = useFormatters();

// ── Client-side search + filter (over the loaded page) ───────────────────────
const search = ref('');
const readFilter = ref<'all' | 'unread' | 'read'>('all');

const hasActiveFilter = computed(() => search.value.trim() !== '' || readFilter.value !== 'all');

const filtered = computed<ContactMessage[]>(() => {
  const q = search.value.trim().toLowerCase();
  return items.value.filter((m) => {
    if (readFilter.value === 'unread' && m.read) return false;
    if (readFilter.value === 'read' && !m.read) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });
});

const isEmpty = computed(() => !pending.value && !error.value && items.value.length === 0);

const columns: DataTableColumn<ContactMessage>[] = [
  { key: 'name', label: 'From' },
  { key: 'subject', label: 'Subject' },
  { key: 'delivered', label: 'Delivered', width: '8rem', align: 'center' },
  { key: 'createdAt', label: 'Received', width: '11rem', align: 'end' },
];

// ── Detail dialog ────────────────────────────────────────────────────────────
const open = ref(false);
const selected = ref<ContactMessage | null>(null);

function openDetail(message: ContactMessage) {
  selected.value = message;
  open.value = true;
  // Auto-mark as read on open (silent — no toast).
  if (!message.read) setRead.mutate({ id: message.id, read: true });
}

function toggleRead(message: ContactMessage) {
  setRead.mutate({ id: message.id, read: !message.read });
  if (selected.value?.id === message.id) {
    selected.value = { ...selected.value, read: !message.read };
  }
}

async function onDelete(message: ContactMessage) {
  const result = await removeWithConfirm(message.id, `Message from ${message.name}`);
  if (result && selected.value?.id === message.id) open.value = false;
}

function mailtoReply(message: ContactMessage): string {
  const subject = message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`;
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}`;
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader title="Messages" description="Contact-form submissions from your site.">
      <template #actions>
        <span
          v-if="unreadCount > 0"
          class="inline-flex items-center gap-1.5 rounded-full border border-primary-border bg-primary-muted px-3 py-1 text-sm text-primary"
        >
          <Icon name="lucide:mail" class="size-4" />
          {{ unreadCount }} unread
        </span>
      </template>
    </PageHeader>

    <!-- Error -->
    <div
      v-if="error"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your messages</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Empty (no messages at all) -->
    <EmptyState
      v-else-if="isEmpty"
      icon="lucide:inbox"
      title="No messages yet"
      description="When someone submits your contact form, their message shows up here."
    />

    <!-- Loading + populated -->
    <template v-else>
      <Toolbar v-model:search="search" placeholder="Search sender, subject, or message…">
        <template #filters>
          <SelectRoot v-model="readFilter">
            <SelectTrigger class="h-9 w-[8.5rem]" aria-label="Filter by read status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
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
        empty-title="No matching messages"
        empty-description="Try a different search or clear the filter."
        @update:page="page = $event"
      >
        <template #cell-name="{ row }">
          <button
            type="button"
            class="flex min-w-0 items-center gap-2 text-left"
            @click="openDetail(row)"
          >
            <span
              class="size-2 shrink-0 rounded-full"
              :class="row.read ? 'bg-transparent' : 'bg-primary'"
              :aria-label="row.read ? undefined : 'Unread'"
            />
            <span class="flex min-w-0 flex-col">
              <span
                class="truncate text-foreground transition-colors hover:text-primary"
                :class="!row.read && 'font-semibold'"
              >
                {{ row.name }}
              </span>
              <span class="truncate text-xs text-muted-foreground">{{ row.email }}</span>
            </span>
          </button>
        </template>
        <template #cell-subject="{ row }">
          <button
            type="button"
            class="block max-w-md truncate text-left text-foreground transition-colors hover:text-primary"
            :class="!row.read && 'font-medium'"
            @click="openDetail(row)"
          >
            {{ row.subject }}
          </button>
        </template>
        <template #cell-delivered="{ row }">
          <StatusBadge
            :tone="row.delivered ? 'success' : 'warning'"
            :label="row.delivered ? 'Sent' : 'Not sent'"
            :icon="row.delivered ? 'lucide:check' : 'lucide:triangle-alert'"
          />
        </template>
        <template #cell-createdAt="{ row }">
          <span class="text-muted-foreground" :title="formatDateTime(row.createdAt)">
            {{ formatRelative(row.createdAt) }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="View message"
              title="View"
              @click="openDetail(row)"
            >
              <Icon name="lucide:eye" class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              :disabled="setRead.pending.value"
              :aria-label="row.read ? 'Mark as unread' : 'Mark as read'"
              :title="row.read ? 'Mark as unread' : 'Mark as read'"
              @click="toggleRead(row)"
            >
              <Icon :name="row.read ? 'lucide:mail' : 'lucide:mail-open'" class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground hover:text-destructive"
              aria-label="Delete"
              title="Delete"
              @click="onDelete(row)"
            >
              <Icon name="lucide:trash-2" class="size-4" />
            </Button>
          </div>
        </template>
      </DataTable>
    </template>

    <!-- Detail dialog -->
    <Dialog :open="open" @update:open="open = $event">
      <DialogContent
        v-if="selected"
        class="flex max-h-[90vh] flex-col gap-4 overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle class="pr-6">{{ selected.subject }}</DialogTitle>
          <DialogDescription>
            From {{ selected.name }} &lt;{{ selected.email }}&gt; ·
            {{ formatDateTime(selected.createdAt) }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge
            :tone="selected.delivered ? 'success' : 'warning'"
            :label="selected.delivered ? 'Email delivered' : 'Email not delivered'"
            :icon="selected.delivered ? 'lucide:check' : 'lucide:triangle-alert'"
          />
          <StatusBadge
            :tone="selected.read ? 'neutral' : 'info'"
            :label="selected.read ? 'Read' : 'Unread'"
          />
        </div>

        <div
          class="whitespace-pre-wrap rounded-xl border border-border bg-card/40 p-4 text-sm text-foreground"
        >
          {{ selected.message }}
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="ghost"
            size="sm"
            class="mr-auto text-muted-foreground hover:text-destructive"
            @click="onDelete(selected)"
          >
            <Icon name="lucide:trash-2" class="size-4" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="setRead.pending.value"
            @click="toggleRead(selected)"
          >
            <Icon :name="selected.read ? 'lucide:mail' : 'lucide:mail-open'" class="size-4" />
            Mark as {{ selected.read ? 'unread' : 'read' }}
          </Button>
          <Button as-child size="sm">
            <a :href="mailtoReply(selected)">
              <Icon name="lucide:reply" class="size-4" />
              Reply
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

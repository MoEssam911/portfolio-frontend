import type { ContactMessage, ContactMessageInput } from '~/modules/contact/types';
import { $admin } from '~/modules/dashboard/composables/useAdminApi';
import { useAdminMutation } from '~/modules/dashboard/composables/useAdminMutation';
import { useResourceList } from '~/modules/dashboard/composables/useResourceList';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';

/**
 * useAdminMessages — the dashboard contact-inbox data layer (read-only over the
 * message body; only the `read` flag is mutable, plus delete).
 *
 * The list is a STANDARD paginated read (`GET /dashboard/messages`, newest
 * first) via `useResourceList`. Deletes go through `useResourceMutations`
 * (toast + confirm). Marking read/unread uses its own SILENT mutation (no toast)
 * since it fires automatically when a message is opened — a toast every time
 * would be noise. Every successful write re-reads the page so the unread badge
 * and counts stay in sync.
 */
export function useAdminMessages() {
  const { items, meta, page, pending, error, refresh } = useResourceList<ContactMessage>(
    'messages',
    {
      limit: 20,
      key: 'admin-messages-list',
    },
  );

  const onChange = async () => {
    await refresh();
  };

  const { remove, removeWithConfirm } = useResourceMutations<ContactMessage, ContactMessageInput>(
    'messages',
    { label: 'Message', onChange },
  );

  // Silent — fired on open / from the row toggle, so no success toast.
  const setRead = useAdminMutation<ContactMessage, { id: string; read: boolean }>(
    ({ id, read }) =>
      $admin<ContactMessage>(`/messages/${id}`, { method: 'PATCH', body: { read } }),
    { onSuccess: onChange },
  );

  /** Unread count over the loaded page (used for the header badge). */
  const unreadCount = computed(() => items.value.filter((m) => !m.read).length);

  return {
    items,
    meta,
    page,
    pending,
    error,
    refresh,
    unreadCount,
    setRead,
    remove,
    removeWithConfirm,
  };
}

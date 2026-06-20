import { useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';
import type { Service, ServiceInput } from '~/modules/services/types';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * useAdminServices — the dashboard Services data layer.
 *
 * Unlike Projects/Blog, the services list is NOT paginated — the backend's
 * `GET /dashboard/services` returns the full set ordered by `order` asc. So this
 * reads a plain `ApiSuccess<Service[]>` through the shared read primitive rather
 * than `useResourceList`. Writes (create/update/delete by id) go through
 * `useResourceMutations`; reordering is handled separately by `useReorderableList`
 * against `PATCH /services/reorder`. Client-only — admin data never enters SSR.
 *
 *   const { items, pending, error, refresh,
 *           create, update, removeWithConfirm } = useAdminServices()
 */
export function useAdminServices() {
  const { data, pending, error, refresh } = useAdminApiFetch<ApiSuccess<Service[]>, Service[]>(
    '/services',
    {
      key: 'admin-services-list',
      default: () => [],
      getCachedData: undefined,
      server: false,
    },
  );

  const items = computed<Service[]>(() => data.value ?? []);

  // TUpdate is widened to a partial so inline edits (e.g. a publish toggle from
  // the list) can PATCH a single field; the dialog form sends a full `ServiceInput`.
  const mutations = useResourceMutations<Service, ServiceInput, Partial<ServiceInput>>('services', {
    label: 'Service',
    onChange: async () => {
      await refresh();
    },
  });

  return {
    items,
    pending,
    error,
    refresh: async () => {
      await refresh();
    },
    ...mutations,
  };
}

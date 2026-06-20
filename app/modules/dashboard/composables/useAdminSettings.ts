import { $admin, useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import { useAdminMutation } from '~/modules/dashboard/composables/useAdminMutation';
import type { SettingsInput, SiteSettings } from '~/modules/settings/types';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * useAdminSettings — the dashboard Settings data layer.
 *
 * Settings is a SINGLETON: `GET /dashboard/settings` returns the owner's full
 * settings row (or `null` if none exists yet), and `PATCH /dashboard/settings`
 * UPSERTS — it creates the row with sensible defaults on first save, else updates.
 * So there is no create/delete; this reads once and exposes a single `save`
 * mutation (a bespoke `useAdminMutation`, not `useResourceMutations`).
 *
 * The read is typed as the public-safe {@link SiteSettings} subset; the backend
 * returns a few extra columns (id, timestamps, userId) which are simply ignored.
 *
 * Client-only — admin data never enters the SSR payload.
 */
export function useAdminSettings() {
  const { data, pending, error, refresh } = useAdminApiFetch<
    ApiSuccess<SiteSettings | null>,
    SiteSettings | null
  >('/settings', {
    key: 'admin-settings',
    default: () => null,
    getCachedData: undefined,
    server: false,
  });

  const settings = computed<SiteSettings | null>(() => data.value);

  const save = useAdminMutation<SiteSettings, SettingsInput>(
    (input) => $admin<SiteSettings>('/settings', { method: 'PATCH', body: input }),
    {
      successMessage: 'Settings saved',
      onSuccess: async () => {
        await refresh();
      },
    },
  );

  return { settings, pending, error, refresh, save };
}

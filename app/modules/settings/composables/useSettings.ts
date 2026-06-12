import type { SiteSettings } from '~/modules/settings/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useSettings() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const { data: _raw, pending, error } = useFetch<ApiSuccess<SiteSettings | null>>(
    `${apiBase}/settings`,
    {
      key: 'site-settings',
      getCachedData: (key, nuxtApp) =>
        nuxtApp.payload.data[key] as ApiSuccess<SiteSettings | null> | undefined,
    },
  );

  const data = computed<SiteSettings | null>(() => _raw.value?.data ?? null);

  return { data, pending, error };
}

import type { SiteSettings } from '~/modules/settings/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useSettings() {
  const { data, pending, error } = useApiFetch<ApiSuccess<SiteSettings | null>>('/settings', {
    key: 'site-settings',
    default: () => null,
  });

  return { data, pending, error };
}

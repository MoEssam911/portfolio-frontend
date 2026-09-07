import settingsData from '~/assets/data/settings.json';
import type { SiteSettings } from '~/modules/settings/types';

export function useSettings() {
  const data = computed(() => settingsData as SiteSettings);

  return { data, pending: ref(false), error: ref(null) };
}

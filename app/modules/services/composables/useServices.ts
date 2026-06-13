import type { Service } from '~/modules/services/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useServices() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const {
    data: _raw,
    pending,
    error,
  } = useFetch<ApiSuccess<Service[]>>(`${apiBase}/services`, {
    key: 'services-list',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  });

  const data = computed<Service[]>(() => _raw.value?.data ?? []);

  return { data, pending, error };
}

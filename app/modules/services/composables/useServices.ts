import type { Service } from '~/modules/services/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useServices() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const { data: _raw, pending, error } = useFetch<ApiSuccess<Service[]>>(
    `${apiBase}/services`,
    { key: 'services-list' },
  );

  const data = computed<Service[]>(() => _raw.value?.data ?? []);

  return { data, pending, error };
}

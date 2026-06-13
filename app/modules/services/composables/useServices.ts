import type { Service } from '~/modules/services/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useServices() {
  const { data, pending, error } = useApiFetch<ApiSuccess<Service[]>>('/services', {
    key: 'services-list',
    default: () => [],
  });

  return { data, pending, error };
}

import servicesData from '~/assets/data/services.json';
import type { Service } from '~/modules/services/types';

export function useServices() {
  const data = computed(() => servicesData as Service[]);

  return { data, pending: ref(false), error: ref(null) };
}

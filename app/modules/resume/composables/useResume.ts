import type { ResumeProfile } from '~/modules/resume/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useResume() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const {
    data: _raw,
    pending,
    error,
  } = useFetch<ApiSuccess<ResumeProfile>>(`${apiBase}/resume`, {
    key: 'resume',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  });

  const data = computed<ResumeProfile | null>(() => _raw.value?.data ?? null);

  return { data, pending, error };
}

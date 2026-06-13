import type { Testimonial } from '~/modules/testimonials/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useTestimonials() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const {
    data: _raw,
    pending,
    error,
  } = useFetch<ApiSuccess<Testimonial[]>>(`${apiBase}/testimonials`, {
    key: 'testimonials-list',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  });

  const data = computed<Testimonial[]>(() => _raw.value?.data ?? []);

  const featuredTestimonials = computed<Testimonial[]>(() => data.value.filter((t) => t.featured));

  return { data, pending, error, featuredTestimonials };
}

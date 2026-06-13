import type { Testimonial } from '~/modules/testimonials/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useTestimonials() {
  const { data, pending, error } = useApiFetch<ApiSuccess<Testimonial[]>>('/testimonials', {
    key: 'testimonials-list',
    default: () => [],
  });

  const featuredTestimonials = computed<Testimonial[]>(() => data.value.filter((t) => t.featured));

  return { data, pending, error, featuredTestimonials };
}

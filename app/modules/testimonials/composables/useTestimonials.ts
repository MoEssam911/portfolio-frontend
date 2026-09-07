import testimonialsData from '~/assets/data/testimonials.json';
import type { Testimonial } from '~/modules/testimonials/types';

export function useTestimonials() {
  const data = computed(() => testimonialsData as Testimonial[]);

  const featuredTestimonials = computed(() => data.value.filter((t) => t.featured));

  return { data, pending: ref(false), error: ref(null), featuredTestimonials };
}

import { useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';
import type { Testimonial, TestimonialInput } from '~/modules/testimonials/types';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * useAdminTestimonials — the dashboard Testimonials data layer.
 *
 * Mirrors `useAdminServices`: the list is NOT paginated (the backend returns the
 * full set ordered by `order` asc), so it reads a plain `ApiSuccess<Testimonial[]>`
 * through the shared read primitive. Writes go through `useResourceMutations`
 * (create/update/delete by id); reordering is handled by `useReorderableList`
 * against `PATCH /testimonials/reorder`. Client-only — admin data never enters SSR.
 *
 *   const { items, pending, error, refresh,
 *           create, update, removeWithConfirm } = useAdminTestimonials()
 */
export function useAdminTestimonials() {
  const { data, pending, error, refresh } = useAdminApiFetch<
    ApiSuccess<Testimonial[]>,
    Testimonial[]
  >('/testimonials', {
    key: 'admin-testimonials-list',
    default: () => [],
    getCachedData: undefined,
    server: false,
  });

  const items = computed<Testimonial[]>(() => data.value ?? []);

  const mutations = useResourceMutations<Testimonial, TestimonialInput, Partial<TestimonialInput>>(
    'testimonials',
    {
      label: 'Testimonial',
      onChange: async () => {
        await refresh();
      },
    },
  );

  return {
    items,
    pending,
    error,
    refresh: async () => {
      await refresh();
    },
    ...mutations,
  };
}

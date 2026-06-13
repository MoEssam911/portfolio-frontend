import type { ResumeProfile } from '~/modules/resume/types';
import type { ApiSuccess } from '~/shared/types/api';

export function useResume() {
  const { data, pending, error } = useApiFetch<ApiSuccess<ResumeProfile>, ResumeProfile | null>(
    '/resume',
    {
      key: 'resume',
      default: () => null,
    },
  );

  return { data, pending, error };
}

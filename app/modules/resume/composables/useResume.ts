import resumeData from '~/assets/data/resume.json';
import type { ResumeProfile } from '~/modules/resume/types';

export function useResume() {
  const data = computed(() => resumeData as ResumeProfile);

  return { data, pending: ref(false), error: ref(null) };
}

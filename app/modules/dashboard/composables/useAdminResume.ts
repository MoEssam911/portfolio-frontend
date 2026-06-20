import { $admin, useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import { useAdminMutation } from '~/modules/dashboard/composables/useAdminMutation';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';
import type {
  Certification,
  CertificationInput,
  Education,
  EducationInput,
  Experience,
  ExperienceInput,
  ResumeLink,
  ResumeLinkInput,
  ResumeProfile,
  ResumeProfileInput,
  SkillGroup,
  SkillGroupInput,
} from '~/modules/resume/types';
import type { ApiSuccess } from '~/shared/types/api';

/**
 * useAdminResume — the dashboard Resume data layer.
 *
 * The whole resume is a SINGLETON: `GET /dashboard/resume` auto-upserts the
 * profile and returns it with every child collection nested (experiences,
 * educations, skillGroups, certifications, links — each ordered by `order` asc).
 * So there is no per-collection list read; this reads `/resume` once and derives
 * the five collections from it. Every mutation's `onChange` re-reads `/resume`,
 * which re-seeds all the lists (including each `useReorderableList` working copy).
 *
 * Writes:
 * - The profile is patched with a bespoke `useAdminMutation` (PATCH /resume).
 * - Each collection gets a `useResourceMutations` keyed on its nested path
 *   (`resume/experiences`, …) → POST `/resume/experiences`, PATCH/DELETE
 *   `/resume/experiences/:id`. Reordering is handled separately by
 *   `useReorderableList` against `PATCH /resume/<collection>/reorder`.
 *
 * Client-only — admin data never enters the SSR payload.
 */
export function useAdminResume() {
  const { data, pending, error, refresh } = useAdminApiFetch<
    ApiSuccess<ResumeProfile>,
    ResumeProfile | null
  >('/resume', {
    key: 'admin-resume',
    default: () => null,
    getCachedData: undefined,
    server: false,
  });

  const profile = computed<ResumeProfile | null>(() => data.value);
  const experiences = computed<Experience[]>(() => data.value?.experiences ?? []);
  const educations = computed<Education[]>(() => data.value?.educations ?? []);
  const skillGroups = computed<SkillGroup[]>(() => data.value?.skillGroups ?? []);
  const certifications = computed<Certification[]>(() => data.value?.certifications ?? []);
  const links = computed<ResumeLink[]>(() => data.value?.links ?? []);

  const onChange = async () => {
    await refresh();
  };

  // Profile is a singleton PATCH — not a create/update/delete resource, so it
  // gets its own mutation rather than `useResourceMutations`.
  const profileMutation = useAdminMutation<ResumeProfile, ResumeProfileInput>(
    (input) => $admin<ResumeProfile>('/resume', { method: 'PATCH', body: input }),
    { successMessage: 'Resume profile updated', onSuccess: onChange },
  );

  const experienceMutations = useResourceMutations<
    Experience,
    ExperienceInput,
    Partial<ExperienceInput>
  >('resume/experiences', { label: 'Experience', onChange });

  const educationMutations = useResourceMutations<
    Education,
    EducationInput,
    Partial<EducationInput>
  >('resume/educations', { label: 'Education', onChange });

  const skillGroupMutations = useResourceMutations<
    SkillGroup,
    SkillGroupInput,
    Partial<SkillGroupInput>
  >('resume/skill-groups', { label: 'Skill group', onChange });

  const certificationMutations = useResourceMutations<
    Certification,
    CertificationInput,
    Partial<CertificationInput>
  >('resume/certifications', { label: 'Certification', onChange });

  const linkMutations = useResourceMutations<ResumeLink, ResumeLinkInput, Partial<ResumeLinkInput>>(
    'resume/links',
    { label: 'Link', onChange },
  );

  return {
    profile,
    experiences,
    educations,
    skillGroups,
    certifications,
    links,
    pending,
    error,
    refresh: onChange,
    profileMutation,
    experienceMutations,
    educationMutations,
    skillGroupMutations,
    certificationMutations,
    linkMutations,
  };
}

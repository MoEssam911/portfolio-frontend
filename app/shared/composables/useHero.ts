import { usePreferredReducedMotion } from '@vueuse/core';
import type { Ref } from 'vue';

/** Hero copy from static settings (with sensible fallbacks). */
export function useHeroContent() {
  const { settings } = useSiteSettings();

  const heroTitle = computed(
    () => settings.value?.heroTitle?.trim() || 'Building thoughtful products for the web.',
  );
  const heroSubtitle = computed(
    () =>
      settings.value?.heroSubtitle?.trim() ||
      'Software engineer crafting fast, accessible, and beautifully animated digital experiences.',
  );

  return { settings, heroTitle, heroSubtitle };
}

/** Resume-derived role / location / skills for the hero. */
export function useHeroStats() {
  const { data: resume } = useResume();

  const yearsExperience = computed<number | null>(() => {
    const times = (resume.value?.experiences ?? [])
      .map((e) => (e.startDate ? new Date(e.startDate).getTime() : Number.NaN))
      .filter((t) => !Number.isNaN(t));
    if (times.length === 0) return null;
    const earliest = Math.min(...times);
    const years = Math.floor((Date.now() - earliest) / (365.25 * 24 * 60 * 60 * 1000));
    return years > 0 ? years : null;
  });

  const role = computed(() => resume.value?.headline || '');
  const location = computed(() => resume.value?.location || '');

  const topSkills = computed<string[]>(() => {
    const out: string[] = [];
    for (const group of resume.value?.skillGroups ?? []) {
      for (const skill of group.skills) {
        if (out.length >= 6) break;
        out.push(skill.name);
      }
    }
    return out;
  });

  return { yearsExperience, role, location, topSkills };
}

/**
 * First-load entrance for a hero. Reduced-motion → no animation.
 * Transform-only (no opacity:0) so LCP text stays painted on first frame.
 * Markup: blocks with `data-hero-reveal`.
 */
export function useHeroIntro(rootRef: Ref<HTMLElement | undefined>, key: string) {
  const preferredMotion = usePreferredReducedMotion();
  const reduced = computed(() => preferredMotion.value === 'reduce');
  const introPlayed = useState(`hero-intro-${key}`, () => false);

  onMounted(async () => {
    await nextTick();
    if (reduced.value || introPlayed.value) return;

    const root = rootRef.value;
    if (!root) return;

    const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-reveal]'));
    if (blocks.length === 0) return;

    // Lazy-load motion so the hero paint path doesn't pay for the library upfront.
    const { animate, stagger } = await import('motion');

    for (const el of blocks) {
      el.style.willChange = 'transform';
    }

    animate(
      blocks,
      { transform: ['translateY(12px)', 'translateY(0px)'] },
      { duration: 0.5, delay: stagger(0.06, { startDelay: 0.05 }), ease: [0.16, 1, 0.3, 1] },
    ).then(() => {
      for (const el of blocks) el.style.willChange = '';
    });

    introPlayed.value = true;
  });
}

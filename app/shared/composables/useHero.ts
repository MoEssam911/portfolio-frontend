import { usePreferredReducedMotion } from '@vueuse/core';
import { animate, stagger } from 'motion';
import type { Ref } from 'vue';

/**
 * Shared hero copy + derived display values. Keeps the three hero variants
 * consistent (same fallbacks, same word-split) while they're being compared.
 */
export function useHeroContent() {
  const { settings, pending } = useSiteSettings();

  const heroTitle = computed(
    () => settings.value?.heroTitle?.trim() || 'Building thoughtful products for the web.',
  );
  const heroSubtitle = computed(
    () =>
      settings.value?.heroSubtitle?.trim() ||
      'Software engineer crafting fast, accessible, and beautifully animated digital experiences.',
  );
  const availableForWork = computed(() => settings.value?.availableForWork ?? false);

  // Split the headline into words so each can rise in with a stagger.
  const titleWords = computed(() => heroTitle.value.split(/\s+/).filter(Boolean));

  const showSkeleton = computed(() => pending.value && !settings.value);

  return { settings, heroTitle, heroSubtitle, availableForWork, titleWords, showSkeleton };
}

/**
 * Honest, resume-derived hero stats — no invented metrics. Years come from the
 * earliest experience; role/location/skills come straight from the profile.
 */
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
 * First-load entrance for a hero: words rise + stagger, supporting blocks fade up.
 * Each variant passes a unique `key` so they don't share the "already played"
 * flag while stacked for comparison. Reduced-motion → no animation (final state).
 *
 * Markup contract: headline words carry `data-word`, other reveal blocks carry
 * `data-hero-reveal`.
 */
export function useHeroIntro(rootRef: Ref<HTMLElement | undefined>, key: string) {
  // @vueuse: 'no-preference' | 'reduce' (SSR-safe, resolves to the real value on mount).
  const preferredMotion = usePreferredReducedMotion();
  const reduced = computed(() => preferredMotion.value === 'reduce');
  const introPlayed = useState(`hero-intro-${key}`, () => false);

  onMounted(async () => {
    await nextTick();
    if (reduced.value || introPlayed.value) return;

    const root = rootRef.value;
    if (!root) return;

    const words = Array.from(root.querySelectorAll<HTMLElement>('[data-word]'));
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-reveal]'));
    const all = [...words, ...blocks];
    if (all.length === 0) return;

    // Hide synchronously, then reveal — matches useScrollReveal's approach.
    for (const el of all) {
      el.style.opacity = '0';
      el.style.willChange = 'opacity, transform';
    }

    if (words.length > 0) {
      animate(
        words,
        { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] },
        { duration: 0.7, delay: stagger(0.06, { startDelay: 0.05 }), ease: [0.16, 1, 0.3, 1] },
      );
    }

    animate(
      blocks,
      { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
      { duration: 0.6, delay: stagger(0.08, { startDelay: 0.35 }), ease: [0.16, 1, 0.3, 1] },
    ).then(() => {
      for (const el of all) el.style.willChange = '';
    });

    introPlayed.value = true;
  });
}

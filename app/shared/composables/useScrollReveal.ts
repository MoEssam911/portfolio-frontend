import { usePreferredReducedMotion } from '@vueuse/core';
import type { Ref } from 'vue';

export interface ScrollRevealOptions {
  /**
   * CSS selector for child elements to reveal with a stagger. When omitted, the
   * container element itself is the single revealed target.
   */
  selector?: string;
  /** Vertical offset (px) the targets travel up from. Default 24. */
  y?: number;
  /** Animation duration in seconds. Default 0.6. */
  duration?: number;
  /** Delay before the first target animates, in seconds. Default 0. */
  delay?: number;
  /** Per-target stagger in seconds (only when `selector` is set). Default 0.08. */
  stagger?: number;
  /** Reveal only once, then stop observing. Default true. */
  once?: boolean;
  /** IntersectionObserver threshold. Default 0.15. */
  threshold?: number;
  /** IntersectionObserver rootMargin. Default '0px 0px -10% 0px'. */
  rootMargin?: string;
}

type MaybeElementRef = Ref<HTMLElement | null | undefined>;

/**
 * Scroll-triggered entrance animation. Lazy-loads `motion` so home first paint
 * does not pay for the animation library until a section actually reveals.
 */
export function useScrollReveal(target: MaybeElementRef, options: ScrollRevealOptions = {}) {
  const {
    selector,
    y = 24,
    duration = 0.6,
    delay = 0,
    stagger: staggerDelay = 0.08,
    once = true,
    threshold = 0.15,
    rootMargin = '0px 0px -10% 0px',
  } = options;

  const preferredMotion = usePreferredReducedMotion();
  const reduced = computed(() => preferredMotion.value === 'reduce');

  if (import.meta.server) return;

  let observer: IntersectionObserver | null = null;

  const resolveTargets = (root: HTMLElement): HTMLElement[] =>
    selector ? Array.from(root.querySelectorAll<HTMLElement>(selector)) : [root];

  const setHidden = (els: HTMLElement[]) => {
    for (const el of els) {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px)`;
      el.style.willChange = 'opacity, transform';
    }
  };

  const reveal = async (els: HTMLElement[]) => {
    const { animate, stagger } = await import('motion');
    await animate(
      els,
      { opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] },
      {
        duration,
        delay: els.length > 1 ? stagger(staggerDelay, { startDelay: delay }) : delay,
        ease: [0.16, 1, 0.3, 1],
      },
    );
    for (const el of els) el.style.willChange = '';
  };

  onMounted(async () => {
    await nextTick();
    const root = target.value;
    if (!root) return;

    const els = resolveTargets(root);
    if (els.length === 0) return;
    if (reduced.value) return;

    setHidden(els);

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          void reveal(els);
          if (once) observer?.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(root);
  });

  onScopeDispose(() => {
    observer?.disconnect();
    observer = null;
  });
}

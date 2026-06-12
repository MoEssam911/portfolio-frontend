import { animate, stagger } from 'motion';
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
 * Scroll-triggered entrance animation — the workhorse for section reveals.
 *
 * Pass a template ref to the container. On enter (via IntersectionObserver) the
 * container — or its matching children, staggered — fade and rise into place
 * using `motion`'s `animate`/`stagger`.
 *
 * Honours reduced motion: when the user prefers reduced motion, no observer is
 * created and elements render in their final state immediately. Always awaits
 * `nextTick()` so the DOM is ready before it is queried.
 *
 * @example
 * const section = ref<HTMLElement>()
 * useScrollReveal(section, { selector: '[data-reveal]', stagger: 0.06 })
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

  // `useReducedMotion` is provided by motion-v (auto-imported) and returns a ref
  // that is `null` on the server and a boolean once mounted on the client.
  const reduced = useReducedMotion();

  // Server render never animates — final state only.
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

  const reveal = (els: HTMLElement[]) => {
    animate(
      els,
      { opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] },
      {
        duration,
        delay: els.length > 1 ? stagger(staggerDelay, { startDelay: delay }) : delay,
        ease: [0.16, 1, 0.3, 1],
      },
    ).then(() => {
      for (const el of els) el.style.willChange = '';
    });
  };

  onMounted(async () => {
    await nextTick();
    const root = target.value;
    if (!root) return;

    const els = resolveTargets(root);
    if (els.length === 0) return;

    // Reduced motion: leave everything in its natural, fully-visible state.
    if (reduced.value) return;

    setHidden(els);

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(els);
          if (once) {
            observer?.unobserve(entry.target);
          }
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

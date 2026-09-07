import Lenis from 'lenis';

/**
 * Smooth-scroll engine (client only).
 *
 * Lenis drives the cinematic feel of the site, but it is gated on the user's
 * motion preference: when `prefers-reduced-motion: reduce` is set we never start
 * it and the browser's native scrolling is used instead. The preference is also
 * watched live, so toggling it at the OS level starts/stops Lenis without a reload.
 *
 * The instance is provided as `$lenis` for components that need to drive
 * programmatic scrolling (e.g. anchor navigation, scroll-to-top).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');

  let lenis: Lenis | null = null;
  let rafId = 0;

  const start = () => {
    if (lenis) return;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time: number) => {
      lenis?.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
  };

  const stop = () => {
    if (!lenis) return;
    cancelAnimationFrame(rafId);
    lenis.destroy();
    lenis = null;
  };

  const sync = () => {
    if (media.matches) stop();
    else start();
  };

  sync();
  media.addEventListener('change', sync);

  // Reset scroll position on each navigation so Lenis and the router agree.
  nuxtApp.hook('page:finish', () => {
    lenis?.scrollTo(0, { immediate: true });
  });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      media.removeEventListener('change', sync);
      stop();
    });
  }

  return {
    provide: {
      lenis: {
        scrollTo: (
          target: string | number | HTMLElement,
          opts?: { offset?: number; immediate?: boolean },
        ) => lenis?.scrollTo(target, opts),
        get instance() {
          return lenis;
        },
      },
    },
  };
});

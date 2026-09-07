import { usePreferredReducedMotion } from '@vueuse/core';
import type { Ref } from 'vue';

export interface ParallaxOptions {
  /** Max px the layer drifts from rest. */
  strength?: number;
  /** Base scale of the layer so its edges never reveal while it drifts. */
  scale?: number;
}

/**
 * Gentle pointer parallax — an inner layer (e.g. a card's cover image) drifts a
 * few px opposite the cursor while it hovers the host, then eases back on leave.
 * Transform-only (compositor-friendly) and translate-only — no rotation/tilt.
 * Fully disabled under reduced motion and on coarse/touch pointers; client-only.
 *
 * Markup contract: the layer should carry a CSS transition on `transform` so the
 * spring-back reads smoothly; this sets/clears `will-change` on enter/leave.
 */
export function useParallax(
  host: Ref<HTMLElement | null | undefined>,
  layer: Ref<HTMLElement | null | undefined>,
  options: ParallaxOptions = {},
) {
  const { strength = 12, scale = 1.08 } = options;

  if (import.meta.server) return;

  const preferredMotion = usePreferredReducedMotion();

  let hostEl: HTMLElement | null = null;
  let layerEl: HTMLElement | null = null;
  let frame = 0;

  const reset = () => {
    if (!layerEl) return;
    layerEl.style.transform = '';
    layerEl.style.willChange = '';
  };

  const onMove = (e: PointerEvent) => {
    if (!hostEl || !layerEl) return;
    const rect = hostEl.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!layerEl) return;
      layerEl.style.willChange = 'transform';
      layerEl.style.transform = `scale(${scale}) translate3d(${-px * strength}px, ${-py * strength}px, 0)`;
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame);
    reset();
  };

  onMounted(() => {
    hostEl = host.value ?? null;
    layerEl = layer.value ?? null;
    if (!hostEl || !layerEl) return;
    // Skip on reduced-motion or non-fine pointers (touch) — parallax needs a cursor.
    if (preferredMotion.value === 'reduce') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    hostEl.addEventListener('pointermove', onMove);
    hostEl.addEventListener('pointerleave', onLeave);
  });

  onScopeDispose(() => {
    cancelAnimationFrame(frame);
    hostEl?.removeEventListener('pointermove', onMove);
    hostEl?.removeEventListener('pointerleave', onLeave);
    hostEl = null;
    layerEl = null;
  });
}

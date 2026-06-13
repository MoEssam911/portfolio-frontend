import type { ComputedRef, InjectionKey, Ref } from 'vue';

import type { SiteSettings } from '~/modules/settings/types';

/**
 * Shared site-settings context. `useSettings()` is a layout concern — the default
 * layout fetches it once and provides it here so the header, footer, and any page
 * can read it without re-fetching.
 */
export interface SiteSettingsContext {
  settings: Ref<SiteSettings | null> | ComputedRef<SiteSettings | null>;
  pending: Ref<boolean>;
}

export const SITE_SETTINGS_KEY = Symbol('site-settings') as InjectionKey<SiteSettingsContext>;

/** Call once, in the default layout, after `useSettings()`. */
export function provideSiteSettings(ctx: SiteSettingsContext) {
  provide(SITE_SETTINGS_KEY, ctx);
}

/** Read the provided settings anywhere below the layout. Falls back to empty. */
export function useSiteSettings(): SiteSettingsContext {
  return inject(SITE_SETTINGS_KEY, {
    settings: ref<SiteSettings | null>(null),
    pending: ref(false),
  });
}

/** Primary navigation — shared by the desktop header and the mobile sheet. */
export interface NavLink {
  label: string;
  to: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Work', to: '/projects' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Resume', to: '/resume' },
];

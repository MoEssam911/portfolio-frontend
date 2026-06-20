import type { NavItem } from '~/modules/dashboard/types';

/**
 * The dashboard sidebar sections — the single source of truth for both the
 * sidebar and the Topbar's current-page title. Routes for not-yet-built phases
 * are wired now so the frame is complete; those pages land in later phases.
 */
export const DASHBOARD_NAV: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: 'lucide:layout-dashboard' },
  { label: 'Projects', to: '/dashboard/projects', icon: 'lucide:folder-git-2' },
  { label: 'Blog', to: '/dashboard/blog', icon: 'lucide:newspaper' },
  { label: 'Services', to: '/dashboard/services', icon: 'lucide:wrench' },
  { label: 'Testimonials', to: '/dashboard/testimonials', icon: 'lucide:quote' },
  { label: 'Resume', to: '/dashboard/resume', icon: 'lucide:file-text' },
  { label: 'Media', to: '/dashboard/media', icon: 'lucide:image' },
  { label: 'Settings', to: '/dashboard/settings', icon: 'lucide:settings' },
  { label: 'Messages', to: '/dashboard/messages', icon: 'lucide:mail' },
];

/**
 * Dashboard chrome state: the persistent sidebar's collapsed flag (desktop,
 * persisted in a cookie so it survives reloads) and the mobile sheet's open
 * flag (ephemeral). Shared via `useState`/`useCookie` so the layout, sidebar,
 * and topbar all read one source.
 */
export function useDashboardNav() {
  const route = useRoute();

  // Desktop rail collapse — persisted across reloads.
  const collapsed = useCookie<boolean>('dash-sidebar-collapsed', {
    default: () => false,
    sameSite: 'lax',
  });

  // Mobile sheet open/closed — never persisted.
  const mobileOpen = useState<boolean>('dash-sidebar-mobile', () => false);

  /** The nav entry matching the current route (longest matching `to` wins). */
  const current = computed(() =>
    [...DASHBOARD_NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) =>
        item.to === '/dashboard' ? route.path === '/dashboard' : route.path.startsWith(item.to),
      ),
  );

  /** Topbar page title — the active section label, falling back to "Dashboard". */
  const title = computed(() => current.value?.label ?? 'Dashboard');

  function isActive(item: NavItem): boolean {
    return item.to === '/dashboard' ? route.path === '/dashboard' : route.path.startsWith(item.to);
  }

  return {
    nav: DASHBOARD_NAV,
    collapsed,
    mobileOpen,
    current,
    title,
    isActive,
    toggleCollapsed: () => (collapsed.value = !collapsed.value),
  };
}

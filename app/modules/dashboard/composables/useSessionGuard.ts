import { useAuthStore } from '~/modules/dashboard/stores/auth';

/**
 * Module-level latch so a burst of failing reads/writes (a dashboard page fires
 * several admin requests at once) triggers exactly ONE redirect to login.
 */
let redirecting = false;

/**
 * useSessionGuard — the single place the client reacts to a dead session.
 *
 * The BFF proxy only ever returns 401 AFTER it has already tried to refresh once
 * with the `rt` cookie. So a 401 reaching the browser means the session is
 * genuinely gone (refresh token expired/revoked/reused). When that happens we:
 *   1. clear the mirrored Pinia user (so guards/UI immediately read "logged out"),
 *   2. warn the user with a toast,
 *   3. bounce to /dashboard/login, preserving where they were as `?redirect=` so
 *      they land back there after signing in.
 *
 * Wired into both read (`useAdminApiFetch` → `onResponseError`) and write
 * (`useAdminMutation` catch) paths, so every dashboard request is covered.
 */
export function useSessionGuard() {
  const store = useAuthStore();
  const route = useRoute();
  const toast = useToast();

  async function handleUnauthorized(): Promise<void> {
    if (import.meta.server || redirecting) return;
    // Already on the login screen (or never authenticated) — nothing to do.
    if (route.path === '/dashboard/login') return;

    redirecting = true;
    store.clear();

    const current = route.fullPath;
    const redirect =
      current.startsWith('/dashboard') && !current.startsWith('/dashboard/login')
        ? current
        : undefined;

    toast.warning('Session expired', 'Please sign in again.');

    try {
      await navigateTo({
        path: '/dashboard/login',
        query: redirect ? { redirect } : undefined,
      });
    } finally {
      redirecting = false;
    }
  }

  return { handleUnauthorized };
}

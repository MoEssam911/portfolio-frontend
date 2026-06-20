/**
 * Named route middleware — protects dashboard pages. Apply via
 * `definePageMeta({ middleware: 'auth' })` (or a dashboard layout's pages).
 *
 * Hydrates the session from /api/auth/me when the store is empty (first load /
 * reload), then redirects unauthenticated visitors to the login screen.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchMe } = useAuth();

  if (!isAuthenticated.value) {
    await fetchMe();
  }

  if (!isAuthenticated.value) {
    // Preserve where the user was headed so login can return them after sign-in.
    const redirect = to.fullPath !== '/dashboard/login' ? { redirect: to.fullPath } : undefined;
    return navigateTo({ path: '/dashboard/login', query: redirect });
  }
});

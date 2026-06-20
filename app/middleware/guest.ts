/**
 * Named route middleware — guest guard for the login page. Apply via
 * `definePageMeta({ middleware: 'guest' })`.
 *
 * Already-authenticated users skip login and land on the dashboard home.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchMe } = useAuth();

  if (!isAuthenticated.value) {
    await fetchMe();
  }

  if (isAuthenticated.value) {
    // Honor a same-origin `?redirect=` so an already-signed-in user who hit a
    // guarded link lands there, not always on the overview. Guard open redirects.
    const target = Array.isArray(to.query.redirect) ? to.query.redirect[0] : to.query.redirect;
    const dest =
      typeof target === 'string' &&
      target.startsWith('/dashboard') &&
      !target.startsWith('/dashboard/login')
        ? target
        : '/dashboard';
    return navigateTo(dest);
  }
});

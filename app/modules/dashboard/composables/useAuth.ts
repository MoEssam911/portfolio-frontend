import { storeToRefs } from 'pinia';

import { useAuthStore } from '~/modules/dashboard/stores/auth';
import type { DashboardUser, LoginCredentials } from '~/modules/dashboard/types';

interface UserEnvelope {
  success: true;
  data: { user: DashboardUser };
}

/**
 * useAuth — the dashboard session API.
 *
 * Talks only to the same-origin BFF routes (/api/auth/**); it never sees a token.
 * `user`/`isAuthenticated` are backed by the Pinia store so every caller shares one
 * reactive session.
 */
export function useAuth() {
  const store = useAuthStore();
  const { user, isAuthenticated } = storeToRefs(store);

  /** Authenticate. Throws (FetchError) on failure so callers can show the error. */
  async function login(credentials: LoginCredentials): Promise<DashboardUser> {
    const res = await $fetch<UserEnvelope>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
    store.setUser(res.data.user);
    return res.data.user;
  }

  /** Revoke the session and return to the login screen. Always clears local state. */
  async function logout(): Promise<void> {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      store.clear();
      await navigateTo('/dashboard/login');
    }
  }

  /**
   * Resolve the current user from the session cookies. Uses `useRequestFetch` so
   * the `at`/`rt` cookies are forwarded when this runs during SSR. Returns `null`
   * (and clears the store) when there is no valid session.
   */
  async function fetchMe(): Promise<DashboardUser | null> {
    try {
      const res = await useRequestFetch()<UserEnvelope>('/api/auth/me');
      store.setUser(res.data.user);
      return res.data.user;
    } catch {
      store.clear();
      return null;
    }
  }

  return { user, isAuthenticated, login, logout, fetchMe };
}

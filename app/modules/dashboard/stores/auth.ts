import { defineStore } from 'pinia';

import type { DashboardUser } from '~/modules/dashboard/types';

/**
 * Dashboard auth state. The httpOnly cookies on the server are the source of
 * truth for the *session*; this store only mirrors the resolved user for the UI.
 * It is intentionally NOT persisted — `user` is re-hydrated from /api/auth/me on
 * load, so it can never drift out of sync with the (server-held) cookies.
 */
export const useAuthStore = defineStore('dashboard-auth', () => {
  const user = ref<DashboardUser | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  function setUser(value: DashboardUser | null) {
    user.value = value;
  }

  function clear() {
    user.value = null;
  }

  return { user, isAuthenticated, setUser, clear };
});

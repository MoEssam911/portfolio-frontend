import { createPersistedState } from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin((nuxtApp) => {
  (nuxtApp.$pinia as any).use(
    createPersistedState({
      storage: {
        getItem: (key: string) =>
          typeof window !== 'undefined' ? localStorage.getItem(key) : null,
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined') localStorage.setItem(key, value);
        },
      },
    }),
  );
});

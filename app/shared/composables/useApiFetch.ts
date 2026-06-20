import type { FetchError } from 'ofetch';

import type { AsyncData, NuxtApp, UseFetchOptions } from '#app';
import type { ApiPaginated, ApiSuccess } from '~/shared/types/api';

/**
 * useApiFetch — the ONE read primitive for the whole app.
 *
 * A thin wrapper over Nuxt's `useFetch` that standardizes how we talk to the
 * backend for reads. It:
 *   1. injects `baseURL` from `runtimeConfig.public.apiBase` (no per-composable
 *      `config.public.apiBase` boilerplate);
 *   2. auto-unwraps the `{ success, data }` envelope via a default `transform`
 *      (so callers get the inner payload directly — no manual `_raw.value?.data`);
 *   3. wires `getCachedData` for SWR hydration (serve the SSR payload / prerendered
 *      static data on client navigation before re-validating).
 *
 * Writes (POST/PATCH/DELETE) do NOT belong here — they will go through the
 * authenticated `$admin` client added in a later phase. This primitive is reads only.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 * Standard envelope (`ApiSuccess<T>`) — data is unwrapped to `T`:
 *
 *   const { data, pending, error } = useApiFetch<ApiSuccess<Service[]>>('/services', {
 *     key: 'services-list',
 *     default: () => [],
 *   })
 *   // data: Ref<Service[]>
 *
 * Pass-through for paginated `meta` — keep the full `ApiPaginated<T>` envelope by
 * overriding the transform with identity, and widen the data generic to include null:
 *
 *   const { data } = useApiFetch<ApiPaginated<Project>, ApiPaginated<Project> | null>(
 *     '/projects',
 *     { key: 'projects-page', query: { page, limit }, transform: (res) => res,
 *       getCachedData: undefined, default: () => null },
 *   )
 *   // data: Ref<ApiPaginated<Project> | null> — read data.value.data and data.value.meta
 *
 * Notes:
 * - Always provide a `default` so the data ref is never `undefined`. Nullability is
 *   carried by the `DataT` generic (e.g. `Project | null`), matching the default.
 * - For reactive paginated lists, pass `getCachedData: undefined` to opt out of SWR
 *   caching (a constant key + reactive `query` must always re-fetch on page change).
 */

export type ApiEnvelope = ApiSuccess<unknown> | ApiPaginated<unknown>;

/** Default unwrap: `ApiSuccess<T>` → `T`, `ApiPaginated<T>` → `T[]`. */
export type UnwrapEnvelope<ResT> = ResT extends { data: infer D } ? D : ResT;

/**
 * Options accepted by {@link useApiFetch}. Mirrors `UseFetchOptions` but re-types
 * `transform`/`default`/`getCachedData` against our resolved `DataT` (Nuxt's own
 * `DefaultT` generic would otherwise pin `default` to `undefined`).
 *
 * `baseURL` is opt-in: omit it for public reads (defaults to the backend
 * `apiBase`); the dashboard reads pass `/api/admin` to route through the BFF.
 */
export interface UseApiFetchOptions<ResT extends ApiEnvelope, DataT> extends Omit<
  UseFetchOptions<ResT, DataT>,
  'transform' | 'default' | 'getCachedData'
> {
  transform?: (input: ResT) => DataT;
  default?: () => DataT;
  getCachedData?: (key: string, nuxtApp: NuxtApp) => DataT | undefined;
}

export function useApiFetch<ResT extends ApiEnvelope, DataT = UnwrapEnvelope<ResT>>(
  path: string | (() => string),
  options: UseApiFetchOptions<ResT, DataT> = {},
): AsyncData<DataT, FetchError | null> {
  const config = useRuntimeConfig();

  const merged = {
    baseURL: config.public.apiBase as string,
    // Default: unwrap the { success, data } envelope. Overridden when a caller
    // passes its own `transform` (e.g. identity, to keep paginated `meta`).
    transform: (res: ResT) => (res as unknown as { data: DataT }).data,
    // SWR hydration: reuse the SSR payload / prerendered static data on the client.
    getCachedData: (key: string, nuxtApp: NuxtApp) =>
      (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as DataT | undefined,
    ...options,
  };

  // useFetch's overloads can't see through our generic indirection, so we assert
  // the well-defined external return type. Internally data is always defaulted.
  return useFetch(path, merged as unknown as UseFetchOptions<ResT, DataT>) as unknown as AsyncData<
    DataT,
    FetchError | null
  >;
}

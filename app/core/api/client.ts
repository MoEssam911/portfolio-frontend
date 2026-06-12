import { logError } from '~/core/utils/error-logger';
import { generateRequestId } from '~/core/utils/request-id';

import type { ApiError } from './types';

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
};

/**
 * Configured $fetch client with baseURL, Bearer token injection, request ID tracing,
 * and global 401/403 handling with silent token refresh.
 *
 * This is the raw transport layer — use `useApi()` in pages/services, not this directly.
 */
export const useApiClient = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase || undefined;

  const api = $fetch.create({
    baseURL,

    onRequest({ options }) {
      const token = useCookie<string | null>('auth_at');
      const rid = generateRequestId();

      options.headers = new Headers((options.headers as HeadersInit) || {});
      options.headers.set('X-Request-ID', rid);

      if (token.value) {
        options.headers.set('Authorization', `Bearer ${token.value}`);
      }
    },

    async onResponseError({ response, request, options }) {
      const nuxtApp = useNuxtApp();

      if (response.status === 401) {
        // Attempt silent token refresh once
        const refreshCookie = useCookie<string | null>('auth_rt');
        const refreshToken = refreshCookie.value;

        if (refreshToken) {
          try {
            const refreshed = await $fetch<{ accessToken: string; refreshToken: string }>(
              `${config.public.apiBase}/auth/refresh`,
              { method: 'POST', body: { refreshToken } },
            );

            const atCookie = useCookie('auth_at', {
              maxAge: 900,
              sameSite: 'strict',
              secure: import.meta.env.PROD,
            });
            const rtCookie = useCookie('auth_rt', {
              maxAge: 604800,
              sameSite: 'strict',
              secure: import.meta.env.PROD,
            });
            atCookie.value = refreshed.accessToken;
            rtCookie.value = refreshed.refreshToken;

            // Retry original request with new token
            const retryHeaders = new Headers((options.headers as HeadersInit) || {});
            retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);

            await $fetch(request as string, {
              ...options,
              method: options.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
              headers: retryHeaders,
            });
            return;
          } catch {
            // Refresh failed — clear everything and redirect
          }
        }

        // No refresh token or refresh failed
        const atCookie = useCookie<string | null>('auth_at');
        const rtCookie = useCookie<string | null>('auth_rt');
        atCookie.value = null;
        rtCookie.value = null;

        nuxtApp.runWithContext(() => navigateTo('/'));
        return;
      }

      const apiErr: ApiError = {
        status: response.status ?? 500,
        message: response.statusText ?? 'Request failed',
      };
      logError(apiErr, { url: response?.url });
    },
  });

  // Once server routes exist, Nitro augments ofetch's overloads to match request
  // URLs against the local route table — which makes `api<T>(url)` either infer a
  // TypedInternalResponse or blow the type-instantiation depth for arbitrary
  // strings. This client only ever calls the external API, so we talk to it
  // through a plain string→Promise signature and assert the caller's generic.
  const call = api as unknown as (
    url: string,
    opts: Record<string, unknown>,
  ) => Promise<unknown>;

  const request = async <T>(url: string, options?: FetchOptions): Promise<T> => {
    try {
      return (await call(url, {
        method: options?.method || 'GET',
        body: options?.body as Record<string, unknown> | undefined,
        headers: options?.headers,
        query: options?.query,
      })) as T;
    } catch (error) {
      throw normalizeError(error);
    }
  };

  return {
    raw: api,
    request,
  };
};

/**
 * Extract a human-readable message from any error shape.
 * Handles: FetchError, Nuxt errors, standard Error, strings.
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if (err['data'] && typeof err['data'] === 'object') {
      const data = err['data'] as Record<string, unknown>;
      if (typeof data['message'] === 'string') return data['message'];
      if (typeof data['error'] === 'string') return data['error'];
    }

    if (typeof err['message'] === 'string') return err['message'];
    if (typeof err['statusMessage'] === 'string') return err['statusMessage'];
  }

  if (typeof error === 'string') return error;

  return 'An unknown error occurred';
}

/**
 * Normalize any error into standardized ApiError shape.
 * Extracts status code, message, and validation errors.
 */
export function normalizeError(error: unknown): ApiError {
  const message = extractErrorMessage(error);
  let status = 500;
  let errors: Record<string, string[]> | undefined;

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    const maybeStatus =
      err['status'] ??
      err['statusCode'] ??
      (err['response'] as Record<string, unknown> | undefined)?.['status'];
    if (typeof maybeStatus === 'number') {
      status = maybeStatus;
    }
    const maybeErrors =
      (err['data'] as Record<string, unknown> | undefined)?.['errors'] ?? err['errors'];
    if (maybeErrors && typeof maybeErrors === 'object') {
      errors = maybeErrors as Record<string, string[]>;
    }
  }

  return { status, message, errors };
}

/**
 * Type guard: Check if value is ApiError
 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value &&
    typeof (value as ApiError).status === 'number' &&
    typeof (value as ApiError).message === 'string'
  );
}

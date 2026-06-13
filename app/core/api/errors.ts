/**
 * Client-side error normalization — the single source of truth for turning any
 * thrown value (FetchError, Nuxt error, Error, string) into a predictable shape.
 *
 * This is transport-agnostic: it does not know about cookies, auth, or baseURL.
 * Reads go through `useApiFetch` (see app/shared/composables/useApiFetch.ts);
 * writes will go through the authenticated `$admin` client built in a later phase.
 * Both can funnel caught errors through `normalizeError` for consistent UI handling.
 */

/**
 * Standardized client-side error shape with optional field-level validation errors.
 * Note: this is the *normalized* error the UI consumes — distinct from the raw
 * `ApiError` wire shape in `~/shared/types/api` that the backend sends on the body.
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

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
 * Normalize any error into the standardized {@link ApiError} shape.
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
 * Type guard: check whether a value is a normalized {@link ApiError}.
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

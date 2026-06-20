import type { ApiError } from '~/core/api/errors';
import { isApiError, normalizeError } from '~/core/api/errors';

export interface AdminMutationOptions<TData, TVars> {
  /** Runs after a successful mutation (e.g. refresh a list, navigate). */
  onSuccess?: (data: TData, vars: TVars) => void | Promise<void>;
  /** Runs after a failed mutation, with the normalized error. */
  onError?: (error: ApiError, vars: TVars) => void;
  /** Success toast — a string, or a builder from the returned data. Omit for none. */
  successMessage?: string | ((data: TData) => string);
  /** Error toast title. Defaults to a generic message; the error detail is the body. */
  errorMessage?: string;
}

/**
 * useAdminMutation — the imperative create/update/delete pattern for the dashboard.
 *
 * Wraps a `$admin` call (or any promise) with reactive `pending`/`error`, a
 * normalized error shape, and success/error toasts. The mutator throws on failure
 * (as `$admin` does); `mutate` resolves to the data on success or `null` on error,
 * so callers never have to try/catch.
 *
 *   const { mutate, pending } = useAdminMutation(
 *     (input: ProjectInput) => $admin<Project>('/projects', { method: 'POST', body: input }),
 *     { successMessage: 'Project created', onSuccess: () => refresh() },
 *   )
 */
export function useAdminMutation<TData, TVars = void>(
  mutator: (vars: TVars) => Promise<TData>,
  options: AdminMutationOptions<TData, TVars> = {},
) {
  const toast = useToast();
  const { handleUnauthorized } = useSessionGuard();
  const pending = ref(false);
  const error = ref<ApiError | null>(null);

  async function mutate(vars: TVars): Promise<TData | null> {
    pending.value = true;
    error.value = null;

    try {
      const data = await mutator(vars);

      if (options.successMessage) {
        const message =
          typeof options.successMessage === 'function'
            ? options.successMessage(data)
            : options.successMessage;
        toast.success(message);
      }

      await options.onSuccess?.(data, vars);
      return data;
    } catch (caught) {
      const apiError = isApiError(caught) ? caught : normalizeError(caught);
      error.value = apiError;
      // Dead session — redirect to login (once) instead of a generic error toast.
      if (apiError.status === 401) {
        void handleUnauthorized();
        return null;
      }
      toast.error(options.errorMessage ?? 'Something went wrong', apiError.message);
      options.onError?.(apiError, vars);
      return null;
    } finally {
      pending.value = false;
    }
  }

  return { mutate, pending, error };
}

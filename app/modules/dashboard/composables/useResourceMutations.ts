import { $admin } from '~/modules/dashboard/composables/useAdminApi';
import { useAdminMutation } from '~/modules/dashboard/composables/useAdminMutation';

export interface UseResourceMutationsOptions {
  /**
   * Human-readable singular noun for toasts + confirm copy, e.g. `'Project'`.
   * Defaults to a Title-cased, de-pluralized form of the resource path.
   */
  label?: string;
  /**
   * Called after any successful create/update/delete — wire your list `refresh`
   * here for optimistic-feeling lists (re-reads with the SWR cache bypassed).
   */
  onChange?: () => void | Promise<void>;
}

interface UpdateVars<TInput> {
  id: string;
  input: TInput;
}

/** `'projects'` → `'Project'`, `'skill-groups'` → `'Skill group'`. */
function defaultLabel(resource: string): string {
  const singular = resource.replace(/-/g, ' ').replace(/s$/, '');
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

/**
 * useResourceMutations — create / update / delete for a dashboard resource.
 *
 * Built ON TOP of the Phase-2 write primitives (`$admin` + `useAdminMutation`):
 * each mutation gets reactive `pending`/`error`, a success/error toast, and the
 * shared `onChange` refresh. `removeWithConfirm` additionally routes through the
 * shared headless `useConfirm()` dialog so destructive actions always confirm.
 *
 *   const { create, update, removeWithConfirm } = useResourceMutations<Project, ProjectInput>(
 *     'projects', { onChange: refresh },
 *   )
 *   await create.mutate(input)
 *   await removeWithConfirm(row.id, row.title)
 */
export function useResourceMutations<TData, TCreate = Partial<TData>, TUpdate = TCreate>(
  resource: string,
  options: UseResourceMutationsOptions = {},
) {
  const confirm = useConfirm();
  const label = options.label ?? defaultLabel(resource);

  const create = useAdminMutation<TData, TCreate>(
    (input) =>
      $admin<TData>(`/${resource}`, { method: 'POST', body: input as Record<string, unknown> }),
    { successMessage: `${label} created`, onSuccess: options.onChange },
  );

  const update = useAdminMutation<TData, UpdateVars<TUpdate>>(
    ({ id, input }) =>
      $admin<TData>(`/${resource}/${id}`, {
        method: 'PATCH',
        body: input as Record<string, unknown>,
      }),
    { successMessage: `${label} updated`, onSuccess: options.onChange },
  );

  const remove = useAdminMutation<{ id: string }, string>(
    (id) => $admin<{ id: string }>(`/${resource}/${id}`, { method: 'DELETE' }),
    { successMessage: `${label} deleted`, onSuccess: options.onChange },
  );

  /**
   * Confirm, then delete. Resolves to the deleted id on success, or `null` if the
   * user cancelled or the request failed (the toast/error are handled already).
   */
  async function removeWithConfirm(id: string, name?: string): Promise<{ id: string } | null> {
    try {
      await confirm.ask({
        title: `Delete ${label.toLowerCase()}?`,
        message: name
          ? `"${name}" will be permanently removed. This cannot be undone.`
          : `This ${label.toLowerCase()} will be permanently removed. This cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'danger',
      });
    } catch {
      return null; // cancelled
    }
    return remove.mutate(id);
  }

  return { create, update, remove, removeWithConfirm };
}

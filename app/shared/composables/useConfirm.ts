interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/** Only serializable fields live in `useState` (goes into the SSR payload). */
interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

const CONFIRM_KEY = 'app-confirm';

/**
 * Promise resolvers are kept OUTSIDE the Nuxt payload-serialized state —
 * functions cannot be stringified into the SSR payload (devalue throws).
 * They are only ever assigned/invoked on the client during interaction.
 */
let resolveFn: (() => void) | null = null;
let rejectFn: ((reason?: unknown) => void) | null = null;

/**
 * Headless confirmation dialog composable.
 * Pair with a `<BaseConfirmHost>` component that reads this state.
 *
 * Uses `useState()` for SSR-safe shared state — no module-level singleton leaks.
 *
 * @example
 * const confirm = useConfirm()
 * try {
 *   await confirm.ask({ title: 'Delete item', message: 'This cannot be undone.', variant: 'danger' })
 *   await deleteItem(id) // only runs if user confirms
 * } catch {
 *   // user cancelled — do nothing
 * }
 */
export const useConfirm = () => {
  const state = useState<ConfirmState>(CONFIRM_KEY, () => ({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  }));

  const ask = (options: ConfirmOptions): Promise<void> =>
    new Promise((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
      state.value = {
        ...options,
        variant: options.variant ?? 'info',
        isOpen: true,
      };
    });

  const confirm = () => {
    state.value = { ...state.value, isOpen: false };
    resolveFn?.();
    resolveFn = null;
    rejectFn = null;
  };

  const cancel = () => {
    state.value = { ...state.value, isOpen: false };
    rejectFn?.(new Error('User cancelled'));
    resolveFn = null;
    rejectFn = null;
  };

  return { state: readonly(state), ask, confirm, cancel };
};

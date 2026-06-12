/**
 * Global open-state for the ⌘K command palette. The palette lives once in app.vue
 * (`<CommandMenu />`); any component (e.g. the header search button) can open it
 * through this shared state. `useState` keeps it SSR-safe and singleton.
 */
export function useCommandMenu() {
  const open = useState<boolean>('command-menu-open', () => false);

  return {
    open,
    show: () => (open.value = true),
    hide: () => (open.value = false),
    toggle: () => (open.value = !open.value),
  };
}

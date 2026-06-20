import type { Ref } from 'vue';

import { normalizeError } from '~/core/api/errors';
import { $admin } from '~/modules/dashboard/composables/useAdminApi';

/** Any entity that can be ordered — the only field reorder needs is the id. */
export interface ReorderableItem {
  id: string;
}

export interface UseReorderableListOptions {
  /** Human-readable plural for the failure toast, e.g. `'services'`. */
  label?: string;
}

/**
 * useReorderableList — shared drag-to-reorder UX + persistence for any ordered
 * dashboard resource whose backend exposes `PATCH /<resource>/reorder` with the
 * `{ items: { id, order }[] }` shape (services, testimonials, and later resume
 * sections all share this contract).
 *
 * It owns a LOCAL working copy (`ordered`) seeded from the read `source`. A drop
 * (or an arrow-key move) reorders that copy IMMEDIATELY (optimistic) and then
 * fires the `/reorder` PATCH; on failure the copy reverts to its pre-move
 * snapshot and an error toast is shown. The working copy is the UI's source of
 * truth, so a successful reorder needs no refetch; when a fresh `source` arrives
 * (after a create/delete refresh) the copy re-seeds from it.
 *
 *   const list = useReorderableList<Service>('services', items, { label: 'services' })
 *   // render `list.ordered`, wire the drag handlers + `list.moveBy`
 */
export function useReorderableList<T extends ReorderableItem>(
  resource: string,
  source: Ref<T[]>,
  options: UseReorderableListOptions = {},
) {
  const toast = useToast();
  const label = options.label ?? 'items';

  const ordered = ref<T[]>([...source.value]) as Ref<T[]>;
  const dragIndex = ref<number | null>(null);
  const overIndex = ref<number | null>(null);
  const persisting = ref(false);

  // Re-seed from the read whenever it changes — but never clobber the optimistic
  // copy while a reorder PATCH is still in flight.
  watch(
    source,
    (next) => {
      if (!persisting.value) ordered.value = [...next];
    },
    { immediate: false },
  );

  function move(from: number, to: number) {
    if (to < 0 || to >= ordered.value.length || from === to) return;
    const next = [...ordered.value];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    ordered.value = next;
  }

  async function persist(snapshot: T[]) {
    persisting.value = true;
    try {
      await $admin(`/${resource}/reorder`, {
        method: 'PATCH',
        body: {
          items: ordered.value.map((item, index) => ({ id: item.id, order: index })),
        },
      });
    } catch (caught) {
      ordered.value = snapshot; // revert the optimistic move
      toast.error(`Couldn't save the new ${label} order`, normalizeError(caught).message);
    } finally {
      persisting.value = false;
    }
  }

  /** Reorder optimistically, then persist (reverting on failure). */
  function reorder(from: number, to: number) {
    if (from === to || to < 0 || to >= ordered.value.length) return;
    const snapshot = [...ordered.value];
    move(from, to);
    void persist(snapshot);
  }

  /** Move the item at `index` by `delta` slots (keyboard / button a11y path). */
  function moveBy(index: number, delta: number) {
    reorder(index, index + delta);
  }

  // ── Native HTML drag-and-drop handlers ──────────────────────────────────────
  function onDragStart(index: number, event: DragEvent) {
    dragIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // Firefox requires data to be set for a drag to start.
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  function onDragOver(index: number) {
    overIndex.value = index;
  }

  function onDrop(index: number) {
    if (dragIndex.value !== null) reorder(dragIndex.value, index);
    dragIndex.value = null;
    overIndex.value = null;
  }

  function onDragEnd() {
    dragIndex.value = null;
    overIndex.value = null;
  }

  return {
    ordered,
    dragIndex,
    overIndex,
    persisting,
    reorder,
    moveBy,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  };
}

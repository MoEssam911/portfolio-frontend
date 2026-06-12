interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true);
  const notifications = ref<Notification[]>([]);

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function addNotification(notification: Omit<Notification, 'id'>) {
    notifications.value.push({
      ...notification,
      id: crypto.randomUUID(),
    });
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  return {
    sidebarOpen,
    notifications,
    toggleSidebar,
    addNotification,
    removeNotification,
  };
});

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Global host for the headless `useConfirm()` composable. Mounted once in app.vue.
const confirm = useConfirm();

const open = computed({
  get: () => confirm.state.value.isOpen,
  set: (value: boolean) => {
    // Closing via overlay click / Escape counts as a cancel.
    if (!value) confirm.cancel();
  },
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ confirm.state.value.title }}</DialogTitle>
        <DialogDescription>{{ confirm.state.value.message }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="confirm.cancel()">
          {{ confirm.state.value.cancelLabel || 'Cancel' }}
        </Button>
        <Button
          :variant="confirm.state.value.variant === 'danger' ? 'destructive' : 'default'"
          @click="confirm.confirm()"
        >
          {{ confirm.state.value.confirmLabel || 'Confirm' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

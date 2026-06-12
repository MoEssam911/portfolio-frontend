<script setup lang="ts">
interface Props {
  modelValue: string;
}

defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="relative w-full sm:max-w-xs">
    <Icon
      name="lucide:search"
      class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
    />
    <input
      :value="modelValue"
      type="search"
      placeholder="Search posts…"
      aria-label="Search posts"
      class="h-10 w-full rounded-full border border-border bg-card pl-9 pr-9 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-primary-border focus:border-primary-border focus:outline-none focus:ring-2 focus:ring-ring/40"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      type="button"
      aria-label="Clear search"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
      @click="emit('update:modelValue', '')"
    >
      <Icon name="lucide:x" class="size-4" />
    </button>
  </div>
</template>

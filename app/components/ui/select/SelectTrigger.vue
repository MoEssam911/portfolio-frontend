<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { SelectIcon, SelectTrigger, type SelectTriggerProps, useForwardProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<
  SelectTriggerProps & {
    class?: HTMLAttributes['class'];
    size?: 'sm' | 'default';
  }
>();

const delegatedProps = reactiveOmit(props, 'class', 'size');
const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size ?? 'default'"
    v-bind="forwarded"
    :class="
      cn(
        `border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 py-1 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-8 data-[size=sm]:h-7 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <Icon name="lucide:chevron-down" class="size-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>

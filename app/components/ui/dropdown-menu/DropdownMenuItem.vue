<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { DropdownMenuItem, type DropdownMenuItemProps, useForwardProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<
  DropdownMenuItemProps & {
    class?: HTMLAttributes['class'];
    variant?: 'default' | 'destructive';
  }
>();

const delegatedProps = reactiveOmit(props, 'class', 'variant');
const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-variant="variant ?? 'default'"
    v-bind="forwarded"
    :class="
      cn(
        `focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:[&_svg]:!text-destructive relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>

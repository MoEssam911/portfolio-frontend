<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

const props = defineProps<DropdownMenuLabelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <DropdownMenuLabel
    data-slot="dropdown-menu-label"
    v-bind="delegatedProps"
    :class="cn('px-2 py-1.5 text-sm font-medium text-foreground', props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>

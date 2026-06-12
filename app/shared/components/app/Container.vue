<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  /** Element/component to render as. Default `div`. */
  as?: string;
  /** Max-width preset. `default` = 1280px reading width. */
  size?: 'default' | 'narrow' | 'wide' | 'full';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  size: 'default',
});

const sizes: Record<NonNullable<Props['size']>, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[88rem]',
  full: 'max-w-none',
};
</script>

<template>
  <component :is="as" :class="cn('mx-auto w-full px-4 sm:px-6 lg:px-12', sizes[size], props.class)">
    <slot />
  </component>
</template>

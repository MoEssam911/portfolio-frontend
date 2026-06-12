<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <!-- Consistent top/bottom rhythm for routed pages. The sticky header sits in
       normal flow, so no header offset is needed here. -->
  <div :class="cn('pb-24 pt-12 sm:pt-16', props.class)">
    <slot />
  </div>
</template>

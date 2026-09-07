<script setup lang="ts">
// Base glass card — the single source for the site's card shell (frosted glass
// surface + hairline edge + rounded corners). Specific cards (project, service,
// testimonial, …) compose this and add their own layout/content via the slot.
// Renders as any element/component via `as` (e.g. 'div', 'figure', NuxtLink);
// extra attrs (to, type, @click…) fall through to the root.
import type { Component, HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

interface Props {
  /** Element or component to render as. */
  as?: string | Component;
  /** Add the soft neon-lime hover halo for clickable cards. */
  interactive?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  interactive: false,
});
</script>

<template>
  <component
    :is="as"
    :class="cn('glass-surface rounded-2xl', interactive && 'neon-glow', props.class)"
  >
    <slot />
  </component>
</template>

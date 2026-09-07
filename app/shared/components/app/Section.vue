<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  /** Eyebrow label above the title (uppercase, primary). */
  label?: string;
  /** Section title (display font). */
  title?: string;
  /** Supporting description under the title. */
  description?: string;
  /** Header alignment. */
  align?: 'left' | 'center';
  /** Inner container width. */
  containerSize?: 'default' | 'narrow' | 'wide' | 'full';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  containerSize: 'default',
});

const slots = useSlots();

const hasHeader = computed(() =>
  Boolean(props.label || props.title || props.description || slots.header),
);
</script>

<template>
  <section :class="cn('py-20 sm:py-28', props.class)">
    <Container :size="containerSize">
      <div
        v-if="hasHeader"
        :class="cn('mb-12 flex flex-col gap-3', align === 'center' && 'items-center text-center')"
      >
        <slot name="header">
          <p
            v-if="label"
            class="label glass-surface inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-primary-light"
          >
            <span
              class="size-1.5 rounded-full bg-primary shadow-(--shadow-neon-soft)"
              aria-hidden="true"
            />
            {{ label }}
          </p>
          <h2 v-if="title" class="font-display text-3xl text-foreground sm:text-4xl">
            {{ title }}
          </h2>
          <p
            v-if="description"
            :class="cn('max-w-2xl text-lg text-muted-foreground', align === 'center' && 'mx-auto')"
          >
            {{ description }}
          </p>
        </slot>
      </div>
      <slot />
    </Container>
  </section>
</template>

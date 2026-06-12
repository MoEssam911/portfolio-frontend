<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Testimonial } from '~/modules/testimonials/types';

interface Props {
  testimonial: Testimonial;
  class?: string;
}

const props = defineProps<Props>();

const initials = computed(() =>
  props.testimonial.name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

const attribution = computed(() => {
  const { role, company } = props.testimonial;
  return [role, company].filter(Boolean).join(' · ');
});
</script>

<template>
  <figure
    :class="
      cn(
        'flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary-border',
        props.class,
      )
    "
  >
    <Icon name="lucide:quote" class="size-6 text-primary/40" aria-hidden="true" />

    <blockquote class="flex-1 text-pretty text-base leading-relaxed text-foreground">
      {{ testimonial.quote }}
    </blockquote>

    <figcaption class="flex items-center gap-3">
      <Avatar size="lg">
        <AvatarImage
          v-if="testimonial.avatar"
          :src="testimonial.avatar.url"
          :alt="testimonial.avatar.alt || testimonial.name"
        />
        <AvatarFallback class="bg-primary-subtle text-xs font-medium text-primary">
          {{ initials }}
        </AvatarFallback>
      </Avatar>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-foreground">{{ testimonial.name }}</span>
        <span v-if="attribution" class="text-xs text-muted-foreground">{{ attribution }}</span>
      </div>
    </figcaption>
  </figure>
</template>

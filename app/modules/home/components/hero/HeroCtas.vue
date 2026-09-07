<script setup lang="ts">
// Shared hero call-to-action pair (View Work / Get in Touch). Reused across the
// hero so the buttons stay identical wherever they appear.
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <NuxtLink
      to="/projects"
      :class="cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 text-sm shadow-cta')"
    >
      View Work
      <Icon name="lucide:arrow-right" class="size-4" />
    </NuxtLink>
    <NuxtLink
      to="/contact"
      :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-6 text-sm')"
    >
      Get in Touch
    </NuxtLink>
  </div>
</template>

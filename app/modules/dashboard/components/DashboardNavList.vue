<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * DashboardNavList — the sidebar link list, shared by the desktop rail and the
 * mobile sheet. When `collapsed`, shows icon-only links with a hover tooltip.
 */
defineProps<{ collapsed?: boolean }>();
const emit = defineEmits<{ navigate: [] }>();

const { nav, isActive } = useDashboardNav();
</script>

<template>
  <nav class="flex flex-col gap-0.5" aria-label="Dashboard">
    <template v-for="item in nav" :key="item.to">
      <Tooltip v-if="collapsed" :delay-duration="0">
        <TooltipTrigger as-child>
          <NuxtLink
            :to="item.to"
            :aria-label="item.label"
            :aria-current="isActive(item) ? 'page' : undefined"
            :class="
              cn(
                'flex items-center justify-center rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive(item)
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )
            "
            @click="emit('navigate')"
          >
            <Icon :name="item.icon" class="size-4.5" />
          </NuxtLink>
        </TooltipTrigger>
        <TooltipContent side="right">{{ item.label }}</TooltipContent>
      </Tooltip>

      <NuxtLink
        v-else
        :to="item.to"
        :aria-current="isActive(item) ? 'page' : undefined"
        :class="
          cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isActive(item)
              ? 'bg-accent font-medium text-foreground'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )
        "
        @click="emit('navigate')"
      >
        <Icon :name="item.icon" class="size-4.5 shrink-0" />
        <span class="truncate">{{ item.label }}</span>
      </NuxtLink>
    </template>
  </nav>
</template>

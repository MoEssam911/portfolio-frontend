<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';

const { data: services, pending, error } = useServices();

// Show published services, backend-ordered.
const visibleServices = computed(() => services.value.filter((s) => s.published));

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.07 });
</script>

<template>
  <Section
    label="What I Do"
    title="Services"
    description="Ways I can help bring your product to life."
    class="bg-card/30"
  >
    <div ref="sectionRef">
      <!-- Loading -->
      <div v-if="pending && services.length === 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" class="h-52 rounded-2xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl border border-border bg-card p-10 text-center">
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load services right now.</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="visibleServices.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">Service details coming soon.</p>
      </div>

      <!-- Populated -->
      <div v-else class="grid auto-rows-[1fr] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ServiceCard
          v-for="service in visibleServices"
          :key="service.id"
          :service="service"
          data-reveal
        />
      </div>
    </div>
  </Section>
</template>

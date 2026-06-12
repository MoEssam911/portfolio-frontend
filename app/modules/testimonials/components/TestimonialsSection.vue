<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';

const { pending, error, featuredTestimonials } = useTestimonials();

// Only featured + published surface on the home page.
const visibleTestimonials = computed(() => featuredTestimonials.value.filter((t) => t.published));

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.08 });
</script>

<template>
  <Section
    label="Social Proof"
    title="What people say"
    description="A few words from people I've built with."
    class="bg-card/30"
  >
    <div ref="sectionRef">
      <!-- Loading -->
      <div v-if="pending && featuredTestimonials.length === 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" class="h-56 rounded-2xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl border border-border bg-card p-10 text-center">
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load testimonials right now.</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="visibleTestimonials.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">Kind words coming soon.</p>
      </div>

      <!-- Populated -->
      <div v-else class="grid auto-rows-[1fr] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <TestimonialCard
          v-for="testimonial in visibleTestimonials"
          :key="testimonial.id"
          :testimonial="testimonial"
          data-reveal
        />
      </div>
    </div>
  </Section>
</template>

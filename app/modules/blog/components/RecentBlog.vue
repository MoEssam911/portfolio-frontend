<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Latest posts (backend returns newest-first); show the most recent three.
const { data: blog, pending, error } = useBlog(3);

const posts = computed(() => blog.value?.data.filter((p) => p.published).slice(0, 3) ?? []);

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.08 });
</script>

<template>
  <Section>
    <template #header>
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="flex flex-col gap-3">
          <p class="label text-primary">Writing</p>
          <h2 class="font-display text-3xl text-foreground sm:text-4xl">From the blog</h2>
          <p class="max-w-2xl text-lg text-muted-foreground">
            Notes on engineering, design, and the space between.
          </p>
        </div>
        <NuxtLink
          to="/blog"
          :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-4')"
        >
          All posts
          <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </template>

    <div ref="sectionRef">
      <!-- Loading -->
      <div v-if="pending && posts.length === 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" class="h-72 rounded-2xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl border border-border bg-card p-10 text-center">
        <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">Couldn't load posts right now.</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="posts.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
      >
        <p class="text-sm text-muted-foreground">First posts are in the works.</p>
      </div>

      <!-- Populated -->
      <div v-else class="grid auto-rows-[1fr] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <BlogCard v-for="post in posts" :key="post.id" :post="post" data-reveal />
      </div>
    </div>
  </Section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { BlogInput, BlogPost } from '~/modules/blog/types';
import { useAdminBlogPost } from '~/modules/dashboard/composables/useAdminBlog';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const route = useRoute();
const router = useRouter();

// The dynamic segment carries the SLUG (the GET-able key). We read by slug for
// display, but PATCH/DELETE by the resolved entity `id` (per the backend's
// "read by slug, mutate by id" convention; the slug regenerates on title change).
const slug = computed(() => String(route.params.id));

const { data: post, pending, error, refresh } = useAdminBlogPost(slug.value);

useHead(() => ({ title: post.value ? `Edit · ${post.value.title}` : 'Edit post' }));

// Mutations only here (no list fetch) — the index page owns the list refresh.
const { update, removeWithConfirm } = useResourceMutations<BlogPost, BlogInput, Partial<BlogInput>>(
  'blogs',
  { label: 'Post' },
);

const notFound = computed(() => !pending.value && !error.value && !post.value);

async function onSubmit(payload: BlogInput) {
  if (!post.value) return;
  const updated = await update.mutate({ id: post.value.id, input: payload });
  if (!updated) return;
  // The slug regenerates when the title changes — follow it so the route stays valid.
  if (updated.slug !== slug.value) {
    await router.replace(`/dashboard/blog/${updated.slug}`);
  } else {
    await refresh();
  }
}

async function onDelete() {
  if (!post.value) return;
  const result = await removeWithConfirm(post.value.id, post.value.title);
  if (result) await router.push('/dashboard/blog');
}

function onCancel() {
  router.push('/dashboard/blog');
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-3">
      <Button as-child variant="ghost" size="sm" class="-ml-2 w-fit text-muted-foreground">
        <NuxtLink to="/dashboard/blog">
          <Icon name="lucide:arrow-left" class="size-4" />
          Back to blog
        </NuxtLink>
      </Button>

      <PageHeader
        :title="post ? post.title : 'Edit post'"
        description="Update this article, its cover, tags, and visibility."
      >
        <template v-if="post" #actions>
          <StatusBadge :published="post.published" />
          <Button as-child variant="outline" size="sm" class="h-9">
            <NuxtLink :to="`/blog/${post.slug}`" target="_blank" rel="noopener">
              <Icon name="lucide:external-link" class="size-4" />
              View
            </NuxtLink>
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="h-9 text-destructive hover:text-destructive"
            @click="onDelete"
          >
            <Icon name="lucide:trash-2" class="size-4" />
            Delete
          </Button>
        </template>
      </PageHeader>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load this post</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Not found -->
    <EmptyState
      v-else-if="notFound"
      icon="lucide:file-question"
      title="Post not found"
      description="It may have been deleted, or the link is out of date."
    >
      <Button as-child size="sm">
        <NuxtLink to="/dashboard/blog">Back to blog</NuxtLink>
      </Button>
    </EmptyState>

    <!-- Loading -->
    <div v-else-if="pending" class="flex max-w-3xl flex-col gap-5">
      <Skeleton v-for="n in 4" :key="`form-sk-${n}`" class="h-10 w-full rounded-lg" />
      <Skeleton class="h-64 w-full rounded-lg" />
    </div>

    <!-- Populated -->
    <div v-else-if="post" class="max-w-3xl">
      <BlogForm
        :initial="post"
        :pending="update.pending.value"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </div>
  </div>
</template>

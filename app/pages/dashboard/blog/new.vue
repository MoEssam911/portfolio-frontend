<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { BlogInput } from '~/modules/blog/types';
import { useAdminBlog } from '~/modules/dashboard/composables/useAdminBlog';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'New post' });

const router = useRouter();
const { create } = useAdminBlog();

async function onSubmit(payload: BlogInput) {
  const created = await create.mutate(payload);
  // Go straight to the new post's edit page (read by its fresh slug).
  if (created) await router.push(`/dashboard/blog/${created.slug}`);
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
      <PageHeader title="New post" description="Write a new article for your blog." />
    </div>

    <div class="max-w-3xl">
      <BlogForm :pending="create.pending.value" @submit="onSubmit" @cancel="onCancel" />
    </div>
  </div>
</template>

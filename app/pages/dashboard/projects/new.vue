<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useAdminProjects } from '~/modules/dashboard/composables/useAdminProjects';
import type { ProjectInput } from '~/modules/projects/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'New project' });

const router = useRouter();
const { create } = useAdminProjects();

async function onSubmit(payload: ProjectInput) {
  const created = await create.mutate(payload);
  // Go straight to the new project's edit page (read by its fresh slug).
  if (created) await router.push(`/dashboard/projects/${created.slug}`);
}

function onCancel() {
  router.push('/dashboard/projects');
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-3">
      <Button as-child variant="ghost" size="sm" class="-ml-2 w-fit text-muted-foreground">
        <NuxtLink to="/dashboard/projects">
          <Icon name="lucide:arrow-left" class="size-4" />
          Back to projects
        </NuxtLink>
      </Button>
      <PageHeader title="New project" description="Create a new case study for your portfolio." />
    </div>

    <div class="max-w-3xl">
      <ProjectForm
        :pending="create.pending.value"
        submit-label="Create project"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </div>
  </div>
</template>

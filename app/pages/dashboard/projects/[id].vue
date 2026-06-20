<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminProject } from '~/modules/dashboard/composables/useAdminProjects';
import { useResourceMutations } from '~/modules/dashboard/composables/useResourceMutations';
import type { Project, ProjectInput } from '~/modules/projects/types';

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

const { data: project, pending, error, refresh } = useAdminProject(slug.value);

useHead(() => ({ title: project.value ? `Edit · ${project.value.title}` : 'Edit project' }));

// Mutations only here (no list fetch) — the index page owns the list refresh.
const { update, removeWithConfirm } = useResourceMutations<
  Project,
  ProjectInput,
  Partial<ProjectInput>
>('projects', { label: 'Project' });

const notFound = computed(() => !pending.value && !error.value && !project.value);

async function onSubmit(payload: ProjectInput) {
  if (!project.value) return;
  const updated = await update.mutate({ id: project.value.id, input: payload });
  if (!updated) return;
  // The slug regenerates when the title changes — follow it so the route stays valid.
  if (updated.slug !== slug.value) {
    await router.replace(`/dashboard/projects/${updated.slug}`);
  } else {
    await refresh();
  }
}

async function onDelete() {
  if (!project.value) return;
  const result = await removeWithConfirm(project.value.id, project.value.title);
  if (result) await router.push('/dashboard/projects');
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

      <PageHeader
        :title="project ? project.title : 'Edit project'"
        description="Update this case study, its media, and its visibility."
      >
        <template v-if="project" #actions>
          <Button as-child variant="outline" size="sm" class="h-9">
            <NuxtLink :to="`/projects/${project.slug}`" target="_blank" rel="noopener">
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
        <p class="font-display text-base text-foreground">Couldn't load this project</p>
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
      title="Project not found"
      description="It may have been deleted, or the link is out of date."
    >
      <Button as-child size="sm">
        <NuxtLink to="/dashboard/projects">Back to projects</NuxtLink>
      </Button>
    </EmptyState>

    <!-- Loading -->
    <div v-else-if="pending" class="flex max-w-3xl flex-col gap-5">
      <Skeleton v-for="n in 6" :key="`form-sk-${n}`" class="h-10 w-full rounded-lg" />
      <Skeleton class="h-32 w-full rounded-lg" />
    </div>

    <!-- Populated -->
    <div v-else-if="project" class="max-w-3xl">
      <ProjectForm
        :initial="project"
        :pending="update.pending.value"
        submit-label="Save changes"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </div>
  </div>
</template>

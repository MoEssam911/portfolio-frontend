<script setup lang="ts">
import type { Ref } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminResume } from '~/modules/dashboard/composables/useAdminResume';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

useHead({ title: 'Resume' });

const { formatDate } = useFormatters();

const {
  profile,
  experiences,
  educations,
  skillGroups,
  certifications,
  links,
  pending,
  error,
  refresh,
  profileMutation,
  experienceMutations,
  educationMutations,
  skillGroupMutations,
  certificationMutations,
  linkMutations,
} = useAdminResume();

async function onProfileSubmit(payload: Parameters<typeof profileMutation.mutate>[0]) {
  await profileMutation.mutate(payload);
}

/** Format a `start — end/Present` range for a list row. */
function rangeText(start: string | null, end: string | null, current: boolean): string {
  const s = start ? formatDate(start, 'MMM YYYY') : '';
  const e = current ? 'Present' : end ? formatDate(end, 'MMM YYYY') : '';
  return [s, e].filter(Boolean).join(' — ');
}

/**
 * Local create/edit dialog state for one collection. Wraps a
 * `useResourceMutations` bundle: `openCreate`/`openEdit` drive the dialog, and
 * `submit` routes to create or update by id, closing on success.
 */
type Mutations<TItem extends { id: string }, TInput> = {
  // TItem is inferred from `create.mutate`'s return; TInput from its argument.
  create: { mutate: (input: TInput) => Promise<TItem | null>; pending: Ref<boolean> };
  update: {
    mutate: (vars: { id: string; input: TInput }) => Promise<TItem | null>;
    pending: Ref<boolean>;
  };
};

function useSection<TItem extends { id: string }, TInput>(mutations: Mutations<TItem, TInput>) {
  const open = ref(false);
  const editing = ref<TItem | null>(null) as Ref<TItem | null>;
  const saving = computed(() => mutations.create.pending.value || mutations.update.pending.value);

  function openCreate() {
    editing.value = null;
    open.value = true;
  }
  function openEdit(item: TItem) {
    editing.value = item;
    open.value = true;
  }
  async function submit(payload: TInput) {
    const result = editing.value
      ? await mutations.update.mutate({ id: editing.value.id, input: payload })
      : await mutations.create.mutate(payload);
    if (result) {
      open.value = false;
      editing.value = null;
    }
  }

  return { open, editing, saving, openCreate, openEdit, submit };
}

const experienceSection = useSection(experienceMutations);
const educationSection = useSection(educationMutations);
const skillGroupSection = useSection(skillGroupMutations);
const certificationSection = useSection(certificationMutations);
const linkSection = useSection(linkMutations);
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader
      title="Resume"
      description="Your profile, experience, education, skills, certifications and links."
    />

    <!-- Loading -->
    <div v-if="pending && !profile" class="flex flex-col gap-6">
      <Skeleton class="h-64 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error && !profile"
      class="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-muted px-6 py-12 text-center"
    >
      <Icon name="lucide:triangle-alert" class="size-6 text-destructive" />
      <div>
        <p class="font-display text-base text-foreground">Couldn't load your resume</p>
        <p class="mt-1 text-sm text-muted-foreground">
          The backend may be unreachable. Make sure you're signed in and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="refresh">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Retry
      </Button>
    </div>

    <!-- Populated -->
    <template v-else-if="profile">
      <!-- Profile (singleton, inline) -->
      <section class="flex flex-col gap-4 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <div class="flex flex-col">
          <h2 class="font-display text-base text-foreground">Profile</h2>
          <p class="mt-0.5 text-sm text-muted-foreground">
            The header of your resume and the public About page.
          </p>
        </div>
        <ResumeProfileForm
          :initial="profile"
          :pending="profileMutation.pending.value"
          @submit="onProfileSubmit"
        />
      </section>

      <!-- Experience -->
      <ResumeSection
        title="Experience"
        description="Roles you've held — drag to set the display order."
        add-label="Add experience"
        empty-text="No experience added yet."
        :items="experiences"
        resource="resume/experiences"
        label="experiences"
        @add="experienceSection.openCreate"
        @edit="experienceSection.openEdit"
        @delete="(item) => experienceMutations.removeWithConfirm(item.id, item.title)"
      >
        <template #item="{ item }">
          <span class="truncate font-medium text-foreground">
            {{ item.title }}
            <span class="text-muted-foreground">· {{ item.company }}</span>
          </span>
          <span class="truncate text-xs text-muted-foreground">
            {{ rangeText(item.startDate, item.endDate, item.current) }}
            <template v-if="item.location"> · {{ item.location }}</template>
          </span>
        </template>
      </ResumeSection>

      <!-- Education -->
      <ResumeSection
        title="Education"
        description="Degrees and study — drag to set the display order."
        add-label="Add education"
        empty-text="No education added yet."
        :items="educations"
        resource="resume/educations"
        label="educations"
        @add="educationSection.openCreate"
        @edit="educationSection.openEdit"
        @delete="(item) => educationMutations.removeWithConfirm(item.id, item.degree)"
      >
        <template #item="{ item }">
          <span class="truncate font-medium text-foreground">
            {{ item.degree }}
            <span class="text-muted-foreground">· {{ item.school }}</span>
          </span>
          <span class="truncate text-xs text-muted-foreground">
            <template v-if="rangeText(item.startDate, item.endDate, item.current)">
              {{ rangeText(item.startDate, item.endDate, item.current) }}
            </template>
            <template v-if="item.field"> · {{ item.field }}</template>
          </span>
        </template>
      </ResumeSection>

      <!-- Skill groups -->
      <ResumeSection
        title="Skills"
        description="Grouped skills — drag to set the display order."
        add-label="Add group"
        empty-text="No skill groups added yet."
        :items="skillGroups"
        resource="resume/skill-groups"
        label="skill groups"
        @add="skillGroupSection.openCreate"
        @edit="skillGroupSection.openEdit"
        @delete="(item) => skillGroupMutations.removeWithConfirm(item.id, item.name)"
      >
        <template #item="{ item }">
          <span class="flex items-center gap-1.5 truncate font-medium text-foreground">
            <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" />
            {{ item.name }}
          </span>
          <span class="truncate text-xs text-muted-foreground">
            {{ item.skills.map((s) => s.name).join(', ') || 'No skills' }}
          </span>
        </template>
      </ResumeSection>

      <!-- Certifications -->
      <ResumeSection
        title="Certifications"
        description="Credentials — drag to set the display order."
        add-label="Add certification"
        empty-text="No certifications added yet."
        :items="certifications"
        resource="resume/certifications"
        label="certifications"
        @add="certificationSection.openCreate"
        @edit="certificationSection.openEdit"
        @delete="(item) => certificationMutations.removeWithConfirm(item.id, item.name)"
      >
        <template #item="{ item }">
          <span class="truncate font-medium text-foreground">
            {{ item.name }}
            <span class="text-muted-foreground">· {{ item.issuer }}</span>
          </span>
          <span v-if="item.issueDate" class="truncate text-xs text-muted-foreground">
            Issued {{ formatDate(item.issueDate, 'MMM YYYY') }}
          </span>
        </template>
      </ResumeSection>

      <!-- Links -->
      <ResumeSection
        title="Links"
        description="External profiles — drag to set the display order."
        add-label="Add link"
        empty-text="No links added yet."
        :items="links"
        resource="resume/links"
        label="links"
        @add="linkSection.openCreate"
        @edit="linkSection.openEdit"
        @delete="(item) => linkMutations.removeWithConfirm(item.id, item.label)"
      >
        <template #item="{ item }">
          <span class="truncate font-medium text-foreground">{{ item.label }}</span>
          <span class="truncate text-xs text-muted-foreground">{{ item.url }}</span>
        </template>
      </ResumeSection>
    </template>

    <!-- ── Dialogs ──────────────────────────────────────────────────────────── -->
    <Dialog
      :open="experienceSection.open.value"
      @update:open="experienceSection.open.value = $event"
    >
      <DialogContent class="flex max-h-[90vh] flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{
            experienceSection.editing.value ? 'Edit experience' : 'Add experience'
          }}</DialogTitle>
          <DialogDescription>A role you've held.</DialogDescription>
        </DialogHeader>
        <ExperienceForm
          :key="experienceSection.editing.value?.id ?? 'new'"
          :initial="experienceSection.editing.value"
          :pending="experienceSection.saving.value"
          :submit-label="experienceSection.editing.value ? 'Save changes' : 'Add experience'"
          @submit="experienceSection.submit"
          @cancel="experienceSection.open.value = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog :open="educationSection.open.value" @update:open="educationSection.open.value = $event">
      <DialogContent class="flex max-h-[90vh] flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{
            educationSection.editing.value ? 'Edit education' : 'Add education'
          }}</DialogTitle>
          <DialogDescription>A degree or course of study.</DialogDescription>
        </DialogHeader>
        <EducationForm
          :key="educationSection.editing.value?.id ?? 'new'"
          :initial="educationSection.editing.value"
          :pending="educationSection.saving.value"
          :submit-label="educationSection.editing.value ? 'Save changes' : 'Add education'"
          @submit="educationSection.submit"
          @cancel="educationSection.open.value = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog
      :open="skillGroupSection.open.value"
      @update:open="skillGroupSection.open.value = $event"
    >
      <DialogContent class="flex max-h-[90vh] flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{
            skillGroupSection.editing.value ? 'Edit skill group' : 'Add skill group'
          }}</DialogTitle>
          <DialogDescription>A named group of related skills.</DialogDescription>
        </DialogHeader>
        <SkillGroupForm
          :key="skillGroupSection.editing.value?.id ?? 'new'"
          :initial="skillGroupSection.editing.value"
          :pending="skillGroupSection.saving.value"
          :submit-label="skillGroupSection.editing.value ? 'Save changes' : 'Add group'"
          @submit="skillGroupSection.submit"
          @cancel="skillGroupSection.open.value = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog
      :open="certificationSection.open.value"
      @update:open="certificationSection.open.value = $event"
    >
      <DialogContent class="flex max-h-[90vh] flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {{ certificationSection.editing.value ? 'Edit certification' : 'Add certification' }}
          </DialogTitle>
          <DialogDescription>A credential you've earned.</DialogDescription>
        </DialogHeader>
        <CertificationForm
          :key="certificationSection.editing.value?.id ?? 'new'"
          :initial="certificationSection.editing.value"
          :pending="certificationSection.saving.value"
          :submit-label="certificationSection.editing.value ? 'Save changes' : 'Add certification'"
          @submit="certificationSection.submit"
          @cancel="certificationSection.open.value = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog :open="linkSection.open.value" @update:open="linkSection.open.value = $event">
      <DialogContent class="flex max-h-[90vh] flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ linkSection.editing.value ? 'Edit link' : 'Add link' }}</DialogTitle>
          <DialogDescription>An external profile or document.</DialogDescription>
        </DialogHeader>
        <LinkForm
          :key="linkSection.editing.value?.id ?? 'new'"
          :initial="linkSection.editing.value"
          :pending="linkSection.saving.value"
          :submit-label="linkSection.editing.value ? 'Save changes' : 'Add link'"
          @submit="linkSection.submit"
          @cancel="linkSection.open.value = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

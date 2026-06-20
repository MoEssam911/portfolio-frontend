<script setup lang="ts">
import { z } from 'zod';

import type { SettingsInput, SiteSettings } from '~/modules/settings/types';

/**
 * SettingsForm — the grouped site-settings editor (Site, Hero, About, Social,
 * Contact, Availability). Inline (not a dialog), like ResumeProfileForm: it owns
 * the FormShell and emits the upsert payload; the page runs the PATCH.
 *
 * The zod schema mirrors `UpdateSettingsDto`. Nullable URL fields are sent as
 * `null` when emptied (the backend clears them). `contactEmail` backs a required
 * non-null column, so it is OMITTED when empty rather than sent null/empty.
 */
const props = withDefaults(
  defineProps<{
    initial?: SiteSettings | null;
    /** Mutation in-flight — disables the footer (double-submit-safe). */
    pending?: boolean;
  }>(),
  { initial: null, pending: false },
);

const emit = defineEmits<{ submit: [payload: SettingsInput] }>();

// Empty string is allowed for the optional URL/email inputs; it's normalized to
// null (URLs) or omitted (email) at submit. `.or(z.literal(''))` lets a cleared
// field pass validation.
const optionalUrl = z
  .string()
  .url('Enter a valid URL (including https://)')
  .max(500, 'Keep the URL under 500 characters')
  .optional()
  .or(z.literal(''));

const schema = z.object({
  siteTitle: z.string().max(70, 'Keep the title under 70 characters'),
  siteDescription: z.string().max(160, 'Keep the description under 160 characters'),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  about: z.string(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  twitterUrl: optionalUrl,
  contactEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  resumeFileUrl: optionalUrl,
  availableForWork: z.boolean(),
});
type SettingsFormValues = z.infer<typeof schema>;

const initialValues: SettingsFormValues = {
  siteTitle: props.initial?.siteTitle ?? '',
  siteDescription: props.initial?.siteDescription ?? '',
  heroTitle: props.initial?.heroTitle ?? '',
  heroSubtitle: props.initial?.heroSubtitle ?? '',
  about: props.initial?.about ?? '',
  githubUrl: props.initial?.githubUrl ?? '',
  linkedinUrl: props.initial?.linkedinUrl ?? '',
  twitterUrl: props.initial?.twitterUrl ?? '',
  contactEmail: props.initial?.contactEmail ?? '',
  resumeFileUrl: props.initial?.resumeFileUrl ?? '',
  availableForWork: props.initial?.availableForWork ?? true,
};

/** '' → null for nullable URL columns (clears them); a value is trimmed. */
function urlOrNull(v: string | undefined): string | null {
  return v?.trim() || null;
}

function onSubmit(values: SettingsFormValues) {
  const payload: SettingsInput = {
    siteTitle: values.siteTitle.trim(),
    siteDescription: values.siteDescription.trim(),
    heroTitle: values.heroTitle.trim(),
    heroSubtitle: values.heroSubtitle.trim(),
    about: values.about.trim(),
    githubUrl: urlOrNull(values.githubUrl),
    linkedinUrl: urlOrNull(values.linkedinUrl),
    twitterUrl: urlOrNull(values.twitterUrl),
    resumeFileUrl: urlOrNull(values.resumeFileUrl),
    availableForWork: values.availableForWork,
  };

  // contactEmail backs a required column — only send a real value, never '' / null.
  const email = values.contactEmail?.trim();
  if (email) payload.contactEmail = email;

  emit('submit', payload);
}
</script>

<template>
  <FormShell
    :schema="schema"
    :initial-values="initialValues"
    :pending="pending"
    submit-label="Save settings"
    @submit="onSubmit"
  >
    <!-- Site -->
    <fieldset class="flex flex-col gap-5">
      <legend class="font-display text-sm text-foreground">Site</legend>
      <FormText
        name="siteTitle"
        label="Site title"
        placeholder="e.g. Mohamed Essam"
        description="Shown in the browser tab and as the base of every page title (max 70)."
      />
      <FormTextarea
        name="siteDescription"
        label="Site description"
        :rows="2"
        placeholder="A one-line description for search engines and social cards."
        description="Used as the default meta description (max 160)."
      />
    </fieldset>

    <!-- Hero -->
    <fieldset class="flex flex-col gap-5 border-t border-border pt-5">
      <legend class="font-display text-sm text-foreground">Hero</legend>
      <FormText name="heroTitle" label="Hero title" placeholder="e.g. Hi, I'm Mohamed" />
      <FormText
        name="heroSubtitle"
        label="Hero subtitle"
        placeholder="e.g. Backend engineer & open-source contributor"
      />
    </fieldset>

    <!-- About -->
    <fieldset class="flex flex-col gap-5 border-t border-border pt-5">
      <legend class="font-display text-sm text-foreground">About</legend>
      <FormTextarea
        name="about"
        label="About"
        :rows="4"
        placeholder="A short paragraph about you for the homepage / about section."
      />
    </fieldset>

    <!-- Social -->
    <fieldset class="flex flex-col gap-5 border-t border-border pt-5">
      <legend class="font-display text-sm text-foreground">Social</legend>
      <div class="grid gap-5 sm:grid-cols-2">
        <FormText name="githubUrl" label="GitHub" type="url" placeholder="https://github.com/…" />
        <FormText
          name="linkedinUrl"
          label="LinkedIn"
          type="url"
          placeholder="https://linkedin.com/in/…"
        />
      </div>
      <FormText name="twitterUrl" label="X / Twitter" type="url" placeholder="https://x.com/…" />
    </fieldset>

    <!-- Contact -->
    <fieldset class="flex flex-col gap-5 border-t border-border pt-5">
      <legend class="font-display text-sm text-foreground">Contact</legend>
      <FormText
        name="contactEmail"
        label="Contact email"
        type="email"
        placeholder="you@example.com"
        description="Where contact-form submissions are emailed, and the public contact address."
      />
      <FormMediaUrl
        name="resumeFileUrl"
        label="Résumé file"
        placeholder="https://…/resume.pdf"
        picker-title="Select a résumé PDF"
        description="Link to a downloadable PDF, or pick an uploaded file from your media library."
      />
    </fieldset>

    <!-- Availability -->
    <fieldset class="flex flex-col gap-5 border-t border-border pt-5">
      <legend class="font-display text-sm text-foreground">Availability</legend>
      <FormSwitch
        name="availableForWork"
        label="Available for work"
        description="Shows an availability badge on the public site."
      />
    </fieldset>
  </FormShell>
</template>

<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const { data: resume } = useResume();
const { settings } = useSiteSettings();
const { success, error } = useToast();
const url = useRequestURL();

const name = computed(() => settings.value?.siteTitle || 'Mohamed Essam');
const role = computed(() => resume.value?.headline || settings.value?.heroSubtitle || '');

// Download target — the profile's own export wins, else the global resume file.
const downloadUrl = computed(() => resume.value?.downloadUrl || settings.value?.resumeFileUrl || '');

async function copyLink() {
  try {
    await navigator.clipboard.writeText(url.href);
    success('Link copied', 'The résumé URL is on your clipboard.');
  } catch {
    error('Could not copy', 'Copy the URL from the address bar instead.');
  }
}

function printResume() {
  if (import.meta.client) window.print();
}

useSeo({
  title: 'Résumé',
  description: `The full professional résumé of ${name.value}${role.value ? ` — ${role.value}` : ''}.`,
});
</script>

<template>
  <div>
    <!-- Page chrome — hidden when printing. -->
    <div class="print:hidden">
      <PageHero eyebrow="Résumé" :title="name" :description="role" />
    </div>

    <Section container-size="narrow" class="pt-12 sm:pt-16">
      <!-- Actions -->
      <div class="mb-8 flex flex-wrap items-center gap-3 print:hidden">
        <a
          v-if="downloadUrl"
          :href="downloadUrl"
          target="_blank"
          rel="noopener noreferrer"
          download
          :class="cn(buttonVariants({ size: 'lg' }), 'h-11 px-5 shadow-cta')"
        >
          <Icon name="lucide:download" class="size-4" />
          Download PDF
        </a>

        <button
          type="button"
          :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-5')"
          @click="printResume"
        >
          <Icon name="lucide:printer" class="size-4" />
          Print
        </button>

        <button
          type="button"
          :class="cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-5')"
          @click="copyLink"
        >
          <Icon name="lucide:link" class="size-4" />
          Copy link
        </button>
      </div>

      <!-- Live-rendered résumé document. -->
      <ResumePreview />
    </Section>
  </div>
</template>

<!--
  Print stylesheet. Dark-only is the on-screen rule; print is the one place an
  ink-friendly light sheet is correct. The classic visibility technique isolates
  the résumé sheet from all app chrome regardless of layout structure.
-->
<style>
@media print {
  @page {
    margin: 1.5cm;
  }

  body * {
    visibility: hidden;
  }

  #resume-sheet,
  #resume-sheet * {
    visibility: visible;
  }

  #resume-sheet {
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    color: #18181b !important;
    background: #ffffff !important;
  }

  /* Ink-friendly: force readable dark text on white, neutralise tinted surfaces. */
  #resume-sheet *,
  #resume-sheet a {
    color: #18181b !important;
    background: transparent !important;
    border-color: #d4d4d8 !important;
    box-shadow: none !important;
  }

  /* Avoid breaking an entry across a page where possible. */
  #resume-sheet section,
  #resume-sheet li {
    break-inside: avoid;
  }
}
</style>

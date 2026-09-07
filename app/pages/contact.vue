<script setup lang="ts">
const { settings } = useSiteSettings();

const name = computed(() => settings.value?.siteTitle || 'Mohamed Essam');

useSeo({
  title: 'Contact',
  description: `Get in touch with ${name.value} — start a project, ask a question, or just say hello.`,
});

const sectionRef = ref<HTMLElement>();
useScrollReveal(sectionRef, { selector: '[data-reveal]', stagger: 0.1 });
</script>

<template>
  <div>
    <PageHero
      eyebrow="Contact"
      title="Let's start a conversation."
      description="Have a project in mind, a question, or just want to compare notes on the craft? My inbox is open — pick whichever way suits you."
    />

    <Section container-size="default">
      <div ref="sectionRef" class="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <!-- Ways to reach me -->
        <div data-reveal class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <h2 class="font-display text-2xl text-foreground sm:text-3xl">Reach out directly</h2>
            <p class="text-pretty text-muted-foreground">
              Prefer email or socials? Use any of the links below — otherwise the form sends
              straight to my inbox.
            </p>
          </div>
          <ContactOptions />
        </div>

        <!-- Form -->
        <div data-reveal>
          <ContactForm />
        </div>
      </div>
    </Section>
  </div>
</template>

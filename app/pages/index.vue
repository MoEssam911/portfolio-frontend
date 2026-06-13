<script setup lang="ts">
// Settings provided once by the default layout (see useSiteSettings).
const { settings } = useSiteSettings();
const config = useRuntimeConfig();
const url = useRequestURL();

const appName = config.public.appName as string;

// Reactive meta — getters re-evaluate once the settings request resolves (SSR
// waits for it), so crawlers receive the populated values.
useSeoMeta({
  ogTitle: () => settings.value?.siteTitle || appName,
  description: () => settings.value?.siteDescription || undefined,
  ogDescription: () => settings.value?.siteDescription || undefined,
  ogType: 'website',
  ogUrl: url.origin,
});

// JSON-LD graph — the site owner (Person) plus the site itself (WebSite).
const personLd = computed(() => {
  const s = settings.value;
  const sameAs = [s?.githubUrl, s?.linkedinUrl, s?.twitterUrl].filter((v): v is string =>
    Boolean(v),
  );

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${url.origin}/#person`,
        name: s?.siteTitle || 'Mohamed Essam',
        description: s?.siteDescription || s?.heroSubtitle || undefined,
        url: url.origin,
        email: s?.contactEmail || undefined,
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${url.origin}/#website`,
        name: s?.siteTitle || appName,
        description: s?.siteDescription || undefined,
        url: url.origin,
        publisher: { '@id': `${url.origin}/#person` },
        inLanguage: 'en',
      },
    ],
  };
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(personLd.value)),
    },
  ],
});
</script>

<template>
  <!-- Home composition — section order mirrors the knowledge base. -->
  <HeroSection />
  <FeaturedWork />
  <ServicesSection />
  <SkillsShowcase />
  <TestimonialsSection />
  <RecentBlog />
  <AboutTeaser />
  <ContactCTA />
</template>

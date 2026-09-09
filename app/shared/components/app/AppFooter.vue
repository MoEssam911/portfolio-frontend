<script setup lang="ts">
const { settings } = useSiteSettings();

const year = new Date().getFullYear();

interface SocialLink {
  label: string;
  icon: string;
  href: string;
}

const socials = computed<SocialLink[]>(() => {
  const s = settings.value;
  if (!s) return [];
  const links: SocialLink[] = [];
  if (s.githubUrl) links.push({ label: 'GitHub', icon: 'lucide:github', href: s.githubUrl });
  if (s.linkedinUrl)
    links.push({ label: 'LinkedIn', icon: 'lucide:linkedin', href: s.linkedinUrl });
  if (s.twitterUrl)
    links.push({ label: 'X / Twitter', icon: 'lucide:twitter', href: s.twitterUrl });
  if (s.contactEmail)
    links.push({ label: 'Email', icon: 'lucide:mail', href: `mailto:${s.contactEmail}` });
  return links;
});
</script>

<template>
  <footer class="relative mt-24">
    <!-- Aurora hairline — a neon lime gradient line that fades at both edges. -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--lime-line)_20%,var(--color-primary)_50%,var(--lime-line)_80%,transparent)]"
      aria-hidden="true"
    />
    <!-- Soft glow bloom rising from the hairline. -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-card-glow"
      aria-hidden="true"
    />
    <Container class="flex flex-col gap-10 py-14">
      <div class="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
        <div class="flex max-w-sm flex-col gap-3">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <AppLogo mark-only />
            <span class="text-gradient font-display text-base font-semibold tracking-tight">
              {{ settings?.siteTitle || 'Mohamed Essam' }}
            </span>
          </NuxtLink>
          <p class="text-sm text-muted-foreground">
            {{ settings?.siteDescription || 'Interfaces that behave like products.' }}
          </p>
        </div>

        <nav class="flex flex-col gap-2" aria-label="Footer navigation">
          <NuxtLink
            v-for="link in PRIMARY_NAV"
            :key="link.to"
            :to="link.to"
            class="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div v-if="socials.length" class="flex items-center gap-2">
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.href"
            :aria-label="social.label"
            target="_blank"
            rel="noopener noreferrer"
            class="glass-surface neon-glow inline-flex size-11 items-center justify-center rounded-xl! text-muted-foreground outline-none transition-colors hover:text-primary-light focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon :name="social.icon" class="size-4" />
          </a>
        </div>
      </div>

      <Separator />

      <div class="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {{ year }} {{ settings?.siteTitle || 'Mohamed Essam' }}. All rights reserved.</p>
        <p>Built with Nuxt — designed for the future.</p>
      </div>
    </Container>
  </footer>
</template>

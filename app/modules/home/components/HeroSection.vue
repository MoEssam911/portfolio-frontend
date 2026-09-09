<script setup lang="ts">
// Home hero — name + value prop + terminal. Motion gated on prefers-reduced-motion.
import { usePreferredReducedMotion } from '@vueuse/core';

const { settings, heroTitle, heroSubtitle } = useHeroContent();
const { role, location, topSkills } = useHeroStats();

const name = computed(() => settings.value?.siteTitle || 'Mohamed Essam');
const roleText = computed(() => role.value || 'Frontend Engineer');
const locationText = computed(() => location.value || 'Remote');
const stack = computed(() =>
  topSkills.value.length ? topSkills.value.slice(0, 3).join(' · ') : 'Vue · Nuxt · TypeScript',
);

const steps = computed(() => [
  { cmd: 'whoami', out: name.value },
  { cmd: 'cat stack.txt', out: stack.value },
  { cmd: 'pwd', out: locationText.value },
]);

interface Social {
  icon: string;
  href: string;
  label: string;
}
const socials = computed<Social[]>(() => {
  const s = settings.value;
  const out: Social[] = [];
  if (s?.githubUrl) out.push({ icon: 'lucide:github', href: s.githubUrl, label: 'GitHub' });
  if (s?.linkedinUrl) out.push({ icon: 'lucide:linkedin', href: s.linkedinUrl, label: 'LinkedIn' });
  if (s?.twitterUrl) out.push({ icon: 'lucide:twitter', href: s.twitterUrl, label: 'Twitter / X' });
  if (s?.contactEmail)
    out.push({ icon: 'lucide:mail', href: `mailto:${s.contactEmail}`, label: 'Email' });
  return out;
});

const root = ref<HTMLElement>();
useHeroIntro(root, 'home');

interface TLine {
  kind: 'cmd' | 'out';
  text: string;
}
const rendered = ref<TLine[]>([]);
const typingDone = ref(false);

const preferredMotion = usePreferredReducedMotion();
const timers: ReturnType<typeof setTimeout>[] = [];
let cancelled = false;
const sleep = (ms: number) => new Promise<void>((res) => timers.push(setTimeout(res, ms)));

async function play() {
  for (const step of steps.value) {
    if (cancelled) return;
    rendered.value.push({ kind: 'cmd', text: '' });
    const idx = rendered.value.length - 1;
    for (let i = 1; i <= step.cmd.length; i++) {
      if (cancelled) return;
      rendered.value[idx]!.text = step.cmd.slice(0, i);
      await sleep(52);
    }
    await sleep(320);
    if (cancelled) return;
    rendered.value.push({ kind: 'out', text: step.out });
    await sleep(460);
  }
  typingDone.value = true;
}

onMounted(async () => {
  await nextTick();
  if (preferredMotion.value === 'reduce') {
    for (const step of steps.value) {
      rendered.value.push({ kind: 'cmd', text: step.cmd });
      rendered.value.push({ kind: 'out', text: step.out });
    }
    typingDone.value = true;
    return;
  }
  play();
});

onScopeDispose(() => {
  cancelled = true;
  timers.forEach(clearTimeout);
});
</script>

<template>
  <section
    ref="root"
    class="relative -mt-17 flex min-h-svh items-center overflow-hidden sm:-mt-18"
    aria-label="Introduction"
  >
    <HeroFallback class="-z-10" />

    <Container class="py-20 sm:py-24 lg:py-28">
      <div class="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div class="order-2 max-w-xl lg:order-1">
          <h1
            data-hero-reveal
            class="text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tightest text-foreground sm:text-6xl lg:text-7xl"
          >
            {{ name }}
          </h1>
          <p
            data-hero-reveal
            class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-primary-light sm:text-base"
          >
            <span>{{ roleText }}</span>
            <span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <Icon name="lucide:map-pin" class="size-3.5" aria-hidden="true" />
              {{ locationText }}
            </span>
          </p>

          <p
            data-hero-reveal
            class="mt-5 max-w-lg text-pretty font-display text-xl font-medium text-foreground sm:text-2xl"
          >
            {{ heroTitle }}
          </p>

          <p
            data-hero-reveal
            class="mt-4 max-w-lg text-pretty text-base text-muted-foreground sm:text-lg"
          >
            {{ heroSubtitle }}
          </p>

          <HeroCtas data-hero-reveal class="mt-9 sm:mt-10" />

          <div v-if="socials.length" data-hero-reveal class="mt-8 flex items-center gap-2">
            <NuxtLink
              v-for="social in socials"
              :key="social.label"
              :to="social.href"
              external
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.label"
              class="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-border hover:text-primary"
            >
              <Icon :name="social.icon" class="size-4" />
            </NuxtLink>
          </div>
        </div>

        <div
          data-hero-reveal
          class="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:mx-0"
        >
          <div class="card-glow absolute -inset-6 -z-10 rounded-full blur-2xl" aria-hidden="true" />

          <div class="glass-surface-strong overflow-hidden rounded-2xl ring-1 ring-primary/15">
            <div class="flex items-center gap-2 border-b border-border px-4 py-3">
              <span class="size-2.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
              <span class="size-2.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
              <span class="size-2.5 rounded-full bg-primary/60" aria-hidden="true" />
              <span class="ml-2 truncate font-mono text-xs text-muted-foreground"
                >~/mohamed-essam</span
              >
              <Icon
                name="lucide:terminal"
                class="ml-auto size-3.5 text-muted-foreground/60"
                aria-hidden="true"
              />
            </div>

            <div class="min-h-44 space-y-2 p-5 font-mono text-sm leading-relaxed sm:p-6">
              <p v-for="(line, i) in rendered" :key="i" class="wrap-break-word">
                <template v-if="line.kind === 'cmd'">
                  <span class="text-primary">$</span>
                  <span class="ml-2 text-foreground">{{ line.text }}</span>
                </template>
                <span class="text-muted-foreground">{{ line.text }}</span>
              </p>
              <p v-if="typingDone" class="flex items-center" aria-hidden="true">
                <span class="text-primary">$</span>
                <span class="terminal-caret ml-2 inline-block h-4 w-2 bg-foreground/70" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </section>
</template>

<style scoped>
.card-glow {
  background: radial-gradient(circle at center, var(--lime-glow) 0%, transparent 70%);
}

.terminal-caret {
  animation: terminal-blink 1.1s steps(1) infinite;
}

@keyframes terminal-blink {
  0%,
  50% {
    opacity: 1;
  }
  50.01%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .terminal-caret {
    animation: none;
  }
}
</style>

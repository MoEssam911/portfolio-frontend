<script setup lang="ts">
// TEMPORARY — logo preview for selection. Remove after user picks a variant.
// Shows all 4 logo variants in an AppHeader-like strip so you can compare
// them in real context. Wire the chosen one into AppLogo.vue + favicon.svg,
// then delete this component and its usage in pages/index.vue.

const variants = [
  {
    id: 'current',
    label: 'Variant A — Single M (current)',
    description: 'Geometric M in a violet rounded square. Already in use.',
  },
  {
    id: 'me',
    label: 'Variant B — Geometric "ME" monogram',
    description: 'Both initials in a gradient rounded rectangle with separator.',
  },
  {
    id: 'code',
    label: 'Variant C — Code tag <ME />',
    description: 'Developer identity: angle brackets + violet ME + slash.',
  },
  {
    id: 'gem',
    label: 'Variant D — Abstract gem mark',
    description: 'Flat diamond/gem with violet gradient facets. Most distinctive.',
  },
] as const;
</script>

<template>
  <!-- LOGO PREVIEW — REMOVE AFTER PICK -->
  <div class="border-b border-primary-border bg-primary-subtle">
    <div class="mx-auto max-w-screen-lg px-4 py-4">
      <p class="mb-4 font-mono text-xs text-primary">
        LOGO PREVIEW — Click through variants and tell me which to keep. Then I'll remove this
        section.
      </p>
      <div
        class="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border"
      >
        <!-- Variant A: existing AppLogo -->
        <div class="flex items-center gap-6 bg-background px-6 py-4">
          <div class="w-56 shrink-0">
            <p class="font-mono text-[10px] text-muted-foreground">{{ variants[0].label }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">{{ variants[0].description }}</p>
          </div>
          <div class="flex items-center gap-8">
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">md (default)</span>
              <AppLogo />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">sm</span>
              <AppLogo size="sm" />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">mark only</span>
              <AppLogo mark-only />
            </div>
          </div>
        </div>

        <!-- Variant B: ME monogram -->
        <div class="flex items-center gap-6 bg-background px-6 py-4">
          <div class="w-56 shrink-0">
            <p class="font-mono text-[10px] text-muted-foreground">{{ variants[1].label }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">{{ variants[1].description }}</p>
          </div>
          <div class="flex items-center gap-8">
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">md (default)</span>
              <LogoMonogramME />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">sm</span>
              <LogoMonogramME size="sm" />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">mark only</span>
              <LogoMonogramME mark-only />
            </div>
          </div>
        </div>

        <!-- Variant C: Code tag -->
        <div class="flex items-center gap-6 bg-background px-6 py-4">
          <div class="w-56 shrink-0">
            <p class="font-mono text-[10px] text-muted-foreground">{{ variants[2].label }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">{{ variants[2].description }}</p>
          </div>
          <div class="flex items-center gap-8">
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">md (default)</span>
              <LogoCode />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">sm</span>
              <LogoCode size="sm" />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">mark only</span>
              <LogoCode mark-only />
            </div>
          </div>
        </div>

        <!-- Variant D: Gem mark -->
        <div class="flex items-center gap-6 bg-background px-6 py-4">
          <div class="w-56 shrink-0">
            <p class="font-mono text-[10px] text-muted-foreground">{{ variants[3].label }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">{{ variants[3].description }}</p>
          </div>
          <div class="flex items-center gap-8">
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">md (default)</span>
              <LogoGem />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">sm</span>
              <LogoGem size="sm" />
            </div>
            <div class="flex flex-col items-start gap-2">
              <span class="font-mono text-[9px] text-muted-foreground/60">mark only</span>
              <LogoGem mark-only />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- / LOGO PREVIEW -->
</template>

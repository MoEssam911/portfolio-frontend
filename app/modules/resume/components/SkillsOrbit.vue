<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import type { SkillGroup } from '~/modules/resume/types';

// Reuses the cached useResume() call — no extra network round-trip.
const { data: resume, pending, error } = useResume();

const groups = computed<SkillGroup[]>(() =>
  [...(resume.value?.skillGroups ?? [])].sort((a, b) => a.order - b.order),
);

// Auto-select the first group so the panel isn't blank on arrival.
const activeGroup = ref<SkillGroup | null>(null);
watch(
  groups,
  (next) => {
    if (next.length && !activeGroup.value) activeGroup.value = next[0] ?? null;
  },
  { immediate: true },
);

function toggleGroup(group: SkillGroup) {
  activeGroup.value = activeGroup.value?.id === group.id ? null : group;
}

const prefersReducedMotion = ref(false);
onMounted(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion.value = mq.matches;
  mq.addEventListener('change', (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches;
  });
});

// ── SVG orbital layout ───────────────────────────────────────────────────────
const VW = 500;
const VH = 500;
const CX = 250;
const CY = 250;
const INNER_R = 82;
const OUTER_R = 150;
const NODE_R = 26;

// Split groups roughly in half: first half on inner ring, rest on outer.
const splitAt = computed(() => Math.ceil(groups.value.length / 2));
const innerGroups = computed(() => groups.value.slice(0, splitAt.value));
const outerGroups = computed(() => groups.value.slice(splitAt.value));

interface OrbNode {
  group: SkillGroup;
  x: number;
  y: number;
  lx: number;
  ly: number;
  anchor: 'start' | 'middle' | 'end';
}

function buildNodes(arr: SkillGroup[], ringR: number, angleOffset = 0): OrbNode[] {
  if (!arr.length) return [];
  return arr.map((group, i) => {
    const angle = (2 * Math.PI * i) / arr.length - Math.PI / 2 + angleOffset;
    const x = CX + ringR * Math.cos(angle);
    const y = CY + ringR * Math.sin(angle);
    // Label sits just outside the node circle, radially.
    const labelR = ringR + NODE_R + 18;
    const lx = CX + labelR * Math.cos(angle);
    const ly = CY + labelR * Math.sin(angle);
    const cosA = Math.cos(angle);
    const anchor: 'start' | 'middle' | 'end' =
      cosA > 0.2 ? 'start' : cosA < -0.2 ? 'end' : 'middle';
    return { group, x, y, lx, ly, anchor };
  });
}

// Rotate outer ring nodes so they sit between inner ones visually.
const innerNodes = computed<OrbNode[]>(() => buildNodes(innerGroups.value, INNER_R, 0));
const outerNodes = computed<OrbNode[]>(() =>
  buildNodes(
    outerGroups.value,
    OUTER_R,
    outerGroups.value.length ? Math.PI / outerGroups.value.length : 0,
  ),
);

// Circle path strings for animateMotion satellites (M + two arcs = closed circle).
const innerPathD = `M${CX},${CY - INNER_R} a${INNER_R},${INNER_R} 0 1,1 0,${2 * INNER_R} a${INNER_R},${INNER_R} 0 1,1 0,-${2 * INNER_R}`;
const outerPathD = `M${CX},${CY - OUTER_R} a${OUTER_R},${OUTER_R} 0 1,1 0,${2 * OUTER_R} a${OUTER_R},${OUTER_R} 0 1,1 0,-${2 * OUTER_R}`;

function isActive(group: SkillGroup) {
  return activeGroup.value?.id === group.id;
}
</script>

<template>
  <Section
    label="Capabilities"
    title="Skills & tools"
    description="The technologies I reach for, grouped by what they do."
  >
    <!-- Loading -->
    <div v-if="pending && !groups.length" class="flex justify-center py-8">
      <Skeleton class="size-75 rounded-full" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-2xl border border-border bg-card p-10 text-center">
      <Icon name="lucide:triangle-alert" class="mx-auto size-6 text-muted-foreground" />
      <p class="mt-3 text-sm text-muted-foreground">Couldn't load skills right now.</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!groups.length"
      class="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
    >
      <p class="text-sm text-muted-foreground">Skills are being curated.</p>
    </div>

    <!-- Populated -->
    <div v-else class="flex flex-col gap-8">
      <!-- Desktop: SVG orbital (hidden on mobile) -->
      <div class="hidden justify-center md:flex">
        <svg
          :viewBox="`0 0 ${VW} ${VH}`"
          class="w-full max-w-105"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          :aria-label="`Skills orbital. Groups: ${groups.map((g) => g.name).join(', ')}. Click a group to see its skills.`"
        >
          <defs>
            <path id="skills-inner-path" :d="innerPathD" />
            <path id="skills-outer-path" :d="outerPathD" />
            <filter id="skills-node-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- Dashed orbit rings -->
          <circle
            :cx="CX"
            :cy="CY"
            :r="INNER_R"
            fill="none"
            stroke="var(--color-border)"
            stroke-width="1"
            stroke-dasharray="5 5"
          />
          <circle
            :cx="CX"
            :cy="CY"
            :r="OUTER_R"
            fill="none"
            stroke="var(--color-border)"
            stroke-width="1"
            stroke-dasharray="5 5"
          />

          <!-- Traveling satellites — skipped if prefers-reduced-motion -->
          <template v-if="!prefersReducedMotion">
            <circle r="3.5" fill="var(--color-primary)" opacity="0.65">
              <animateMotion dur="28s" repeatCount="indefinite">
                <mpath href="#skills-inner-path" />
              </animateMotion>
            </circle>
            <circle r="3" fill="var(--color-primary)" opacity="0.4">
              <animateMotion dur="46s" repeatCount="indefinite" begin="13s">
                <mpath href="#skills-outer-path" />
              </animateMotion>
            </circle>
          </template>

          <!-- Center "ME" node -->
          <circle
            :cx="CX"
            :cy="CY"
            r="30"
            fill="var(--color-card)"
            stroke="var(--color-primary-border)"
            stroke-width="1.5"
          />
          <text
            :x="CX"
            :y="CY + 5"
            text-anchor="middle"
            font-size="12"
            font-weight="700"
            font-family="var(--font-display)"
            fill="var(--color-foreground)"
          >
            ME
          </text>

          <!-- Inner ring nodes -->
          <g
            v-for="node in innerNodes"
            :key="node.group.id"
            class="cursor-pointer outline-none"
            role="button"
            tabindex="0"
            :aria-label="`${node.group.name} skills — click to explore`"
            :aria-pressed="isActive(node.group)"
            @click="toggleGroup(node.group)"
            @keydown.enter.prevent="toggleGroup(node.group)"
            @keydown.space.prevent="toggleGroup(node.group)"
          >
            <circle
              :cx="node.x"
              :cy="node.y"
              :r="NODE_R"
              :fill="isActive(node.group) ? 'var(--color-primary-muted)' : 'var(--color-card)'"
              :stroke="isActive(node.group) ? 'var(--color-primary)' : 'var(--color-border)'"
              stroke-width="1.5"
              :filter="isActive(node.group) ? 'url(#skills-node-glow)' : undefined"
            />
            <foreignObject
              :x="node.x - 14"
              :y="node.y - 14"
              width="28"
              height="28"
              class="pointer-events-none overflow-visible"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="flex size-full items-center justify-center"
              >
                <Icon
                  v-if="node.group.icon"
                  :name="node.group.icon"
                  class="size-4"
                  :class="isActive(node.group) ? 'text-primary' : 'text-muted-foreground'"
                />
                <span
                  v-else
                  class="select-none font-display text-xs font-bold leading-none"
                  :class="isActive(node.group) ? 'text-primary' : 'text-muted-foreground'"
                  >{{ node.group.name.charAt(0).toUpperCase() }}</span
                >
              </div>
            </foreignObject>
            <text
              :x="node.lx"
              :y="node.ly + 4"
              :text-anchor="node.anchor"
              font-size="11"
              font-family="var(--font-display)"
              :fill="
                isActive(node.group) ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
              "
              class="pointer-events-none select-none"
            >
              {{ node.group.name }}
            </text>
          </g>

          <!-- Outer ring nodes -->
          <g
            v-for="node in outerNodes"
            :key="node.group.id"
            class="cursor-pointer outline-none"
            role="button"
            tabindex="0"
            :aria-label="`${node.group.name} skills — click to explore`"
            :aria-pressed="isActive(node.group)"
            @click="toggleGroup(node.group)"
            @keydown.enter.prevent="toggleGroup(node.group)"
            @keydown.space.prevent="toggleGroup(node.group)"
          >
            <circle
              :cx="node.x"
              :cy="node.y"
              :r="NODE_R"
              :fill="isActive(node.group) ? 'var(--color-primary-muted)' : 'var(--color-card)'"
              :stroke="isActive(node.group) ? 'var(--color-primary)' : 'var(--color-border)'"
              stroke-width="1.5"
              :filter="isActive(node.group) ? 'url(#skills-node-glow)' : undefined"
            />
            <foreignObject
              :x="node.x - 14"
              :y="node.y - 14"
              width="28"
              height="28"
              class="pointer-events-none overflow-visible"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="flex size-full items-center justify-center"
              >
                <Icon
                  v-if="node.group.icon"
                  :name="node.group.icon"
                  class="size-4"
                  :class="isActive(node.group) ? 'text-primary' : 'text-muted-foreground'"
                />
                <span
                  v-else
                  class="select-none font-display text-xs font-bold leading-none"
                  :class="isActive(node.group) ? 'text-primary' : 'text-muted-foreground'"
                  >{{ node.group.name.charAt(0).toUpperCase() }}</span
                >
              </div>
            </foreignObject>
            <text
              :x="node.lx"
              :y="node.ly + 4"
              :text-anchor="node.anchor"
              font-size="11"
              font-family="var(--font-display)"
              :fill="
                isActive(node.group) ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
              "
              class="pointer-events-none select-none"
            >
              {{ node.group.name }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Skills panel (desktop only — appears below the orbital) -->
      <div class="hidden md:block">
        <Transition name="skill-panel" mode="out-in">
          <div
            v-if="activeGroup"
            :key="activeGroup.id"
            class="rounded-2xl border border-primary-border bg-card p-6"
          >
            <div class="mb-4 flex items-center gap-3">
              <div
                class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-primary-subtle"
              >
                <Icon
                  v-if="activeGroup.icon"
                  :name="activeGroup.icon"
                  class="size-4 text-primary"
                />
                <span v-else class="font-display text-xs font-bold text-primary">
                  {{ activeGroup.name.charAt(0) }}
                </span>
              </div>
              <h3 class="font-display text-xl font-semibold text-foreground">
                {{ activeGroup.name }}
              </h3>
              <span class="ml-auto font-mono text-xs text-muted-foreground">
                {{ activeGroup.skills.length }} skill{{
                  activeGroup.skills.length === 1 ? '' : 's'
                }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in activeGroup.skills"
                :key="skill.name"
                class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground"
              >
                <Icon v-if="skill.icon" :name="skill.icon" class="size-3.5 shrink-0" />
                {{ skill.name }}
              </span>
            </div>
          </div>
          <p v-else key="hint" class="py-2 text-center text-sm text-muted-foreground">
            Select a skill group above to explore its technologies
          </p>
        </Transition>
      </div>

      <!-- Mobile: stacked category cards (hidden on md+) -->
      <div class="grid gap-4 sm:grid-cols-2 md:hidden">
        <div
          v-for="group in groups"
          :key="group.id"
          class="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary-border"
        >
          <div class="flex items-center gap-3">
            <div
              class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-primary-subtle"
            >
              <Icon v-if="group.icon" :name="group.icon" class="size-4 text-primary" />
              <span v-else class="font-display text-xs font-bold text-primary">
                {{ group.name.charAt(0) }}
              </span>
            </div>
            <h3 class="font-display font-semibold text-foreground">{{ group.name }}</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in group.skills"
              :key="skill.name"
              class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground"
            >
              <Icon v-if="skill.icon" :name="skill.icon" class="size-3.5 shrink-0" />
              {{ skill.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Section>
</template>

<style scoped>
.skill-panel-enter-active,
.skill-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.skill-panel-enter-from,
.skill-panel-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

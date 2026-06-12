# Claude Code Portfolio Build Guide
## Prompts, Build Order, and Workflow

---

## PRE-FLIGHT CHECKLIST

Before opening Claude Code, verify this is done:

### Backend (portfolio-api)
```bash
npm run seed              # creates owner user
npx ts-node prisma/seed-portfolio.ts  # seeds portfolio data
npm run dev               # running on :4000
```

### Frontend (portfolio)
```bash
npm install motion lenis @inspira-ui/plugins
npm run dev               # running on :3000
```

### nuxt.config.ts — add these if missing
```typescript
experimental: {
  viewTransition: true,
},
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4000',
  },
},
```

### .env.development (frontend)
```
NUXT_PUBLIC_API_BASE=http://localhost:4000
```

### Inspira UI components
They are copy-paste — no full install. Before building any section,
check https://inspira-ui.com/components for the right component.
LLM-optimized reference: https://inspira-ui.com/docs/llms-full.txt

---

## WORKSPACE SETUP

Open both projects in the same Claude Code workspace so it can
read both codebases:

```
portfolio/              ← frontend (Nuxt 4)
portfolio-api/          ← backend (NestJS)
```

---

## PROMPT A — SESSION OPENER
### Paste this at the START of every Claude Code session

```
You are building Mohamed Essam's personal portfolio — a premium dark-only
Nuxt 4 frontend connected to a live NestJS + Prisma backend API.

━━━ READ THESE FILES FIRST (in order) ━━━

1. portfolio/PORTFOLIO_KNOWLEDGE_BASE.md  — full project context
2. portfolio/DESIGN_SYSTEM.md            — token architecture and rules
3. portfolio-api/BACKEND_STRUCTURE.md    — API reference

━━━ TECH STACK ━━━

Frontend:
- Nuxt 4 (app/ directory), TypeScript 5.7
- Tailwind CSS 4 with @theme-driven design tokens
- shadcn-vue + reka-ui (already configured)
- Pinia (stores), VeeValidate + Zod (forms)
- motion + lenis installed
- @inspira-ui/plugins installed

Backend API:
- Base URL: from runtimeConfig.public.apiBase
- All responses: { success: true, data: T } or { success: true, data: T[], meta: {...} }
- Public routes: no auth required
- All public routes start with /api/v1/ (no /dashboard/)

━━━ ABSOLUTE DESIGN RULES ━━━

These override everything, including what the UI/UX Pro Max skill suggests:

1. Dark only. :root IS the dark theme.
   NEVER use dark: variant prefix.
   NEVER add class="dark" to any element.
   NEVER define a .dark block.

2. All colors via semantic Tailwind utilities only:
   bg-background, text-foreground, bg-card, text-muted-foreground,
   border-border, bg-primary, text-primary, bg-muted, bg-accent
   — check DESIGN_SYSTEM.md for the full list.
   NEVER hardcode hex values in component files.

3. Fonts via CSS variables:
   font-display → Bricolage Grotesque (headings, hero)
   font-sans    → Geist (body, UI)
   font-mono    → Geist Mono (code)
   NEVER hardcode font-family in component files.

4. Animations use Motion imperative API:
   import { animate, stagger } from 'motion'
   Always wrap in: if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
   Use nextTick() before querying DOM elements in onMounted

5. Inspira UI for visual effects:
   - Check https://inspira-ui.com/docs/llms-full.txt before building any animated section
   - Copy components into app/components/ui/inspira/
   - Allowed effects for this project: SpotlightEffect, TextShimmer, BorderBeam,
     WordFadeIn, NumberTicker, BlurFade, GridPattern, DotPattern, MagneticButton
   - NEVER use: heavy particle systems, 3D globes, aurora (too flashy for this brand)
   - Adapt all Inspira components to use our design system tokens, not their default colors

6. Architecture rules:
   - useFetch (non-blocking) for all data — NOT await useFetch
   - Modular architecture: each feature lives in app/modules/[feature]/
   - API composables live in app/modules/[feature]/composables/ not in components
   - Feature types live in app/modules/[feature]/types/index.ts
   - Shared types (MediaItem, ApiSuccess<T>, ApiPaginated<T>) live in app/shared/types/api.ts
   - One concern per file — no 300-line components
   - Skeleton states for all async content (animate-pulse)
   - Error states for all fetch calls

━━━ FILE CONVENTIONS ━━━

Components: PascalCase → app/modules/[feature]/components/ProjectCard.vue
Composables: camelCase with use prefix → app/modules/[feature]/composables/useProjects.ts
Types: PascalCase interfaces → app/modules/[feature]/types/index.ts
API composables: one per resource → useSettings.ts, useProjects.ts (in their module)
Pages: kebab-case → /projects/[slug].vue

━━━ ACTIVE SKILLS ━━━

Activate the UI/UX Pro Max skill for all design work.
Query it with: stack=nuxtjs, style=minimal dark linear-inspired, project=portfolio

━━━ QUALITY GATES ━━━

Before marking any task complete:
□ npm run typecheck — zero errors
□ npm run lint — zero errors
□ Component handles: loading state, error state, empty state, populated state
□ No hardcoded colors, font names, or spacing magic numbers
□ prefers-reduced-motion respected in all animations

Confirm you've read all three files and are ready. List what you found in each.
```

---

## PROMPT B — COMPONENT BUILDER TEMPLATE
### Use this for every new section or page component

```
Build the [COMPONENT NAME] for the portfolio.

━━━ FILE ━━━
app/modules/[feature]/components/[ComponentName].vue
(shared layout shell → app/shared/components/app/[ComponentName].vue)

━━━ WHAT IT DOES ━━━
[Describe the section in 2-3 sentences. Reference the site map in
PORTFOLIO_KNOWLEDGE_BASE.md for the exact sections and their purpose.]

━━━ DATA SOURCE ━━━
Endpoint: [e.g., GET /api/v1/projects]
Response shape: { success: true, data: Project[], meta: { ... } }
Transform: (res) => res.data
Composable: create app/modules/[feature]/composables/[useComposableName].ts if it doesn't exist
(then add that dir to nuxt.config.ts imports.dirs)

useFetch pattern (non-blocking, shows skeleton immediately):
  const { data, pending, error } = useFetch(`${apiBase}/api/v1/[resource]`, {
    key: '[unique-key]',
    transform: (res) => res.data,
    default: () => [fallback],
  })

No await — let it hydrate from SSR payload.

━━━ TYPES ━━━
Create or reuse types in app/modules/[feature]/types/index.ts
(shared/cross-module types live in app/shared/types/api.ts).
Reference the exact field names from BACKEND_STRUCTURE.md Data Models section.
Always include id, slug where present (needed for routing and mutations).

━━━ LAYOUT ━━━
[Describe the layout precisely. Include:]
- Desktop layout (columns, grid, alignment)
- Mobile layout (how it changes at lg breakpoint)
- Max width, padding, section spacing

━━━ INSPIRA UI ━━━
Before coding, fetch https://inspira-ui.com/docs/llms-full.txt
and identify if any of these effects fit this section:
- [List 2-3 relevant Inspira UI effects you've considered]
If using an Inspira component, copy it into app/components/ui/inspira/
and adapt it to use our design system tokens (bg-background not #0A0A0B, etc.)

━━━ ANIMATIONS ━━━
[Describe exactly what should animate:]
- [Element]: [animation type] — [trigger: on mount / on scroll / on hover]
- Use animate + stagger from 'motion' for entrance sequences
- Use CSS transitions (duration-[150|200|250]) for hover/focus states
- Use useIntersectionObserver from @vueuse/core for scroll-triggered animations

━━━ STATES ━━━
Build all four states:
1. Loading: animate-pulse skeleton that matches the layout geometry
2. Error: minimal error message with retry option
3. Empty: friendly empty state with an action
4. Populated: the full component

━━━ DESIGN CONSTRAINTS ━━━
- All colors: semantic Tailwind utilities from DESIGN_SYSTEM.md only
- All fonts: via CSS variable utilities (font-display, font-sans, font-mono)
- Violet accent (bg-primary): use sparingly — max 3 instances per section
- Inline styles: only for gradient values from tokens.css gradient variables
- No hardcoded values anywhere

━━━ DESIGN ITERATION NOTE ━━━
Make visual decisions (spacing, sizing, border-radius, animation duration)
easy to find and change:
- Group all "look and feel" CSS at the top of each element's class list
- Comment any non-obvious design decision: {/* spacing matches --space-8 */}
- Keep structure (grid, flex) separate from visual (color, shadow, radius)

━━━ QUALITY GATES ━━━
□ npm run typecheck passes
□ npm run lint passes
□ All 4 states implemented
□ prefers-reduced-motion respected
□ Mobile-first responsive
□ No hardcoded values
```

---

## PROMPT C — DESIGN REVIEW & ITERATION
### Use this when you want to change how something looks

```
Review and update the design of [ComponentName].vue.

━━━ CURRENT FILE ━━━
app/components/[folder]/[ComponentName].vue

━━━ WHAT I WANT TO CHANGE ━━━
[Be specific. Examples:]
- The project cards feel too cramped — increase internal padding and add more
  breathing room between the thumbnail and text
- The headline tracking feels too tight on mobile — ease it slightly below lg
- The availability badge should use a pulsing animation on the green dot
- The hover state on cards should feel more pronounced — stronger border color change

━━━ WHAT MUST NOT CHANGE ━━━
- The overall layout structure (columns, grid)
- All semantic Tailwind utilities (bg-card, text-foreground, etc.) — only adjust values
- The animation timing (keep the existing stagger and ease)

━━━ CONSTRAINTS ━━━
- Still no hardcoded hex values — use or extend tokens.css if a new token is needed
- If you need a value that doesn't have a token, add it to tokens.css FIRST,
  then reference it
- Keep the dark-only rule intact
- All changes must pass typecheck and lint

After making the changes, list every line you changed and explain the design reasoning.
```

---

## PROMPT D — TYPE DEFINITION SETUP
### ✅ ALREADY DONE — kept for reference. Types now live in their modules.

```
Create the TypeScript type files for the portfolio API.

Type files (already created — modular layout):

1. app/shared/types/api.ts — base API envelope + shared MediaItem
2. app/modules/settings/types/index.ts — SiteSettings interface
3. app/modules/projects/types/index.ts — Project, ProjectGalleryImage interfaces
4. app/modules/blog/types/index.ts — BlogPost, ComputedBlogPost, Tag interfaces
5. app/modules/resume/types/index.ts — ResumeProfile, Experience, Education, SkillGroup, Certification, ResumeLink
6. app/modules/services/types/index.ts — Service interface
7. app/modules/testimonials/types/index.ts — Testimonial interface

Source of truth for field names and types:
→ BACKEND_STRUCTURE.md, section "Data Models"
→ PORTFOLIO_KNOWLEDGE_BASE.md, section "Real TypeScript Types"

Rules:
- Use interface, not type (preference)
- All nullable fields from the backend: field: string | null (not optional)
- id is always string (cuid)
- Dates from API are strings (ISO format) — computed as Date in the frontend if needed
- MediaItem is shared across multiple types — define it once in api.ts and import it
- Keep ComputedBlogPost (extends BlogPost) with readingTime?: number in blog.ts

After creating the files, run npm run typecheck to confirm zero errors.
```

---

## PROMPT E — API COMPOSABLES SETUP
### ✅ ALREADY DONE — kept for reference. Composables now live in their modules.

```
Create the API composable layer for the portfolio.

Composable files (already created — modular layout):

app/modules/settings/composables/useSettings.ts
app/modules/projects/composables/useProjects.ts
app/modules/blog/composables/useBlog.ts
app/modules/resume/composables/useResume.ts
app/modules/services/composables/useServices.ts
app/modules/testimonials/composables/useTestimonials.ts

(each module's composables dir is registered in nuxt.config.ts imports.dirs)

━━━ PATTERN FOR ALL COMPOSABLES ━━━

import type { ApiSuccess, ApiPaginated } from '~/shared/types/api'
import type { [ResourceType] } from '~/modules/[feature]/types'

export function use[Resource]() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  // For paginated resources (projects, blog):
  const { data, pending, error } = useFetch<ApiPaginated<[Type]>>(
    `${apiBase}/api/v1/[resource]`,
    {
      key: '[resource]-list',
      query: { page: 1, limit: 10 },
      transform: (res) => res,          // keep full shape for meta access
      default: () => ({ data: [], meta: null }),
    }
  )
  return { data, pending, error }
}

// For non-paginated resources (services, testimonials, settings):
  const { data, pending, error } = useFetch<ApiSuccess<[Type][]>>(
    `${apiBase}/api/v1/[resource]`,
    {
      key: '[resource]-list',
      transform: (res) => res.data,
      default: () => [],
    }
  )

━━━ SPECIAL CASES ━━━

useSettings.ts:
- Cache aggressively: getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
- Return transform: (res) => res.data (non-paginated, returns single object or null)

useProjects.ts:
- Expose a computed featuredProjects that filters featured: true from the data
- Accept optional limit parameter (default 10)

useBlog.ts:
- Add computed readingTime based on content word count (avg 200 wpm)
- Formula: Math.ceil(words.length / 200)

useTestimonials.ts:
- Expose a computed featuredTestimonials that filters featured: true

━━━ TYPES ━━━
Import from the types files you created in the previous step.
Use the exact field names from BACKEND_STRUCTURE.md.

After creating all files, run npm run typecheck — zero errors required.
```

---

## BUILD ORDER — PUBLIC PORTFOLIO

Follow this sequence exactly. Each step depends on the previous.

### Phase 0: Setup (do once)
1. ✅ Run Prompt A (session opener — every session)
2. ✅ Run Prompt D (type definitions)
3. ✅ Run Prompt E (API composables)

### Phase 1: Foundation
4. AppHeader component (logo, nav links, hire me CTA, scroll behavior)
5. AppFooter component (links, copyright, social icons)
6. app/plugins/lenis.client.ts (smooth scroll setup)
7. app/layouts/default.vue (wraps all pages with header + footer)

### Phase 2: Home Page Sections
Build in this order (each references previous sections for consistency):

8.  HeroSection           ← already built, review and apply Inspira SpotlightEffect
9.  FeaturedWork          ← GET /api/v1/projects (featured, limit 3) — bento grid layout
10. ServicesSection       ← GET /api/v1/services — card grid, BorderBeam on hover
11. SkillsShowcase        ← data from GET /api/v1/resume (skillGroups) — badge grid
12. TestimonialsSection   ← GET /api/v1/testimonials (featured) — quote cards
13. BlogPreview           ← GET /api/v1/blogs (limit 3) — minimal post cards
14. ContactCTA            ← settings.contactEmail — full-width call to action

### Phase 3: Projects
15. app/pages/projects/index.vue — grid, filtering by technology
16. app/pages/projects/[slug].vue — case study layout

### Phase 4: Blog
17. app/pages/blog/index.vue — post grid with search
18. app/pages/blog/[slug].vue — post with reading progress, TOC, prose styles

### Phase 5: Remaining Pages
19. app/pages/about.vue — bio, timeline, values, skills
20. app/pages/resume.vue — interactive resume with download
21. app/pages/contact.vue — form + server route + Resend

---

## DESIGN ITERATION WORKFLOW

When Claude Code builds a component and you want to change something:

1. **Run in dev** — see it in the browser first
2. **Note specifically** what feels wrong — spacing, color tint, animation timing,
   border weight, font size, etc.
3. **Use Prompt C** with the exact change described
4. **Never ask for a vague "improve the design"** — be specific:
   - ✅ "The card hover border should shift to rgba(139,92,246,0.4) not the current border-input"
   - ❌ "Make it look better"
5. If the change needs a new token, Claude Code should add it to tokens.css first

When you want to explore a different layout direction entirely:
- Describe the new approach here in this conversation (Claude.ai) first
- Get a visual mockup using the Visualizer
- Then take the approved direction to Claude Code

---

## INSPIRA UI REFERENCE — APPROVED COMPONENTS

These fit the Precision (Violet) brand. Use them where noted.

| Component | Where to use |
|-----------|-------------|
| SpotlightEffect | Hero section background |
| TextShimmer | Hero headline word effect |
| BorderBeam | Service cards, featured project card |
| WordFadeIn | Section titles on scroll |
| NumberTicker | Stats (years experience, projects count) |
| BlurFade | Project thumbnails, blog cover images |
| GridPattern | Hero background (very subtle, low opacity) |
| DotPattern | About page or contact section background |
| MagneticButton | Primary CTA buttons (subtle magnetic pull) |
| TextReveal | Section titles with scroll-triggered word reveal |
| ShineBorder | Card hover state alternative to BorderBeam |

Always: adapt to design system tokens. Remove their default hardcoded colors.
Never: particles, aurora, 3D globes, heavy WebGL (save for V2 if at all).

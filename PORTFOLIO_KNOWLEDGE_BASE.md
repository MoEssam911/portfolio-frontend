# PORTFOLIO_KNOWLEDGE_BASE.md
> The canonical reference for building this personal brand and portfolio.
> Treat this as a living document. Update it as decisions are made.
>
> **Owner:** Mohamed Essam
> **Last updated:** After backend refactors + frontend audit
> **Status:** Ready to build — foundation complete

---

## Table of Contents

1. [Vision](#vision)
2. [Branding](#branding)
3. [Design System](#design-system)
4. [Site Map](#site-map)
5. [Technical Architecture](#technical-architecture)
6. [API Integration Guidelines](#api-integration-guidelines)
7. [Coding Conventions](#coding-conventions)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Animation Principles](#animation-principles)
10. [Feature Roadmap](#feature-roadmap)
11. [Backend Improvement Suggestions](#backend-improvement-suggestions)
12. [Future Enhancements](#future-enhancements)

---

## 0. Current Repository State

> Read this section first at the start of every Claude Code session.
> This is what already exists — do not rebuild it.

### Backend (`portfolio-api`) — NestJS + Prisma + PostgreSQL

**Status: Stable. All planned refactors complete.**

- All routes under `/api/v1/` with standard `{ success, data }` envelope
- JWT auth, 7-day tokens, `GET /api/v1/auth/me` available
- Resources fully implemented: Blog, Projects, Resume, Services, Testimonials, Settings, Media
- Media pagination now matches standard shape (refactored)
- Testimonial avatar ownership validation fixed (refactored)
- Swagger docs at `GET /api/docs` (dev only)
- See `BACKEND_STRUCTURE.md` for the full endpoint reference

**What the backend does NOT have (handle in frontend):**
- No contact form endpoint → use Nuxt server route + Resend
- No search endpoint → use client-side search (fuse.js) for MVP
- No view counter endpoint → V1 feature

---

### Frontend (`portfolio`) — Nuxt 4 + Tailwind CSS 4 + shadcn-vue

**Status: Cleaned and scaffolded. Ready for feature development.**

#### What exists and must NOT be rebuilt:

**API layer (`app/core/api/`):**
- `client.ts` — configured `$fetch` instance; cookie keys: `auth_at`, `rt`; handles 401 redirects
- `types.ts` — base API type definitions

**Stores (`app/stores/`):**
- `ui.ts` — UI store (Pinia + pinia-plugin-persistedstate)

**Shared composables (`app/shared/composables/`):**
- `useFormatters.ts` — `formatDate`, `formatCurrency` (USD/en-US), `formatPercent`
- `useConfirm.ts` — confirm dialog state (key: `app-confirm`)
- `useToast.ts`, `useNetwork.ts`, `useSeo.ts` — global utilities

**Module composables (`app/modules/[feature]/composables/`):**
- `useSettings`, `useProjects`, `useBlog`, `useResume`, `useServices`, `useTestimonials`

**UI components (`app/components/ui/`):**
- Empty — shadcn-vue components are installed **on demand** when a feature needs them:
  `npx shadcn-vue@latest add [component]`. Do not assume a component is installed;
  check `app/components/ui/` first.

**Design system (`app/assets/css/`):**
- `tokens.css` — dark-only palette in `:root` (already authored)
- `main.css`, `utilities.css`, `base.css` — cleaned and de-RTL'd

**Config:**
- Tailwind CSS 4 — configured
- shadcn-vue + reka-ui — installed and configured (`components.json`: `rtl: false`)
- `lang="en"`, `dir="ltr"` hardcoded in `app.vue`
- ESLint + Prettier + Husky + commitlint + cspell — all configured and passing
- `@nuxt/image`, `@vueuse/core`, `@pinia/nuxt`, `vee-validate`, `zod`, `dayjs` — all installed

**Modular scaffold (created, ready to fill):**
```
app/
  modules/{settings, projects, blog, resume, services, testimonials, home}/
                       ← types + composables already populated; components/ are empty
  shared/composables/  ← useFormatters, useConfirm, useToast, useNetwork, useSeo
  shared/types/api.ts  ← MediaItem, ApiSuccess<T>, ApiPaginated<T>, ApiError
  shared/components/app/ ← empty, add AppHeader, AppFooter, AppLogo
  shared/utils/        ← empty, add formatters.ts, constants.ts, validators.ts
  components/ui/       ← empty, install shadcn-vue components on demand
  assets/css/          ← tokens.css is here, add typography.css + animations.css
  stores/              ← ui.ts (global only); module stores go in modules/[name]/stores/
```

#### Critical rules from the audit:
- **Dark is `:root`.** `tokens.css` defines dark values directly in `:root`. There is no `.dark` class anywhere. Never use `dark:` variant prefix in any component — it will not work and is not the pattern.
- **No RTL anywhere.** `dir="ltr"` is hardcoded. No `rtl:` variants, no `[dir="rtl"]` rules.
- **1 pre-existing lint warning** in `plugins/persistedstate.ts` (`any` type) — non-blocking, leave it.

---

## 1. Vision

### Project Vision

This is not a portfolio website. This is a **personal product** — a crafted digital presence that communicates who you are, what you value, and how you think. Every decision, from font choice to scroll behavior, should reinforce a singular identity: a frontend developer who operates at the intersection of engineering precision and design sensibility.

The benchmark is not "other developer portfolios." The benchmark is Linear, Vercel, and Raycast — products that feel inevitable, like they could not have been built any other way.

### Goals

**Primary goals:**
- Establish a memorable, distinctive personal brand in the AI era
- Demonstrate frontend craft through the site itself (the medium is the message)
- Attract high-quality opportunities: roles, freelance, collaborations, speaking
- Create a living publishing platform (blog, projects, thoughts)
- House a functional resume builder that generates shareable, professional resumes

**Secondary goals:**
- Build in public credibility: the site becomes a reference others cite
- Enable passive discovery through excellent SEO and shareable content
- Serve as a technical playground for exploring cutting-edge web patterns
- Lay the groundwork for a future admin/dashboard for content management

### Brand Philosophy

**Core belief:** Excellence in craft is the only differentiator that compounds. Tools change, frameworks retire, trends cycle — but the ability to build something that feels right never goes out of style.

**Three pillars:**
1. **Precision** — Everything is deliberate. No accidental choices.
2. **Depth** — Surface polish backed by architectural thinking.
3. **Momentum** — Always building toward something. The site should feel alive.

### What Success Looks Like

A visitor lands on this site and within 10 seconds understands:
- Who you are
- What you build
- Why it matters
- Why they should reach out

A technical recruiter, a design-minded founder, and a fellow developer should all leave with the same impression: "This person is exceptional at what they do."

---

## 2. Branding

### Positioning

**Category:** Frontend Developer specializing in the product experience layer — where design systems, performance, and user psychology meet.

**Differentiation:** Not a generalist. Not purely a UI builder. The rare profile that can read a Figma file, architect a component system, and reason about perceived performance — and then build it.

**Target audience:**
- Startups building their first serious product (Seed to Series B)
- Product-led companies who care about the interface as a competitive moat
- Design-conscious engineering teams
- Open source and developer tool companies

**Positioning statement (internal compass, not a tagline):**
> "I build interfaces that behave like products — considered, performant, and worth remembering."

### Personality

The brand personality sits at the intersection of five archetypes:

| Trait | Expression |
|---|---|
| **Craftsperson** | Deep care for the details no one asked for |
| **Architect** | Systems thinking, not just component building |
| **Minimalist** | Restraint as a form of confidence |
| **Explorer** | Genuinely curious about what's next |
| **Communicator** | Can explain complex things simply |

**What the brand is NOT:**
- Not flashy or attention-seeking
- Not jargon-heavy or gatekeeping
- Not generic or template-like
- Not overly casual or unprofessional

### Tone of Voice

**Writing style:** Direct, confident, occasionally dry. The tone of someone who has strong opinions and has earned them — but holds them with intellectual humility.

**Principles:**
- Lead with the specific, not the general
- Prefer active voice
- Use technical terms when precise, plain language when clearer
- Short sentences for impact, longer ones for nuance
- Never use filler phrases ("As a developer with X years...", "I am passionate about...")

**Examples:**

❌ "I am a passionate frontend developer with 5+ years of experience who loves creating beautiful user interfaces."

✅ "I build interfaces that engineers respect and users remember."

---

❌ "This project was a challenging but rewarding experience that taught me a lot about teamwork."

✅ "We were three days from launch with no design handoff. I built the entire UI from a Notion doc and a Loom video. It shipped on time."

### Color Palette

#### Decision: Direction A — Precision (Violet) ✅

Violet accent on near-black with cool undertone. Linear-inspired. Conveys precision + creativity without screaming "developer tool" (green) or "corporate" (blue). Files live at `app/assets/css/tokens.css`.

#### Neutrals

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#0A0A0B` | Page background — deepest layer |
| `--color-surface-1` | `#111113` | Cards, sections, primary containers |
| `--color-surface-2` | `#18181B` | Elevated surfaces, hover states |
| `--color-surface-3` | `#1F1F23` | Further elevation, nested containers |
| `--color-surface-4` | `#26262B` | Dropdowns, tooltips — highest elevation |
| `--color-border` | `#2A2A2E` | Default border |
| `--color-border-hover` | `#3F3F46` | Hover/focus border |
| `--color-border-strong` | `#52525B` | Input focus ring base |

#### Text

| Token | Hex | Role |
|---|---|---|
| `--color-text-primary` | `#FAFAFA` | Headings, active labels, key content |
| `--color-text-secondary` | `#A1A1AA` | Body text, descriptions |
| `--color-text-tertiary` | `#71717A` | Timestamps, captions, metadata |
| `--color-text-muted` | `#52525B` | Placeholders, secondary metadata |
| `--color-text-disabled` | `#3F3F46` | Disabled states |

#### Accent — Violet

| Token | Value | Role |
|---|---|---|
| `--color-accent` | `#8B5CF6` | Primary — buttons, links, active states |
| `--color-accent-hover` | `#7C3AED` | Hover on accent elements |
| `--color-accent-active` | `#6D28D9` | Pressed state |
| `--color-accent-light` | `#C4B5FD` | Text using accent tone on dark bg |
| `--color-accent-subtle` | `rgba(139,92,246,0.06)` | Hover bg, selections |
| `--color-accent-muted` | `rgba(139,92,246,0.10)` | Stronger bg tint |
| `--color-accent-wash` | `rgba(139,92,246,0.14)` | Active/selected bg |
| `--color-accent-border` | `rgba(139,92,246,0.20)` | Tinted borders, badges |
| `--color-accent-glow` | `rgba(139,92,246,0.15)` | Box-shadow glow |

#### Semantic Colors

| Token | Hex |
|---|---|
| `--color-success` | `#10B981` |
| `--color-warning` | `#F59E0B` |
| `--color-error` | `#EF4444` |
| `--color-info` | `#3B82F6` |

Each semantic color also has `-subtle` (0.08 opacity bg), `-border` (0.20 opacity border), and `-text` (lighter tint for text) variants.

#### Gradients (use sparingly)

```css
/* Hero — violet bloom from top */
--gradient-hero: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%);

/* Mesh — subtle section texture */
--gradient-mesh:
  radial-gradient(at 40% 20%, rgba(139,92,246,0.04) 0%, transparent 50%),
  radial-gradient(at 80% 0%,  rgba(59,130,246,0.03)  0%, transparent 50%);
```

### Typography System

#### Decision: Bricolage Grotesque + Geist ✅

Files live at `app/assets/css/typography.css`. Font loading configured in `nuxt.config.ts` via `@nuxt/fonts`.

#### Font Stack

| Role | Font | Fallback |
|---|---|---|
| **Display** (headings, hero) | Bricolage Grotesque | Syne, system-ui |
| **Body** (UI, prose) | Geist | Inter, system-ui |
| **Mono** (code, terminals) | Geist Mono | JetBrains Mono, monospace |

#### nuxt.config.ts — Font Loading

```typescript
modules: ['@nuxt/fonts'],
fonts: {
  families: [
    { name: 'Bricolage Grotesque', provider: 'google', weights: [400, 600, 700] },
    { name: 'Geist',               provider: 'google', weights: [300, 400, 500] },
    { name: 'Geist Mono',          provider: 'google', weights: [400, 500] },
  ],
  display: 'swap',
},
```

#### Type Scale (Fluid)

| Token | Range | Use |
|---|---|---|
| `--text-7xl` | 56px → 112px | Hero headlines |
| `--text-6xl` | 44px → 80px | Section titles |
| `--text-5xl` | 36px → 64px | Page titles, H1 |
| `--text-4xl` | 30px → 48px | H2 |
| `--text-3xl` | 24px → 36px | H3, card titles |
| `--text-2xl` | 20px → 24px | H4, large UI |
| `--text-xl` | 18px → 20px | H5, lead text |
| `--text-lg` | 16px → 18px | Large body |
| `--text-base` | 16px | Default body |
| `--text-sm` | 14px | Secondary content |
| `--text-xs` | 12px | Metadata, captions |
| `--text-2xs` | 11px | Badges, labels |

#### Typography Rules

- Display headings always use `font-family: var(--font-display)` (Bricolage Grotesque)
- Never exceed `font-weight: 700` — heavier weights rarely look refined on screen
- Heading letter-spacing: `-0.04em` to `-0.02em` (tight tracking is the signature)
- Body text: `--tracking-normal` (0) — never track body text
- Labels and metadata: `--tracking-widest` (0.10em) + uppercase only
- Always use `font-optical-sizing: auto` on display text



### Logo Ideas

#### Concept Direction
The logo should work as: a favicon (16×16), a social avatar (square), a wordmark in the header, and potentially as a watermark on resume PDFs.

**Option 1: Monogram + Mark (Recommended)**
- A geometric monogram from your initials
- Uses the accent color as the mark, neutral text for the name
- The mark should be a simple geometric form — a square with a cut corner, a stylized bracket, or an overlapping letterform
- Avoid: gradients, drop shadows, complex illustrations

**Option 2: Wordmark Only**
- Your full name in Bricolage Grotesque with custom letter-spacing
- A thin accent underline or side mark
- Clean, professional, no ambiguity

**Option 3: Symbol + Domain**
- A symbol (e.g., `</>` stylized, `{ }` minimal, a terminal cursor)
- Paired with your domain name as the wordmark
- Works well for developer positioning

**Logo principles:**
- Must work at 16px (favicon) and 400px (print)
- Must work in monochrome (for embossed/watermark use)
- Two versions: full (mark + wordmark) and compact (mark only)
- No more than 2 colors in the full version

### Tagline Ideas

Taglines organized by strategic intent:

**Precision-focused:**
> "Built to spec."
> "Every pixel accounted for."
> "Engineering the experience layer."

**Forward-looking (AI era):**
> "Interfaces for what comes next."
> "Crafting the AI-native web."
> "Frontend for the next generation."

**Personal/narrative:**
> "I build things worth clicking."
> "Where design stops, I start."

**Minimal/punchy (Linear-style):**
> "Ship better."
> "Interface architect."
> "Build. Polish. Ship."

**Recommended:** Pick something that is short (under 5 words), memorable, and works as both a hero subtitle and a Twitter bio. Test it by asking: "Would I be proud if this was on a t-shirt?"

### Brand Principles

These govern every design decision, not just aesthetics:

1. **Intention over decoration** — Every visual element earns its place or it is removed.
2. **Performance is design** — A 3-second load is a design failure. Speed is a feature.
3. **Content leads structure** — Layouts emerge from content needs, not the reverse.
4. **Dark mode is the default canvas** — Light mode is an enhancement, not the baseline.
5. **Motion earns trust** — Animation explains, clarifies, or delights. Never decorates.
6. **Typography carries weight** — When in doubt, solve it with type before reaching for color.
7. **Consistency at scale** — Every spacing, color, and component decision follows the system.
8. **Accessible by default** — Accessibility is not a checklist; it is a quality bar.

### Personal Story

The personal narrative should follow this arc (adapt to your actual background):

**The hook:** A specific moment, project, or realization that defines your relationship with frontend development. Not generic — a real scene.

**The tension:** The problem you kept encountering — the gap between "this works" and "this is right." The reason you developed a strong point of view.

**The resolution:** How you developed your approach. What you've built. What you've learned.

**The present:** Where you are now and what you're working toward.

**Story principles:**
- Write in first person, present tense for immediacy
- Use specific details over general claims
- The story should explain why you care, not just what you do
- End with a forward-looking statement that invites conversation

---

## 3. Design System

### Principles

1. **Token-first** — All design decisions are tokens. Colors, spacing, radii, shadows, and durations all live in a single `tokens.css` (or Tailwind config). Never hardcode values in components.
2. **Composable** — Components are atoms first. Molecules and organisms compose from atoms. No component should try to do too much.
3. **Variant-driven** — Use `cva` (class-variance-authority) for component variants. No conditional class strings in templates.
4. **Dark mode native** — All components are designed dark-first. Light mode is a `.light` class override on the root, not a separate component pass.
5. **Accessible by construction** — Use shadcn-vue's Reka UI primitives for all interactive components. Never build buttons, modals, or dropdowns from scratch.

### Spacing System

Base unit: **4px (0.25rem)**

```
4   (space-1)   → tight spacing, icon gaps, badge padding
8   (space-2)   → small gaps, label-to-input
12  (space-3)   → component internal padding
16  (space-4)   → standard gap, section internal
20  (space-5)
24  (space-6)   → card padding
32  (space-8)   → between components in a section
40  (space-10)
48  (space-12)  → section padding (top/bottom)
64  (space-16)
80  (space-20)  → large section gaps
96  (space-24)
128 (space-32)  → major section breaks
```

**Never use arbitrary spacing values.** If a value is not in the scale, question whether it is needed.

### Layout System

#### Container
```
Max width:    1280px (7xl)
Padding:      16px (mobile), 24px (tablet), 48px (desktop)
```

#### Grid
- Default: 12-column CSS Grid
- Content columns: 8/12 centered for reading
- Wide: 10/12 for cards and media
- Full: 12/12 for hero and full-bleed sections

#### Breakpoints (Tailwind defaults, extended)
```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

#### Common Layout Patterns
- **Prose layout:** `max-w-prose mx-auto` (65ch) for blog content
- **Card grid:** CSS Grid auto-fill with `minmax(320px, 1fr)`
- **Split layout:** 50/50 or 60/40 flex for feature sections
- **Bento grid:** Asymmetric grid for showcase sections

### Border Radius
```css
--radius-sm:   4px    /* Tags, badges, inputs */
--radius-md:   8px    /* Cards, buttons */
--radius-lg:   12px   /* Large cards */
--radius-xl:   16px   /* Modal, drawers */
--radius-2xl:  24px   /* Feature cards */
--radius-full: 9999px /* Pills, avatars */
```

### Shadow System
```css
/* Elevation-based, not decorative */
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md:  0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-lg:  0 12px 32px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.2);
--shadow-xl:  0 24px 64px rgba(0, 0, 0, 0.6);

/* Accent glow — use sparingly */
--shadow-glow: 0 0 0 1px var(--color-accent-border), 0 0 24px var(--color-accent-muted);
```

### Motion (Design System Layer)

#### Duration Tokens
```css
--duration-instant: 50ms
--duration-fast:    150ms
--duration-normal:  250ms
--duration-slow:    400ms
--duration-slower:  600ms
--duration-cinematic: 800ms–1200ms
```

#### Easing Tokens
```css
--ease-out:      cubic-bezier(0, 0, 0.2, 1)   /* Most UI transitions */
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1) /* Modals, drawers */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1) /* Playful interactions */
--ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1)    /* Page transitions */
```

### Core Component Inventory

These are the components to build in Phase 1. Everything else composes from these.

#### Primitives (wrap shadcn-vue)
- `Button` (variants: default, ghost, outline, destructive, link; sizes: sm, md, lg, icon)
- `Input`, `Textarea`, `Select`
- `Badge` (variants: default, outline, success, warning)
- `Card`, `CardHeader`, `CardBody`, `CardFooter`
- `Separator`
- `Dialog` / `Sheet` (drawer)
- `Tooltip`
- `DropdownMenu`
- `Tabs`
- `Command` (for ⌘K palette)
- `Avatar`
- `Skeleton` (loading state)
- `Toast` / `Sonner`
- `ScrollArea`

#### Layout Components
- `AppHeader` — sticky, blur-on-scroll, active link states
- `AppFooter` — minimal, links, copyright
- `PageWrapper` — consistent page padding and max-width
- `Section` — semantic section with optional label, title, description
- `Container` — constrained width with padding

#### Brand Components
- `Logo` — SVG mark + wordmark, with size variants
- `NavLink` — with active underline animation
- `CommandMenu` — ⌘K global search palette

#### Content Components
- `ProjectCard` — thumbnail, title, tags, description, hover state
- `BlogCard` — title, date, excerpt, reading time, category
- `SkillBadge` — icon + label, with category grouping
- `TimelineItem` — for career/project history
- `StatCard` — number highlight with label
- `TestimonialCard` — quote, author, avatar, company
- `TechStack` — icon grid of technologies

#### Section-Level Components
- `HeroSection` — full-viewport, animated headline, CTA
- `FeaturedWork` — 2–3 selected projects in bento layout
- `ServicesSection` — what you offer (driven by `/api/v1/services`)
- `TestimonialsSection` — social proof (driven by `/api/v1/testimonials`, featured only)
- `AboutPreview` — condensed about with link to /about
- `BlogPreview` — latest 3 posts
- `ContactCTA` — full-width call to action
- `SocialLinks` — icon row with hover effects

#### Utility Components
- `ReadingProgress` — top bar for blog posts
- `TableOfContents` — sticky sidebar for long-form content
- `CopyButton` — for code blocks
- `ExternalLink` — icon + accessible label
- `LazyImage` — with blur-up placeholder
- `AnimatedCounter` — for stats
- `GradientText` — accent gradient for headline words

---

## 4. Site Map

### Navigation Structure

```
Primary Navigation (Desktop)
├── Work
├── About
├── Blog
├── Resume ← link to /resume
└── [Hire me / Contact] ← CTA button

Mobile Navigation
└── Full-screen overlay or bottom sheet
```

### Pages

#### `/` — Home
**Purpose:** First impression. Establish identity, show best work, invite exploration.

**Data source:** `GET /api/v1/settings` drives hero title, subtitle, and social links.
`GET /api/v1/projects?featured=true` drives FeaturedWork (use `featured` flag, ordered by backend).
`GET /api/v1/services` drives ServicesSection.
`GET /api/v1/testimonials` drives TestimonialsSection (filter `featured: true` on the client).

**Sections (in order):**
1. `HeroSection` — Headline from `settings.heroTitle`, sub-headline from `settings.heroSubtitle`, two CTAs (View Work / Read Blog), subtle animated background. `availableForWork` badge from settings.
2. `LogoScroll` (optional) — Companies/clients worked with, subtle scroll marquee
3. `FeaturedWork` — 2–3 featured projects, bento or split layout
4. `ServicesSection` — What you offer, driven by the Services API
5. `SkillsShowcase` — Brief, visual, grouped by category
6. `TestimonialsSection` — Featured testimonials, driven by Testimonials API
7. `RecentBlog` — Latest 2–3 posts with preview cards
8. `AboutTeaser` — 2–3 sentences from `settings.about`, photo, link to /about
9. `ContactCTA` — Strong close: "Let's build something."

#### `/about` — About
**Purpose:** Deeper personal connection. The human behind the work.

**Sections:**
1. `PageHero` — Name, current role, location, one-liner
2. `Bio` — 3–4 paragraphs following the personal story arc
3. `Timeline` — Career/project history, animated on scroll
4. `Values` — 3–5 principles with icons and descriptions
5. `Skills` — Comprehensive, organized by category
6. `Stack` — Current tools and technologies I use daily
7. `Uses` — Teaser or inline: hardware, software, setup
8. `Availability` — Current status (available/not) with context

#### `/projects` — Projects
**Purpose:** Portfolio showcase. Filterable, searchable, explorable.

**Sections:**
1. `PageHero` — Title, brief description, project count
2. `FilterBar` — Filter by category (Web App, Tool, Open Source, etc.)
3. `ProjectGrid` — Card grid, auto-fill, masonry option
4. Empty state for filtered results

#### `/projects/[slug]` — Project Case Study
**Purpose:** Deep dive into a single project. This is where the storytelling happens.

**Sections:**
1. `CaseStudyHero` — Project name, description, live link, repo link, hero image/video
2. `ProjectMeta` — Tags, timeline, role, stack
3. `Overview` — The problem and solution
4. `Process` — How it was built (decisions, architecture, challenges)
5. `Results` — Outcomes, metrics, learnings
6. `Gallery` — Screenshots, demos, videos
7. `TechBreakdown` — Technical details for developer readers
8. `NextProject` — Navigation to next/previous case study

#### `/blog` — Blog
**Purpose:** Thought leadership, SEO, and demonstrating depth.

**Sections:**
1. `PageHero` — Title, post count, subscribe option
2. `FeaturedPost` — Latest or pinned post, large card
3. `PostGrid` — All posts with search and category filter
4. `CategoryFilter` — Tags/categories as pills
5. Pagination or infinite scroll

#### `/blog/[slug]` — Blog Post
**Sections:**
1. `PostHero` — Title, date, reading time, author, cover image
2. `ReadingProgress` — Top progress bar
3. `PostBody` — Markdown/MDX content with custom code blocks, callouts
4. `TableOfContents` — Sticky sidebar (desktop)
5. `PostMeta` — Tags, share buttons, views (optional)
6. `RelatedPosts` — 2–3 related articles
7. `CommentSection` (optional, V2)

#### `/resume` — Resume Builder
**Purpose:** Interactive, shareable, downloadable resume. Unique differentiator.

**Sections:**
1. `PageHero` — "My Resume" with download and share actions
2. `ResumePreview` — Live-rendered resume in a scrollable pane
3. `ResumeActions` — Download PDF, copy link, customize options
4. `ResumeCustomizer` (V1) — Template picker, color scheme
5. `SharableLink` — Unique URL for this resume version

#### `/contact` — Contact
**Purpose:** Conversion. Make it easy and low-friction to reach out.

**Sections:**
1. `PageHero` — "Let's talk." + current availability status
2. `ContactOptions` — Direct email, LinkedIn, social links
3. `ContactForm` — Name, email, subject, message, submit
4. `FAQAccordion` (optional) — Common questions answered

#### `/uses` — Uses
**Purpose:** Inbound SEO and community sharing. Developer community loves this.

**Sections:**
1. Hardware
2. Development Setup
3. Preferred Libraries/Frameworks
4. Design Tools
5. Productivity

#### `/api/*` — Not a page, but internal Nuxt API routes (BFF layer)

#### Future pages:
- `/dashboard` — Admin panel for content management
- `/tools/[slug]` — Small interactive tools/experiments
- `/speaking` — Talks, podcasts, appearances (if applicable)

### Navigation States

- **Active link:** Accent underline or dot indicator, not just color change
- **Hover:** Subtle opacity shift, cursor pointer
- **Focus:** Visible focus ring (accent color, 2px offset)
- **Mobile:** Full-screen overlay, links animate in with stagger

---

## 5. Technical Architecture

### Nuxt 4 Project Structure

Modular architecture: each feature domain owns its components, composables, and
types under `app/modules/`. Shared code lives in `app/shared/`, infrastructure in
`app/core/`, and routing stays in `app/pages/`.

```
app/
├── components/
│   └── ui/                     # shadcn-vue — install on demand (CLI target)
│
├── modules/                    # Feature domains. One folder per domain.
│   ├── settings/               # Site config, hero content, social links
│   │   ├── composables/        #   useSettings.ts
│   │   └── types/index.ts      #   SiteSettings
│   ├── projects/               # Portfolio projects
│   │   ├── components/         #   ProjectCard, FeaturedWork, ProjectGrid, …
│   │   ├── composables/        #   useProjects.ts
│   │   └── types/index.ts      #   Project, ProjectGalleryImage
│   ├── blog/                   # Blog posts
│   │   ├── components/         #   BlogCard, PostBody, ReadingProgress, TOC, …
│   │   ├── composables/        #   useBlog.ts
│   │   └── types/index.ts      #   BlogPost, ComputedBlogPost, Tag
│   ├── resume/                 # Resume profile and children
│   │   ├── components/         #   ResumePreview, TimelineItem, SkillBadge
│   │   ├── composables/        #   useResume.ts
│   │   └── types/index.ts      #   ResumeProfile, Experience, Education, …
│   ├── services/               # Services offered
│   │   ├── components/         #   ServiceCard, ServicesSection
│   │   ├── composables/        #   useServices.ts
│   │   └── types/index.ts      #   Service
│   ├── testimonials/           # Client testimonials
│   │   ├── components/         #   TestimonialCard, TestimonialsSection
│   │   ├── composables/        #   useTestimonials.ts
│   │   └── types/index.ts      #   Testimonial
│   └── home/                   # Home page composition (no own data source)
│       └── components/         #   HeroSection, ContactCTA, SkillsShowcase, …
│
├── shared/                     # Code used by 2+ modules
│   ├── components/app/         #   AppHeader, AppFooter, AppLogo (layout shell)
│   ├── composables/            #   useFormatters, useConfirm, useToast,
│   │                           #   useNetwork, useSeo
│   ├── types/api.ts            #   MediaItem, ApiSuccess<T>, ApiPaginated<T>, ApiError
│   └── utils/                  #   formatters.ts, constants.ts, validators.ts
│
├── core/                       # Infrastructure (not features)
│   ├── api/                    #   client.ts, useApi.ts, types.ts
│   ├── config/                 #   env.ts
│   ├── constants/  utils/  types/
│
├── pages/                      # Thin routing layer (index.vue, …)
├── layouts/
├── stores/                     # Global stores only (ui.ts).
│                               #   Module stores go in modules/[name]/stores/
└── plugins/
```

Adding a feature = adding a folder under `app/modules/` plus one line in
`nuxt.config.ts` `imports.dirs`. Module `stores/` are optional — create only when a
module needs shared reactive state.

### Nuxt 4 Configuration

```typescript
// nuxt.config.ts — key configuration decisions

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/content',      // V1: Blog via Nuxt Content
    'nuxt-og-image',      // OG image generation
    '@nuxtjs/sitemap',
  ],

  // Component auto-discovery (modular architecture).
  // pathPrefix:false → ProjectCard.vue registers as <ProjectCard>, not the
  // folder-prefixed name. Component names must be unique across all modules.
  components: [
    { path: '~/components', pathPrefix: false },        // shadcn-vue ui/ (+ inspira/)
    { path: '~/shared/components', pathPrefix: false },  // AppHeader, AppFooter, etc.
    { path: '~/modules', pathPrefix: false },            // all module components
  ],

  // Composable auto-import. Types are NOT auto-imported (always explicit).
  imports: {
    dirs: [
      'shared/composables',
      'modules/settings/composables',
      'modules/projects/composables',
      'modules/blog/composables',
      'modules/resume/composables',
      'modules/services/composables',
      'modules/testimonials/composables',
      'stores',        // useUiStore
      'core/utils',    // core helpers
      // Add new module composable dirs here as modules are created
    ],
  },

  // Rendering strategy (per page)
  routeRules: {
    '/':            { prerender: true },       // Static
    '/about':       { prerender: true },       // Static
    '/blog/**':     { isr: 3600 },             // ISR: revalidate hourly
    '/projects/**': { isr: 3600 },
    '/resume':      { ssr: true },             // SSR: dynamic
    '/contact':     { ssr: true },
    '/dashboard/**':{ ssr: true },             // Future: SSR + auth
  },
})
```

### TypeScript Patterns

#### API Response Typing
```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    perPage: number
  }
  error?: string
}

// Usage in composables
const { data, error } = await useAsyncData<ApiResponse<Project[]>>(
  'projects',
  () => $fetch('/api/projects')
)
```

#### Component Props Pattern
```typescript
// Use defineProps with TypeScript interface, not runtime declarations
interface Props {
  project: Project
  variant?: 'default' | 'featured' | 'compact'
  showTags?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showTags: true,
})
```

#### Composable Pattern
```typescript
// composables/useProjects.ts
export function useProjects() {
  const activeFilter = ref<string | null>(null)

  const { data: projects, pending, error } = useFetch<Project[]>(
    '/api/projects',
    {
      key: 'projects',
      default: () => [],
    }
  )

  const filtered = computed(() => {
    if (!activeFilter.value) return projects.value
    return projects.value?.filter(p => p.category === activeFilter.value)
  })

  return {
    projects: filtered,
    pending,
    error,
    activeFilter,
  }
}
```

### State Management (Pinia)

**Rule:** Only use Pinia for state that needs to be:
- Shared across multiple unrelated components
- Persisted across navigation
- Mutated from multiple sources

**Do NOT use Pinia for:** Page-level data (use `useAsyncData`), component-local state (use `ref`/`reactive`).

```typescript
// stores/ui.ts
export const useUIStore = defineStore('ui', () => {
  const commandOpen = ref(false)
  const theme = ref<'dark' | 'light'>('dark')
  const toasts = ref<Toast[]>([])

  function toggleCommand() { commandOpen.value = !commandOpen.value }
  function setTheme(t: 'dark' | 'light') { theme.value = t }

  return { commandOpen, theme, toasts, toggleCommand, setTheme }
}, {
  persist: { storage: localStorage, paths: ['theme'] }
})
```

### SEO Strategy

#### Per-page Meta
```typescript
// Every page uses useSeoMeta
useSeoMeta({
  title: () => `${post.value?.title} — Your Name`,
  description: () => post.value?.excerpt,
  ogImage: () => `/api/og/blog?title=${post.value?.title}`,
  twitterCard: 'summary_large_image',
})
```

#### Structured Data (JSON-LD)
- `Person` schema on Home and About pages
- `Article` schema on Blog posts
- `WebSite` schema with `SearchAction` on all pages
- `BreadcrumbList` on nested pages

#### Technical SEO
- Canonical URLs on all pages
- `robots.txt` — allow all, exclude `/dashboard`
- XML sitemap auto-generated (include blog posts, projects)
- RSS feed at `/feed.xml` for blog
- `hreflang` if multi-language is added later

### Performance Strategy

#### Core Web Vitals Targets
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

#### Implementation
- **Fonts:** `display: swap`, preload critical fonts, use `@nuxt/fonts` for automatic optimization
- **Images:** `@nuxt/image` with WebP/AVIF, width/height always set, `loading="lazy"` below fold
- **Scripts:** All third-party scripts deferred or loaded client-side with `<ClientOnly>`
- **CSS:** Critical CSS inlined by Nuxt, Tailwind purges unused classes
- **JS:** Route-based code splitting (Nuxt default), heavy components loaded lazily
- **Prefetching:** `<NuxtLink prefetch>` for navigation links

#### Caching Headers (via Nuxt server routes)
```typescript
// server/api/projects/index.get.ts
export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  })
  // fetch from upstream API...
})
```

### Content Management Strategy

#### Phase 1 (MVP): API + Postman
- All content lives in the backend API
- Managed via Postman collections or a simple REST client
- Data fetched at build/request time

#### Phase 2 (V1): Nuxt Content (optional hybrid)
- Blog posts as `.md`/`.mdx` files in `content/blog/`
- Nuxt Content provides parsing, querying, code highlighting
- Projects remain API-driven for richer data

#### Phase 3 (V2): Custom Dashboard
- Vue admin panel inside same Nuxt project under `/dashboard`
- Auth-gated via middleware
- CRUD operations for all content types

### Blog Architecture

```
Content flow:
Markdown/API → Nuxt Content or server fetch
→ BlogPost type → `/blog/[slug].vue`
→ Reading time calculation (composable)
→ Table of contents extraction (from headings)
→ OG image generation (server route)
→ RSS feed (server route)
```

**Blog post type:**
```typescript
interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string          // HTML or Markdown
  category: string
  tags: string[]
  publishedAt: string      // ISO date
  updatedAt?: string
  readingTime: number      // minutes
  coverImage?: string
  featured: boolean
  published: boolean
}
```

### Resume Builder Architecture

The resume builder is a key differentiator. It should feel like a mini SaaS product.

```
State (Pinia store):
  ResumeData {
    personalInfo: { name, email, phone, location, website, linkedin }
    summary: string
    experience: Experience[]
    education: Education[]
    skills: SkillGroup[]
    projects: ProjectReference[]
  }

  ResumeConfig {
    template: 'minimal' | 'modern' | 'technical'
    accentColor: string
    fontSize: 'sm' | 'md' | 'lg'
  }

Flow:
  Default data (from API) → user customizes → live preview updates
  → "Download PDF" triggers server-side or client-side PDF generation
  → "Share" creates a unique hash URL → /resume/[hash] serves static view
```

**PDF generation options:**
- Client-side: `html2pdf.js` or `jsPDF` (simpler, no server)
- Server-side: Puppeteer/Playwright headless render (better quality, requires server)
- Recommended: Start with client-side, upgrade to server-side in V1

### Dashboard Architecture (Future)

```
/dashboard/
  /dashboard/index.vue          → Overview stats
  /dashboard/posts/
    index.vue                   → Post list
    new.vue                     → Create post
    [id]/edit.vue               → Edit post
  /dashboard/projects/
    ...same pattern
  /dashboard/resume/
    index.vue                   → Manage resume data
  /dashboard/settings/
    index.vue                   → Site settings, theme, integrations
  /dashboard/analytics/
    index.vue                   → Visitor stats (PostHog/Plausible embed)
```

**Auth strategy:**
- JWT stored in httpOnly cookie (not localStorage)
- Server middleware checks token on `/dashboard/**` routes
- Refresh token rotation
- Consider: Nuxt Auth Utils module

---

## 6. API Integration Guidelines

> The full endpoint reference lives in `BACKEND_STRUCTURE.md`.
> This section covers the integration patterns — how to talk to that API correctly.

### Response Envelope

Every backend response is wrapped. Always unwrap before using data.

```typescript
// types/api.ts — base types matching the actual backend

// Success (non-paginated)
interface ApiSuccess<T> {
  success: true
  data: T
}

// Success (paginated)
interface ApiPaginated<T> {
  success: true
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Error
interface ApiError {
  success: false
  statusCode: number
  timestamp: string
  path: string
  message: string
  errors?: string[]   // only on validation failures (400)
}
```

### Key Integration Rules

**1. Read by slug, mutate by ID (Blog + Projects)**
The backend exposes `GET .../[slug]` for reading but `PATCH`/`DELETE .../[id]` for mutations.
Always keep both `id` and `slug` in your TypeScript types for these resources.

**2. Services and Testimonials are not paginated**
`GET /api/v1/services` and `GET /api/v1/testimonials` return full arrays. Do not build paginated composables for these — fetch all and filter on the client.

**3. Resume is one call**
`GET /api/v1/resume` returns the full profile including all child arrays (experiences, educations, skill groups, certifications, links), each pre-sorted by `order`. No pagination, no secondary calls.

**4. `useSettings()` is first-class — treat it like a layout concern**
Settings drive hero content, social links, contact email, and the `availableForWork` badge. Call it in the root layout and make the result available globally — not per-page.

```typescript
// composables/useSettings.ts
export function useSettings() {
  return useFetch<ApiSuccess<SiteSettings>>('/api/v1/settings', {
    key: 'site-settings',
    default: () => null,
    transform: (res) => res.data,
    // Cache aggressively — settings rarely change
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  })
}
```

**5. Auth token lives in a cookie, not a store**
The existing `core/api/client.ts` already handles cookie keys (`auth_at`, `rt`). Do not store tokens in Pinia. The `GET /api/v1/auth/me` endpoint is available to restore session state on dashboard page refresh.

### Base API Composable Pattern

```typescript
// The existing core/api/client.ts is the base — extend it, do not replace it.
// For public data fetching, use useFetch with the standard transform:

const { data: projects, pending, error } = useFetch<ApiPaginated<Project>>(
  '/api/v1/projects',
  {
    key: 'projects-list',
    query: { page: 1, limit: 10 },
    transform: (res) => res,   // keep full paginated shape; access .data and .meta
    default: () => ({ data: [], meta: null }),
  }
)
```

### Real TypeScript Types (matching backend models)

```typescript
// types/project.ts
interface Project {
  id: string
  slug: string
  title: string
  excerpt: string | null
  description: string
  liveUrl: string | null
  repoUrl: string | null
  technologies: string[]
  featured: boolean
  published: boolean
  thumbnail: MediaItem | null
  gallery: ProjectGalleryImage[]
  createdAt: string
  updatedAt: string
}

interface ProjectGalleryImage {
  id: string
  order: number
  media: MediaItem
}

// types/blog.ts
interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  published: boolean
  coverImage: MediaItem | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
  // Computed on frontend:
  readingTime?: number
}

interface Tag {
  id: string
  name: string
  slug: string
}

// types/resume.ts
interface ResumeProfile {
  id: string
  headline: string | null
  summary: string | null
  location: string | null
  downloadUrl: string | null
  experiences: Experience[]
  educations: Education[]
  skillGroups: SkillGroup[]
  certifications: Certification[]
  links: ResumeLink[]
}

interface Experience {
  id: string
  company: string
  title: string
  location: string | null
  startDate: string
  endDate: string | null
  current: boolean
  bullets: string[]
  order: number
}

interface Education {
  id: string
  school: string
  degree: string
  field: string | null
  startDate: string | null
  endDate: string | null
  current: boolean
  description: string | null
  order: number
}

interface SkillGroup {
  id: string
  name: string
  skills: string[]
  order: number
}

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string | null
  expiryDate: string | null
  url: string | null
  order: number
}

interface ResumeLink {
  id: string
  label: string
  url: string
  order: number
}

// types/settings.ts
interface SiteSettings {
  siteTitle: string
  siteDescription: string
  heroTitle: string
  heroSubtitle: string
  about: string
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  contactEmail: string
  resumeFileUrl: string | null
  availableForWork: boolean
}

// types/media.ts
interface MediaItem {
  id: string
  url: string
  key: string
  type: 'IMAGE' | 'VIDEO' | 'FILE'
  size: number | null
  mimeType: string
  originalName: string | null
  alt: string | null
  caption: string | null
}

// types/services.ts
interface Service {
  id: string
  title: string
  description: string
  priceRange: string | null
  icon: string | null
  featured: boolean
  published: boolean
  order: number
}

// types/testimonials.ts
interface Testimonial {
  id: string
  name: string
  role: string
  company: string | null
  quote: string
  avatar: MediaItem | null
  featured: boolean
  published: boolean
  order: number
}
```

### Error Handling Pattern

```typescript
// Map backend error shapes to user-friendly messages
// backend sends: { success: false, statusCode, message, errors? }

const friendlyError = computed(() => {
  if (!error.value) return null
  const status = error.value.statusCode ?? error.value.status
  if (status === 400) return 'Please check your input and try again.'
  if (status === 401) return 'Session expired. Please log in again.'
  if (status === 403) return 'You do not have permission to do this.'
  if (status === 404) return 'This content could not be found.'
  if (status === 409) return 'A conflict occurred. This may already exist.'
  if (status === 429) return 'Too many requests. Please slow down.'
  return 'Something went wrong. Please try again.'
})
```

### Contact Form — Nuxt Server Route

There is no contact endpoint on the backend. Use a Nuxt server route:

```typescript
// server/api/contact.post.ts
// Receives form data, sends email via Resend, returns success/error
// Install: npm install resend
// Validate with zod before calling Resend
// Rate limit via useRateLimit() or check IP in development
```

---

## 7. Coding Conventions

### General Principles
- **Readability first** — Code is written once, read many times
- **Explicit over implicit** — Avoid "magic" patterns; type everything
- **Small files** — A component over 200 lines is a signal to extract
- **Co-location** — Keep related code close (component + composable + types in same feature folder for complex features)

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProjectCard.vue` |
| Composables | camelCase with `use` prefix | `useProjects.ts` |
| Stores | camelCase with `use` prefix | `useUIStore` |
| Types/Interfaces | PascalCase | `BlogPost`, `ApiResponse` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PROJECTS_PER_PAGE` |
| CSS classes | Tailwind utilities, kebab-case for custom | |
| Files | kebab-case for all non-component files | `api-helpers.ts` |

### Vue Component Structure

Always follow this order inside `<script setup>`:
1. Imports (third-party, then internal)
2. Props (`defineProps`)
3. Emits (`defineEmits`)
4. Store instances
5. Reactive state (`ref`, `reactive`)
6. Computed properties
7. Composables
8. Watchers
9. Lifecycle hooks
10. Functions/methods

### Template Conventions
- Always use `v-bind` shorthand (`:`)
- Always use `v-on` shorthand (`@`)
- Always add `key` to `v-for` lists
- Never use `v-if` and `v-for` on the same element
- Use `<component :is>` for dynamic components
- Prefer `<Suspense>` + async components for lazy-loaded sections

### Tailwind Conventions
- Use `@apply` sparingly (only for base element styles, never in component files)
- Group utilities by: layout → box model → typography → visual → interactive
- Extract repeated utility groups to components, not `@apply`
- Use semantic class naming via CVA for component variants

### Git Conventions

**Branch naming:**
- `feat/command-menu`
- `fix/hero-animation-jank`
- `chore/update-dependencies`
- `docs/update-knowledge-base`

**Commit format (Conventional Commits):**
```
feat(blog): add reading progress indicator
fix(nav): correct active state on /projects/[slug]
chore(deps): update @vueuse/core to 11.x
docs: update API integration guidelines
```

---

## 8. Accessibility Requirements

Accessibility is a quality bar, not a legal checkbox. The target is WCAG 2.2 Level AA.

### Color and Contrast
- Text on background: minimum 4.5:1 contrast ratio (use a checker at every color combination)
- Large text (18px+ or 14px+ bold): minimum 3:1
- UI components (borders, icons): minimum 3:1
- Never use color alone to convey information (add text or icons)

### Keyboard Navigation
- All interactive elements reachable by Tab
- Focus order follows visual reading order
- Custom components (dropdowns, modals, sliders) follow ARIA authoring practices
- `:focus-visible` only (not `:focus`) to avoid outline on click
- Focus trapped in modals and drawers
- Skip-to-content link at the top of every page

### Screen Readers
- All images have `alt` text (descriptive for content, empty `alt=""` for decorative)
- Form inputs have associated `<label>` or `aria-label`
- Icon-only buttons have `aria-label`
- Dynamic content updates announced via `aria-live` regions
- `role="status"` for loading states
- Semantic HTML first — `<nav>`, `<main>`, `<article>`, `<aside>` landmarks

### Motion and Animation
- All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
- Do not use animations as the sole method of conveying information

### Forms
- Validation errors shown both visually (color + icon) and textually
- Error messages associated with inputs via `aria-describedby`
- Required fields indicated with `aria-required="true"`
- Form submission feedback via accessible toast notifications

### Specific Components
- **Navigation:** `<nav>` with `aria-label="Main navigation"`, active state uses `aria-current="page"`
- **Command Menu:** Follows combobox ARIA pattern, search results in `role="listbox"`
- **Image carousel:** Pause on hover, keyboard navigable, slide count announced
- **Code blocks:** Scrollable with keyboard, copy button accessible

---

## 9. Animation Principles

### Philosophy

> "Motion should serve the user's comprehension, not the designer's ego."

Good animation:
- Helps users understand where they are in a flow
- Provides feedback for user actions
- Creates a sense of physicality and continuity
- Signals hierarchy and emphasis

Bad animation:
- Delays access to information
- Happens for no functional reason
- Is inconsistent with surrounding motion
- Triggers on elements users are not looking at

### Principles

**1. Purposeful** — Every animated element has a reason for moving. Document it.

**2. Proportional** — Larger, more important elements move more dramatically. Small elements move subtly.

**3. Coordinated** — Elements in the same group animate together with slight stagger. Stagger = 50–80ms between items.

**4. Consistent physics** — Use the same easing and duration tokens. Do not mix spring physics with linear easing in the same interaction.

**5. Reduced motion first** — Design the non-animated version first. Animation is an enhancement.

### Interaction Animations (fast, snappy)

```
Hover:        100–150ms, ease-out
Active/Press: 50–100ms (faster than hover — snappy)
Focus:        150ms, ease-out
Tooltip:      100ms in, 50ms out
Toast:        200ms in, 150ms out
```

### Transition Animations (medium, clear)

```
Dropdown open:  200ms, ease-out
Modal open:     250ms, ease-cinematic (scale + fade)
Tab switch:     200ms, ease-in-out
Accordion:      200ms, ease-out (height transition)
Page navigate:  300–400ms (View Transitions API)
```

### Scroll Animations (slow, cinematic)

```
Fade-in-up:     400–600ms, ease-cinematic, triggered at 10% visibility
Scale-in:       500ms, ease-cinematic
Counter:        800ms–1200ms, ease-out (number incrementing)
Stagger delay:  50–80ms between siblings
```

### Specific Patterns

**Hero headline:** Individual words or lines animate in with a slight upward drift and fade. Duration: 600ms per group, stagger 80ms. Only on first load.

**Card hover:** Subtle `translateY(-2px)` + slight `box-shadow` increase. 150ms.

**Navigation:** Active indicator slides to the new link with a layout animation. 200ms.

**Page transitions (View Transitions API):**
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

::view-transition-new(root) {
  animation: fade-in 300ms var(--ease-cinematic);
}
```

**Scroll-triggered fade-up:** Use Intersection Observer. Elements start `opacity: 0, translateY: 20px`. When 20% in viewport: `opacity: 1, translateY: 0` with 400ms ease-cinematic.

### Libraries

| Library | Use case |
|---|---|
| `@vueuse/motion` | Component-level declarative animations |
| `motion-v` | Full Motion/Framer for Vue (complex sequences) |
| CSS View Transitions API | Page-level transitions (native, no library) |
| CSS Animations + Tailwind | Simple hover/focus states |

**Avoid:** GSAP (license cost for commercial use), heavy libraries for simple effects.

### What to Animate

✅ Page transitions
✅ Hero headline entrance
✅ Card hover states
✅ Navigation active indicator
✅ Command palette open/close
✅ Toast notifications
✅ Modal/sheet enter/exit
✅ Scroll-triggered section entrances (subtle)
✅ Loading skeletons
✅ Counter numbers

❌ Every single element on every page
❌ Continuous looping animations (unless in hero, briefly)
❌ Background particle systems
❌ Elements the user is not focused on
❌ Scroll parallax that causes layout shift

---

## 10. Feature Roadmap

### MVP (Launch-ready, core experience)

**Goal:** Live site with authentic, functional content. Prioritize completeness over features.

- [ ] Home page (all sections)
- [ ] About page
- [ ] Projects index + 3 case studies
- [ ] Blog index + 3 published posts
- [ ] Contact page with working form
- [ ] Dark mode (default)
- [ ] Responsive design (mobile-first)
- [ ] Basic SEO (meta tags, OG images, sitemap)
- [ ] Core animations (hero entrance, page transitions, card hovers)
- [ ] Typography and color system implemented
- [ ] Component library (Button, Card, Badge, Navigation)
- [ ] Self-hosted fonts
- [ ] Performance baseline (LCP < 2.5s)
- [ ] Error pages (404, 500)
- [ ] Contact form API integration
- [ ] Deployment to Vercel or Netlify

### V1 (Feature-complete personal brand)

**Goal:** Differentiated features that make this memorable and functional.

- [ ] ⌘K Command palette (search projects, blog, navigate)
- [ ] Resume page with download PDF
- [ ] Blog reading progress bar
- [ ] Blog table of contents (sticky sidebar)
- [ ] Project filtering by category/tag
- [ ] Blog search (client-side or API-powered)
- [ ] Light mode (polished, not afterthought)
- [ ] Keyboard navigation throughout
- [ ] `prefers-reduced-motion` full support
- [ ] RSS feed (`/feed.xml`)
- [ ] Open Graph image generation (dynamic per page)
- [ ] Web Vitals monitoring
- [ ] Basic analytics (Plausible, privacy-first)
- [ ] `/uses` page
- [ ] Code syntax highlighting in blog (Shiki)
- [ ] Social share buttons on blog posts
- [ ] Related posts section
- [ ] Scroll-triggered animations throughout

### V2 (AI-era differentiators)

**Goal:** Features that most developer portfolios don't have. These are conversation starters.

- [ ] AI assistant / portfolio chat (knows your resume, projects, availability)
- [ ] Shareable resume links with unique URLs (`/resume/[hash]`)
- [ ] Resume template picker (2–3 designs)
- [ ] Semantic blog search (vector-based, not keyword)
- [ ] Reading list / bookmarks (with localStorage)
- [ ] View counter on blog posts
- [ ] Interactive career timeline
- [ ] Dashboard (admin panel for content)
- [ ] Newsletter subscription (Resend or Buttondown)
- [ ] Email notification on contact form submission
- [ ] Automated OG images using `satori` or Puppeteer

### Future Ideas (Backlog / Experiments)

- [ ] `/tools` page — small interactive experiments (e.g., CSS gradient generator, color palette tool)
- [ ] GitHub activity heatmap component
- [ ] Spotify Now Playing widget
- [ ] "Office hours" booking integration (Cal.com)
- [ ] Multi-language support (Arabic — given location)
- [ ] Storybook for component documentation
- [ ] Automated `CHANGELOG.md` from commits
- [ ] End-to-end tests with Playwright
- [ ] Automated Lighthouse CI on every PR
- [ ] PWA (offline support, installable)
- [ ] WebGL shader background for hero (performance-permitting)
- [ ] Guestbook (authenticated comments via GitHub OAuth)

---

## 11. Backend Improvement Suggestions

> Backend is NestJS + Prisma + PostgreSQL. Mohamed built it while learning Node.js
> and can implement any enhancement. See `BACKEND_STRUCTURE.md` for full details.

### ✅ Completed Refactors

| Item | Status |
|---|---|
| Media pagination shape unified to `{ data, meta }` | ✅ Done |
| JWT token lifetime extended to 7 days | ✅ Done |
| `GET /api/v1/auth/me` endpoint added | ✅ Done |
| Testimonial `avatarId` ownership validation fixed | ✅ Done |

### Still Missing — Frontend workarounds in place

| Gap | Frontend workaround | Backend fix (future) |
|---|---|---|
| No contact form endpoint | Nuxt server route + Resend | Add `POST /api/v1/contact` |
| No search endpoint | Client-side fuse.js search | Add `GET /api/v1/search?q=` |
| No view counter | Omit for MVP | Add `POST /api/v1/views/:type/:slug` |
| No `.env.example` | This doc covers required vars | Create `.env.example` from BACKEND_STRUCTURE.md env table |

### Worth Fixing Before V2 Dashboard

- **Reference-safe media deletion** — Currently deleting a `Media` record that is a blog cover or project thumbnail leaves a dangling FK. Add an `onDelete: SetNull` to those relations in `schema.prisma`.
- **`GET /auth/me` session restoration** — Already added, but consider adding a response that includes token expiry info so the dashboard can proactively refresh before expiry.
- **`SITE_OWNER_EMAIL` dead constant** — `src/common/constants/site-owner.constant.ts` is unused. Delete it.
- **`DATABASE_URL` vs `DIRECT_URL`** — Both are Joi-required but `schema.prisma` only uses `DIRECT_URL`. Confirm pooled connection strategy before production deploy.
- **No tests** — `jest --listTests` is empty. For a learning project this is fine, but add tests to critical paths (auth, slug generation, ownership validation) before public launch.

### API Design Already Good

These were concerns in the initial plan but the backend already handles them correctly:
- ✅ All routes versioned under `/api/v1/`
- ✅ Consistent response envelope via global interceptor
- ✅ Slug-based public reads, ID-based mutations
- ✅ Structured validation errors from `ValidationPipe`
- ✅ Rate limiting (global 100/60s, login 10/60s)
- ✅ Security headers via `helmet`
- ✅ CORS configured with `credentials: true`

---

## 12. Future Enhancements

These are aspirational ideas that should not delay MVP but are worth keeping in mind during architecture decisions.

### Technical

- **Edge functions:** Move high-traffic API routes to edge for lower latency globally
- **Background jobs:** Email notifications, OG image generation, sitemap updates
- **WebSockets:** Real-time view counter updates on blog posts
- **Service Worker:** Offline support for previously visited pages
- **Container queries:** Use CSS container queries for truly responsive components
- **View Transitions API Level 2:** Cross-document transitions between pages

### Content and Engagement

- **Digital garden:** A second, less formal space for notes and half-formed ideas
- **Project changelog:** Per-project update log (what changed, when, why)
- **Learning log:** Public record of books read, courses taken, skills being developed
- **Colophon:** A page about how the site itself was built — meta and beloved by developers

### Community and Growth

- **Open source the site:** Once polished, publish the source. Developer community will respect this.
- **API documentation:** If you open the API, document it with Scalar or Swagger UI
- **Component playground:** An interactive component demo page
- **Sponsorship page:** If open source work grows, add GitHub Sponsors

### Business

- **Services page:** Explicit offering for freelance: what you do, how you work, rough pricing
- **Testimonials:** A rotating set on the home page from real clients/colleagues
- **Case studies PDF export:** Auto-generate branded PDFs from case study pages
- **Availability status:** A visible, honest indicator ("Available for freelance from March")

---

## Appendix: Reference Resources

### Design Reference
- linear.app — navigation, typography, dark mode execution
- vercel.com — hero sections, product marketing copy
- raycast.com — feature presentation, glassmorphism done right
- stripe.com — animation philosophy, documentation quality
- clerk.com — SaaS-style personal product feel

### Component Libraries
- ui.shadcn.com — composable, accessible, unstyled-first
- magicui.design — animation-heavy components for inspiration
- aceternity.com — cinematic effects (use sparingly)
- ui.aceternity.com/components — beam effects, cards, grids
- motion.dev — Motion for JavaScript/Vue animation library

### Tools
- Geist font: vercel.com/font
- Bricolage Grotesque: fonts.google.com
- Shiki: syntax highlighting for blog code blocks
- Plausible Analytics: privacy-first analytics
- Resend: transactional email API
- Satori + Resvg: OG image generation at the edge
- Zod: form and API response validation
- VueUse: composition utilities
- Pinia: state management

### MCP Servers (Claude Code Integration)
- `@modelcontextprotocol/server-filesystem` — file system access
- `@modelcontextprotocol/server-github` — GitHub integration for project data
- `@modelcontextprotocol/server-memory` — persistent project context
- Playwright MCP — browser automation for testing and screenshot generation
- Fetch MCP — HTTP requests for API testing

---

> **Owner:** Mohamed Essam
> **Last updated:** After backend refactors + frontend audit — ready to build
> **Read alongside:** `BACKEND_STRUCTURE.md` for the full endpoint and model reference

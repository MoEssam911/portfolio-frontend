Ready for review
Select text to add comments on the plan
Portfolio Frontend — Phased Build & Integration Plan
Context
Mohamed Essam wants to build the public portfolio/personal website (no dashboard) on top of the already-scaffolded Nuxt 4 frontend. The goal: a modern, futuristic, "from the future" personal brand with bold-but-tasteful cinematic animation, a clean professional portrait integrated into the design, and live integration with the seeded NestJS backend.

The scaffold is mature: design tokens (dark-only violet), API client, modular folders, and module composables/types already exist. All UI components are empty — this plan fills them, phase by phase.

This file is the single source of truth for the build. Each phase below ends with an explicit copy-paste prompt to start that phase in a fresh Claude Code session. Do the phases in order; each assumes the previous one is merged.

Locked decisions
Motion intensity: Bold & cinematic. Signature hero + scroll-driven reveals throughout. Tasteful.
Photo: Clean professional portrait. Use a placeholder now with a marked swap point (PHOTO SWAP).
Backend: Running & seeded at NUXT_PUBLIC_API_BASE (default http://localhost:4000). Integrate live; verify each phase against real responses.
Animation stack: Inspira UI (Vue/Nuxt port of Aceternity/Magic UI, shadcn-style install) + motion (installed) for custom scroll choreography + lenis (installed) for smooth scroll. No GSAP.
Non-negotiable rules (from CLAUDE.md — apply in every phase)
Dark only. :root is the dark theme. Never dark: variant, never class="dark".
Semantic Tailwind utilities only (bg-background, text-foreground, bg-primary, …). No hex in components.
Fonts via tokens only (font-display, font-sans, font-mono). No hardcoded families.
Data fetching: useFetch (non-blocking, no await), always transform: (res) => res.data, always default: () => fallback.
Animations: import { animate, stagger } from 'motion'; always check prefers-reduced-motion; always await nextTick() before DOM queries in onMounted.
New module → add its composables dir to nuxt.config.ts imports.dirs. Types are always explicitly imported.
Quality gates before any phase is "done": npm run typecheck (0 errors), npm run lint (0 errors), and all 4 states built (loading skeleton / error / empty / populated).
Architecture facts (verified)
Modules at app/modules/{settings,projects,blog,resume,services,testimonials,home}/ — composables & types populated, components/ empty.
Shared: app/shared/composables/ (useFormatters, useConfirm, useToast, useNetwork, useSeo), app/shared/components/app/ (empty — AppHeader/Footer/Logo go here), app/shared/types/api.ts.
Core: app/core/api/{client.ts,useApi.ts,types.ts}. shadcn-vue components install to app/components/ui/.
Public API (all { success, data }): GET /api/v1/settings, /projects (paginated + /:slug), /blogs (paginated + /:slug), /resume (singleton), /services (array), /testimonials (array). No contact endpoint (Nuxt server route + Resend). No search (client-side fuse.js).
useSettings() is a layout concern — call once in the default layout, provide globally.
Phase 0 — Foundation: animation stack, layout shell, base primitives
Why first: Every later phase depends on the smooth-scroll engine, the scroll-reveal composable, the layout shell (header/footer), and a handful of base UI primitives. Build the chassis before the body.

Scope

Animation stack setup
Add motion-v (Inspira UI's peer dep; motion core is already installed). Configure Inspira UI per its Nuxt guide (Tailwind v4 @source, cn util already at app/lib/utils.ts). Components copy into app/components/inspira/ (already referenced by nuxt.config.ts components glob).
Lenis smooth scroll: app/plugins/lenis.client.ts, gated on prefers-reduced-motion (disable when reduced).
app/shared/composables/useScrollReveal.ts — IntersectionObserver + motion's animate/stagger, respects reduced motion, await nextTick(). This is the workhorse for section entrances.
app/shared/composables/useReducedMotion.ts (or reuse VueUse usePreferredReducedMotion).
Reduced-motion global CSS block in app/assets/css/base.css; enable View Transitions (already on in config).
Layout shell (app/shared/components/app/)
AppHeader.vue — sticky, blur-on-scroll, animated active nav indicator, mobile Sheet overlay with staggered links, availableForWork badge + "Hire me" CTA from settings.
AppFooter.vue — minimal: nav, social links from settings, copyright.
AppLogo.vue — SVG monogram mark + wordmark (Bricolage), size variants. Works at 16px.
app/layouts/default.vue — wraps header/footer, calls useSettings() once and provides it; hero gradient background slot; skip-to-content link.
Layout primitives in app/shared/components/app/: Container.vue, Section.vue (label/title/desc), PageWrapper.vue.
Base shadcn-vue primitives (install on demand): button badge separator tooltip skeleton sonner avatar sheet dialog → app/components/ui/. Wire <Sonner/> + confirm provider into app.vue.
Photo plumbing: app/assets/images/ placeholder portrait + PHOTO SWAP comment markers where used.
Refine tokens.css only if a needed effect token is missing (e.g. grid/aurora gradient). Document any change.
Verify: npm run dev renders an empty page with working sticky header, mobile menu, footer, smooth scroll; reduced-motion disables Lenis + reveals. Quality gates pass.

Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 0 — Foundation exactly as written there. Set up the animation stack (add motion-v, configure Inspira UI shadcn-style into app/components/inspira/, add a reduced-motion-aware Lenis client plugin, build useScrollReveal + reduced-motion composables). Build the layout shell (AppHeader with blur-on-scroll + animated active nav + mobile Sheet, AppFooter, AppLogo, layouts/default.vue that calls useSettings() once and provides it globally, plus Container/Section/PageWrapper primitives). Install base shadcn-vue primitives (button, badge, separator, tooltip, skeleton, sonner, avatar, sheet, dialog) and wire Sonner into app.vue. Add a placeholder portrait with PHOTO SWAP markers. Follow every non-negotiable rule. Finish by passing npm run typecheck and npm run lint (zero errors) and running the dev server to confirm the shell works.

Phase 1 — Home: cinematic hero
Why: The hero is the centerpiece of the "from the future" impression — the 10-second test. Build it in isolation so we can perfect the motion before adding content sections.

Scope (app/modules/home/components/)

HeroSection.vue — full-viewport. Headline from settings.heroTitle (animated word/line reveal via motion + stagger, first-load only), subhead from settings.heroSubtitle, two CTAs (View Work / Read Blog), availableForWork badge. Clean professional portrait framed on one side (PHOTO SWAP placeholder) with a tasteful violet glow/ring — not duotone.
Futuristic background: one signature Inspira UI effect (e.g. aurora / animated grid / spotlight) tuned to the violet token palette, subtle, GPU-friendly (transform/opacity), disabled under reduced motion.
Wire into app/pages/index.vue. SEO via useSeo/useSeoMeta with Person JSON-LD.
Verify: Hero fills viewport, headline animates once on load, portrait + glow look intentional, background effect is smooth at 60fps and off under reduced motion, responsive 375/768/1440. Quality gates pass.

Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 1 — Home: cinematic hero. Build HeroSection.vue in app/modules/home/components/: full-viewport, animated headline/subhead from useSettings() (word/line stagger via motion, first-load only), View Work + Read Blog CTAs, availableForWork badge, and a clean professional portrait (PHOTO SWAP placeholder) with a tasteful violet glow/ring. Add ONE signature Inspira UI futuristic background effect tuned to the violet tokens — subtle, GPU-friendly, disabled under prefers-reduced-motion. Mount it in app/pages/index.vue with SEO meta + Person JSON-LD. Follow all non-negotiable rules and pass typecheck + lint with zero errors.

Phase 2 — Home: content sections
Why: With the hero set, assemble the rest of the home composition. All sections scroll-reveal via useScrollReveal for a cohesive cinematic feel.

Scope

app/modules/projects/components/: ProjectCard.vue, FeaturedWork.vue (bento, useProjects featured).
app/modules/services/components/: ServiceCard.vue, ServicesSection.vue (useServices).
app/modules/home/components/: SkillsShowcase.vue (from resume skill groups), AboutTeaser.vue (settings.about + portrait), ContactCTA.vue.
app/modules/testimonials/components/: TestimonialCard.vue, TestimonialsSection.vue (featured filter).
app/modules/blog/components/: BlogCard.vue, RecentBlog.vue (latest 3).
Compose all into app/pages/index.vue in KB order. Every section: 4 states + scroll reveal.
Verify: Full home page scrolls with staggered section entrances, all data live from backend, every section degrades gracefully (loading/empty/error). Quality gates pass.

Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 2 — Home: content sections. Build, with scroll-reveal (useScrollReveal) and all 4 states: ProjectCard + FeaturedWork (bento, featured projects), ServiceCard + ServicesSection, SkillsShowcase (from resume skill groups), TestimonialCard + TestimonialsSection (featured), BlogCard + RecentBlog (latest 3), AboutTeaser (settings.about + portrait), ContactCTA. Compose them into app/pages/index.vue in the knowledge-base order. Use live backend data via the existing module composables. Pass typecheck + lint.

Phase 3 — Projects: index + case study
Scope

app/pages/projects/index.vue — PageHero, FilterBar.vue (client filter by technology/category), ProjectGrid.vue (auto-fill, reveal), pagination via meta, empty/filtered-empty states.
app/pages/projects/[slug].vue — case study: CaseStudyHero, ProjectMeta (tags/stack/links), Overview/Process/Results, Gallery (from gallery[].media, lightbox via Dialog), NextProject nav.
Components in app/modules/projects/components/. SEO per project + CreativeWork/Article JSON-LD.
Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 3 — Projects. Build app/pages/projects/index.vue (PageHero, FilterBar client-side filter, ProjectGrid with reveal, pagination from meta, empty + filtered-empty states) and app/pages/projects/[slug].vue (CaseStudyHero, ProjectMeta, Overview/Process/Results, Gallery with Dialog lightbox from gallery[].media, NextProject). Read projects by slug, list paginated, live from backend. Per-page SEO + JSON-LD. All 4 states. Pass gates.

Phase 4 — Blog: index + post
Scope

Add fuse.js; client-side search composable in app/modules/blog/composables/.
app/pages/blog/index.vue — PageHero, FeaturedPost, PostGrid, tag filter, search, pagination.
app/pages/blog/[slug].vue — PostHero (cover, date, reading time via composable), ReadingProgress, PostBody (render content; if HTML sanitize, if markdown render + Shiki later), sticky TableOfContents, share buttons, RelatedPosts.
Components in app/modules/blog/components/. Article JSON-LD; reading-time util in shared/utils.
Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 4 — Blog. Add fuse.js for client-side search. Build app/pages/blog/index.vue (PageHero, FeaturedPost, PostGrid, tag filter, search, pagination) and app/pages/blog/[slug].vue (PostHero, ReadingProgress bar, PostBody content rendering, sticky TableOfContents from headings, share buttons, RelatedPosts). Reading-time util in shared/utils. Live backend data, Article JSON-LD, all 4 states. Pass typecheck + lint.

Phase 5 — About page
Scope (app/pages/about.vue + app/modules/resume/components/ for timeline)

PageHero (name/role/location), Bio (settings.about, story arc), Timeline (from resume experiences/educations, scroll-animated), Values, Skills (full, grouped), Stack, Availability.
Featured professional portrait here (PHOTO SWAP). Person JSON-LD.
Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 5 — About. Build app/pages/about.vue: PageHero, Bio (settings.about), scroll-animated Timeline from resume experiences/educations, Values, full grouped Skills, Stack, Availability, and a featured professional portrait (PHOTO SWAP). Use useResume/useSettings. Person JSON-LD, all 4 states. Pass gates.

Phase 6 — Resume page
Scope (app/pages/resume.vue + app/modules/resume/components/)

ResumePreview.vue live-rendered from useResume (experiences, educations, skill groups, certifications, links). Download action (resumeFileUrl/downloadUrl), copy-link, print stylesheet.
TimelineItem, SkillBadge reused/extended from Phase 5.
Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 6 — Resume. Build app/pages/resume.vue with ResumePreview live-rendered from useResume (all child arrays, pre-sorted by order), a Download action (resumeFileUrl/downloadUrl), copy-link, and a clean print stylesheet. All 4 states, pass typecheck + lint.

Phase 7 — Contact page + working form
Scope

app/pages/contact.vue — PageHero + availability, ContactOptions (email/social from settings), ContactForm (vee-validate + zod: name/email/subject/message), success/error/loading states.
server/api/contact.post.ts — zod validate + send via Resend (npm i resend), basic rate limit. Env: NUXT_RESEND_API_KEY, NUXT_CONTACT_TO. Fallback to mailto: if no key configured.
Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 7 — Contact. Build app/pages/contact.vue (PageHero + availability, ContactOptions from settings, ContactForm with vee-validate + zod and loading/success/error states) and a Nuxt server route server/api/contact.post.ts that zod-validates and sends via Resend (add resend), with a mailto: fallback when no API key is set. Document required env vars. Pass typecheck + lint.

Phase 8 — Polish, SEO, performance, launch readiness
Scope

Optional ⌘K CommandMenu (search projects/blog, navigate) via shadcn command.
Sitemap + robots, RSS /feed.xml, OG image generation, canonical URLs, all JSON-LD audited.
Page transitions (View Transitions), 404/500 polish.
Performance pass (LCP < 2.5s, CLS < 0.1, INP < 200ms): image sizing, lazy below-fold, effect cost.
Accessibility pass (WCAG AA): focus-visible, keyboard nav, skip link, aria, reduced-motion full sweep.
Final cross-page QA at 375/768/1024/1440.
Copy-paste prompt for a fresh session:

Read CLAUDE.md, DESIGN_SYSTEM.md, and the plan at C:\Users\mohamed.essamm\.claude\plans\i-wnat-to-start-zesty-origami.md. Execute Phase 8 — Polish, SEO, performance, launch. Add an optional ⌘K command palette, sitemap/robots/RSS/OG images, audit canonical URLs and JSON-LD, add View Transitions page transitions, polish 404/500, run a performance pass (Core Web Vitals targets) and a full accessibility pass (WCAG AA + reduced-motion sweep), and do final responsive QA across 375/768/1024/1440. Pass typecheck + lint.

Cross-phase verification
After each phase: npm run typecheck and npm run lint → zero errors; npm run dev and manually click through the new surface; confirm all 4 states; toggle OS reduced-motion and confirm animations degrade.
Integration: confirm each composable returns real data from the seeded backend at NUXT_PUBLIC_API_BASE; check the Network tab for { success, data } envelopes and correct transform/default handling.
Commit per phase with a Conventional Commit (e.g. feat(home): cinematic hero section).
Open follow-ups (not blocking)
Photo: swap the placeholder at every PHOTO SWAP marker once the real portrait is ready.
Resend env: provide NUXT_RESEND_API_KEY + NUXT_CONTACT_TO before Phase 7 go-live (mailto fallback until then).
Python (optional): install Python to enable the ui-ux-pro-max search.py generator; not required — its design data is readable directly.

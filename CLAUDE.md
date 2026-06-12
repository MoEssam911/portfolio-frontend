# Portfolio Frontend — Claude Code Context

## Read these files first, in order
1. PORTFOLIO_KNOWLEDGE_BASE.md
2. DESIGN_SYSTEM.md
3. ../portfolio-backend/BACKEND_STRUCTURE.md
4. CLAUDE_CODE_GUIDE.md (Prompt A section)

## Project names
- Frontend: portfolio-frontend (this project)
- Backend: portfolio-backend (../portfolio-backend/)
- Backend API base: from runtimeConfig.public.apiBase (env: NUXT_PUBLIC_API_BASE)

## Non-negotiable rules

### Dark mode
Dark only. :root IS the dark theme.
NEVER use dark: variant prefix anywhere.
NEVER add class="dark" to any element.

### Colors
Semantic Tailwind utilities only:
bg-background, bg-card, bg-muted, bg-accent, bg-primary,
text-foreground, text-muted-foreground, text-primary,
border-border, ring-ring
NEVER hardcode hex values in component files.

### Fonts
font-display → Bricolage Grotesque
font-sans    → Geist
font-mono    → Geist Mono
NEVER hardcode font-family in components.

### Data fetching
Always useFetch (non-blocking, no await).
Always transform: (res) => res.data to unwrap the { success, data } envelope.
Always provide a default: () => fallback value.

### Animations
import { animate, stagger } from 'motion'
Always check prefers-reduced-motion before running any animation.
Always await nextTick() before querying DOM in onMounted.

## Module architecture

Features live in app/modules/[feature]/:
  components/   — Vue components owned by this module
  composables/  — useFetch-based data composables
  types/        — TypeScript interfaces (index.ts)
  stores/       — Pinia store (only if module needs shared state)

Shared code (used by 2+ modules): app/shared/
  components/   — layout shell (AppHeader, AppFooter) under app/
  composables/  — global utilities (useFormatters, useConfirm, useToast, useNetwork, useSeo)
  types/        — cross-module types (api.ts: MediaItem, `ApiSuccess<T>`, `ApiPaginated<T>`, ApiError)
  utils/        — formatters, constants, validators

Infrastructure (API client, config): app/core/ (do not place features here)
shadcn-vue: app/components/ui/ — install on demand with `npx shadcn-vue@latest add [component]`
Global Pinia stores: app/stores/ (ui.ts). Module stores go in app/modules/[name]/stores/.

When adding a new module:
1. Create app/modules/[feature]/ with the folders it needs
2. Add its composables dir to nuxt.config.ts imports.dirs
3. Types are always explicitly imported (never auto-imported)

## Quality gates — required before any task is done
- npm run typecheck → zero errors
- npm run lint → zero errors
- All 4 states built: loading (skeleton), error, empty, populated

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
All public reads go through useApiFetch (app/shared/composables/useApiFetch.ts) —
the ONE read primitive. It is a thin useFetch wrapper that injects baseURL,
auto-unwraps the { success, data } envelope, applies a default, and wires
getCachedData for SWR. Do NOT hand-roll useFetch with config.public.apiBase +
manual .data unwrap in composables.
- Standard envelope: `useApiFetch<ApiSuccess<T>>(path, { key, default })` → data is T.
- Paginated (need meta): pass `transform: (res) => res` + widen the data generic to
  `ApiPaginated<T> | null`, and `getCachedData: undefined` for reactive page lists.
Writes (POST/PATCH/DELETE) are NOT done here — a separate authenticated `$admin`
client is introduced in the dashboard phase.

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

## Known exceptions

These two spots legitimately break the rules above. They are the ONLY sanctioned
violations — do not add more, and do not "fix" these.

1. **`dark:` variants in `app/components/ui/`** — shadcn-vue generates its
   components with `dark:` variant classes upstream. These files are vendored as-is
   from the CLI (`npx shadcn-vue@latest add ...`) and are not hand-authored. The
   `dark:` classes are inert here (there is no light theme / `.dark` toggle), so they
   have no effect. Do not hand-edit them to strip `dark:`; the next CLI update would
   reintroduce them. The "never use `dark:`" rule applies to OUR code, not vendored ui/.

2. **Hardcoded hex in `app/pages/resume.vue` print stylesheet** — the `@media print`
   block intentionally uses literal hex (e.g. `#18181b` ink on `#ffffff`) because
   printed/PDF resumes must be black-on-white regardless of the dark screen theme.
   Semantic dark tokens would render an unreadable/ink-heavy page. This is scoped to
   the print stylesheet only; the on-screen resume uses semantic tokens like everything else.

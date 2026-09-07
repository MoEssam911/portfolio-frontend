# Development Guide — Portfolio Frontend

Personal portfolio site. **Static Nuxt 4** — content from JSON, contact via Netlify Forms. No backend API, no dashboard, no blog.

## Non-negotiable rules

### Dark mode
Dark only. `:root` **is** the dark theme.
Never use the `dark:` variant prefix (except vendored `app/components/ui/`).
Never add `class="dark"` to any element.

### Colors
Semantic Tailwind utilities only:
`bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-primary`,
`text-foreground`, `text-muted-foreground`, `text-primary`,
`border-border`, `ring-ring`.
Never hardcode hex values in component files — add tokens in `app/assets/css/tokens.css`.

### Fonts
- `font-display` → Space Grotesk
- `font-sans` → Geist
- `font-mono` → Geist Mono

Never hardcode `font-family` in components.

### Data
Public content lives in `app/assets/data/*.json` and is imported by module composables.
No network reads for portfolio content. Do not reintroduce `useApiFetch` or an API base URL.

Contact form writes go through **Netlify Forms** (AJAX `POST /` with `form-name: contact`).

### Animations
```ts
import { animate, stagger } from 'motion'
```
Always check `prefers-reduced-motion` before running animation.
Always `await nextTick()` before querying the DOM in `onMounted`.

## Module architecture

Features live in `app/modules/[feature]/`:
- `components/` — Vue components owned by this module
- `composables/` — data access (static JSON imports)
- `types/` — TypeScript interfaces (`index.ts`, always explicit imports)

Shared code (used by 2+ modules): `app/shared/`
Infrastructure: `app/core/` (config, small utils — not features)
shadcn-vue: `app/components/ui/` — install on demand with `npx shadcn-vue@latest add [component]`

When adding a module composable dir, register it in `nuxt.config.ts` → `imports.dirs`.

## Quality gates

Before considering work done:
- `npm run typecheck` → zero errors
- `npm run lint` → zero errors

For static lists, empty and populated states still matter. Project slug 404 is a real error state.

## Known exceptions

1. **`dark:` in `app/components/ui/`** — vendored from shadcn-vue CLI. Leave as-is.
2. **Hardcoded hex in `app/pages/resume.vue` print stylesheet** — `@media print` must stay black-on-white for PDF/print. On-screen resume uses semantic tokens.

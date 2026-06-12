# Portfolio

A personal portfolio built with **Nuxt 4**, Vue 3 `<script setup>`, TypeScript (strict),
Tailwind v4 (CSS-first), and shadcn-vue + reka-ui. **English, LTR, dark-only.**

## Stack

- **Nuxt 4** (`srcDir: app/`) · Vue 3 · TypeScript strict
- **Tailwind v4** (CSS-first) with a token-driven, **dark-only** design system
- **shadcn-vue + reka-ui** primitives (in `app/components/ui/`, installed on demand)
- **Pinia** for state · **vee-validate + zod** for forms · **dayjs** for dates
- **@nuxt/icon** (lucide) · **@nuxt/image**

> Single dark theme — there is no light mode, no `.dark` class, and no `dark:`
> variants. The dark values live directly in `:root` in
> [app/assets/css/tokens.css](app/assets/css/tokens.css).

## Project structure

Modular architecture — each feature owns its components, composables, and types
under `app/modules/`. Shared code in `app/shared/`, infrastructure in `app/core/`.

```
app/
  assets/css/        tokens.css · base.css · utilities.css · main.css
  components/
    ui/              shadcn-vue primitives (installed on demand)
  modules/           one folder per feature domain
    settings/        composables/ · types/
    projects/        components/ · composables/ · types/
    blog/            components/ · composables/ · types/
    resume/          components/ · composables/ · types/
    services/        components/ · composables/ · types/
    testimonials/    components/ · composables/ · types/
    home/            components/ (page composition, no own data source)
  shared/            code used by 2+ modules
    components/app/   AppHeader, AppFooter, AppLogo …
    composables/      useFormatters, useConfirm, useToast, useNetwork, useSeo
    types/api.ts      MediaItem, ApiSuccess<T>, ApiPaginated<T>, ApiError
    utils/            formatters.ts · constants.ts · validators.ts
  core/              framework-level: api/ (client, useApi), config/, utils/
  pages/             file-routed pages
  stores/            global Pinia stores (ui.ts)
public/              static assets (favicon, robots.txt)
```

## Commands

```bash
npm install
npm run dev         # dev server
npm run build       # production build
npm run typecheck   # strict TS check
npm run lint        # eslint
npm run check       # typecheck + lint + format + spellcheck
```

## Conventions

- **Components** live in their module (`app/modules/[feature]/components/`); shared
  layout shell in `app/shared/components/`. Install shadcn-vue `ui/*` parts on demand.
- **Forms:** one pattern — zod schema → `toTypedSchema` → `useForm` → shadcn-vue form field.
- **Data:** fetch through `useApi()` (`get`/`post`/…); wrap non-trivial logic in a service.
- **Design tokens only** — never hardcode hex/rgba/arbitrary shadows; add a token instead.

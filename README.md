# Portfolio

Personal portfolio built with **Nuxt 4**, Vue 3 `<script setup>`, TypeScript (strict),
Tailwind v4 (CSS-first), and shadcn-vue + reka-ui. **English, LTR, dark-only.**

Static site: content from JSON under `app/assets/data/`, contact via **Netlify Forms**,
shipped with `nuxt generate`.

## Stack

- **Nuxt 4** (`srcDir: app/`) · Vue 3 · TypeScript strict
- **Tailwind v4** (CSS-first) with a token-driven, **dark-only** design system ("Terminal Lime")
- **shadcn-vue + reka-ui** primitives (in `app/components/ui/`, installed on demand)
- **Pinia** · **vee-validate + zod** · **dayjs**
- **@nuxt/icon** (lucide) · **@nuxt/image** · **motion** (animations)

> Single dark theme — no light mode, no `.dark` class, no `dark:` variants in app code.
> Tokens live in [app/assets/css/tokens.css](app/assets/css/tokens.css).

## Project structure

```
app/
  assets/
    css/             tokens.css · base.css · utilities.css · main.css
    data/            settings · projects · resume · services · testimonials (JSON)
  components/ui/     shadcn-vue primitives
  modules/           feature domains (projects, resume, services, testimonials, home, contact, settings)
  shared/            layout shell, shared composables & types
  core/              env config + small utils
  pages/             file-routed pages
public/              favicon, OG image, resume PDF, project images
server/              sitemap.xml · robots.txt · security headers
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for conventions and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for tokens.

## Commands

```bash
npm install
npm run dev         # dev server
npm run generate    # static site → .output/public
npm run typecheck
npm run lint
npm run check       # typecheck + lint + format + spellcheck
```

## Conventions

- **Components** live in their module; shared shell in `app/shared/components/`.
- **Forms:** zod schema → `toTypedSchema` → `useForm` → shadcn-vue form fields.
- **Data:** import JSON via module composables — no public API client.
- **Design tokens only** — never hardcode hex/rgba/arbitrary shadows in components.

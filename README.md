# Portfolio

Personal portfolio built with **Nuxt 4**, Vue 3 `<script setup>`, TypeScript (strict),
Tailwind v4 (CSS-first), and shadcn-vue + reka-ui. **English, LTR, dark-only.**

Static site: content from JSON under `app/assets/data/`, contact via **Netlify Forms**,
shipped with `nuxt generate`.

## Stack

- **Nuxt 4** (`srcDir: app/`) · Vue 3 · TypeScript strict
- **Tailwind v4** (CSS-first) with a token-driven, **dark-only** design system ("Terminal Lime")
- **shadcn-vue + reka-ui** primitives (in `app/components/ui/`, installed on demand)
- **vee-validate + zod** · **dayjs** · **motion** · **lenis**
- **@nuxt/icon** (lucide) · **@nuxt/image** · **@nuxt/fonts**

> Single dark theme — no light mode, no `.dark` class, no `dark:` variants in app code.
> Tokens live in [app/assets/css/tokens.css](app/assets/css/tokens.css).

## Project structure

```
app/
  assets/
    css/             tokens.css · base.css · utilities.css · main.css
    data/            settings · projects · resume (JSON)
  components/ui/     shadcn-vue primitives
  modules/           projects, resume, home, contact, settings
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

## Deploy (GitHub Actions → Netlify)

Deploys are driven by [`.github/workflows/ci.yml`](.github/workflows/ci.yml), not by Netlify Git builds.

| Branch | Job |
|--------|-----|
| PR / any push checks | `validate` (typecheck + lint) |
| Push to `develop` | validate → `npm run generate` → Netlify **dev** site (`--prod` on that site) |
| Push to `main` | validate → generate → Netlify **prod** site |

Merges into `develop` count as a push to `develop` and deploy automatically.

### One-time Netlify setup

1. Create **two sites** (or one if you only need staging): e.g. `portfolio-dev` and `portfolio-prod`.
2. Site configuration → **Build & deploy** → Continuous deployment:
   - Prefer **Disconnect** the Git provider, **or** leave linked but rely on `ignore = "exit 1"` in `netlify.toml` so Netlify never builds.
3. Site configuration → **General** → Site details → copy each **Site ID** (UUID).
4. User settings → **Applications** → Personal access tokens → create `github-actions-deploy`.
5. Enable **Forms** on each site (Forms → enable; first deploy with the `contact` form registers it).
6. Optional: Site configuration → **Domain management** → add your custom domains.

### One-time GitHub setup

Repo → **Settings** → **Secrets and variables** → **Actions**:

**Secrets**

| Name | Value |
|------|--------|
| `NETLIFY_AUTH_TOKEN` | Personal access token from Netlify |
| `NETLIFY_SITE_ID_DEV` | Site ID for the develop / staging site |
| `NETLIFY_SITE_ID_PROD` | Site ID for the production site |

**Variables** (public URLs, no trailing slash)

| Name | Example |
|------|---------|
| `NUXT_PUBLIC_SITE_URL_DEV` | `https://your-dev-site.netlify.app` |
| `NUXT_PUBLIC_SITE_URL_PROD` | `https://yourdomain.com` |

Optional: later add GitHub Environments (`development` / `production`) if you want approval gates.

### Verify

After pushing to `develop`, open the Actions run → Deploy should succeed. In Netlify → Deploys, the deploy method should show **API** / CLI, not Git.

## Conventions

- **Components** live in their module; shared shell in `app/shared/components/`.
- **Forms:** zod schema → `toTypedSchema` → `useForm` → shadcn-vue form fields.
- **Data:** import JSON via module composables — no public API client.
- **Design tokens only** — never hardcode hex/rgba/arbitrary shadows in components.

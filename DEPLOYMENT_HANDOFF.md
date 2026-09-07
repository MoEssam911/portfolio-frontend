# Deployment — Static Portfolio (Netlify)

Static Nuxt site. Build with `nuxt generate`, publish `.output/public`. Contact uses **Netlify Forms**.

## Build

| Item | Value |
| --- | --- |
| Command | `npm run generate` |
| Publish directory | `.output/public` |
| Preset | `NITRO_PRESET=netlify` (see `netlify.toml` and CI) |

Env vars (optional):

```bash
NUXT_PUBLIC_APP_NAME=Portfolio
NUXT_PUBLIC_APP_ENV=production
```

No API base URL. No backend secrets.

## Environments

Typical setup:

- `develop` branch → Netlify develop site
- `main` branch → Netlify production site

CI (`.github/workflows/ci.yml`) runs typecheck + lint on every push/PR, and deploys with
`npm run generate` when pushing to `main` or `develop` (requires Netlify secrets).

## Netlify secrets (GitHub Actions)

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID_DEV` (develop)
- `NETLIFY_SITE_ID_PROD` (main)

## Contact form

The layout includes a hidden `netlify` form named `contact`. The Vue form posts
`application/x-www-form-urlencoded` to `/`. Submissions appear in the Netlify Forms UI
after the site is deployed on Netlify. Local `npm run dev` cannot deliver mail.

## Checklist after first deploy

- [ ] Homepage and project case studies prerender
- [ ] `/sitemap.xml` and `/robots.txt` respond
- [ ] Contact form appears under Netlify → Forms
- [ ] Resume PDF downloads from `/mohamed-essam-cv.pdf`

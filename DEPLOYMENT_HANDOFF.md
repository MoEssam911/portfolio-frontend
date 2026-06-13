# Deployment Handoff — Portfolio (Frontend on Netlify, Backend on Render)

This is your single source of truth for going live. It records **what I already did in code**
and the **exact, ordered manual steps you must do yourself** when your credit card is ready.

> **Status:** the codebase is **fully deploy-ready**. Deployment is intentionally **postponed**
> until you have a credit card (Render's compute services require one). Nothing below requires
> any further code changes.

## Architecture at a glance

- **Two environments**, driven by branches:
  - `develop` branch → **develop** environment (your live testing site)
  - `main` branch → **prod** environment (the real public site)
- **Frontend:** Nuxt 4 → **Netlify** (two sites). Deployed by **GitHub Actions** (not Netlify's
  own Git build) via the Netlify CLI.
- **Backend:** NestJS 11 + Prisma → **Render** (two Docker Web Services). Deployed by GitHub
  Actions triggering a Render **deploy hook** after CI passes.
- **Database:** **Neon** (free Postgres, no credit card) — one project per environment.
- **File storage:** **Cloudinary** (free, no credit card) — folders `portfolio/develop` and
  `portfolio/prod`.
- **CI is the gate:** every push runs typecheck/lint/build; only a passing run deploys.

```
 develop branch ──push──> GitHub Actions (CI) ──pass──> Render develop  + Netlify develop site
 main    branch ──push──> GitHub Actions (CI) ──pass──> Render prod     + Netlify prod site
```

---

# Part 1 — What I already did (code, committed)

## Backend (`portfolio-backend`) — done previously (B1–B4)
- **Health endpoint** `GET /api/v1/health` (`src/health/*`) — used by Render's health check.
- **`.env.example`** documenting every required variable.
- **`src/main.ts`** binds to `0.0.0.0` + injected `PORT` and trusts the proxy (for Render).
- **Storage migrated Supabase → Cloudinary**: `src/config/storage.config.ts`,
  `MediaService` now uses the Cloudinary SDK (`key` = `public_id`, `url` = `secure_url`);
  `@supabase/supabase-js` removed, `cloudinary` added. No API response shapes changed.
- **Docker**: multi-stage `Dockerfile`, `.dockerignore`, `docker-compose.yml`, and a beginner
  `DOCKER_NOTES.md`. The container runs `prisma migrate deploy` then boots — so the first deploy
  auto-creates the DB schema.
- **CI**: `.github/workflows/ci.yml` — a `validate` job (lint + build) and a `deploy` job that
  curls a Render deploy hook chosen by branch.
- ✅ Verified: `npm run build` compiles cleanly.

## Frontend (`portfolio-frontend`) — done this session (F1)
- **Fixed the CI build preset bug** in `.github/workflows/ci.yml`: added `NITRO_PRESET=netlify`
  to the Build step. `netlify.toml`'s `[build.environment]` only applies to Netlify's own builds,
  **not** the GitHub Actions runner — so without this, `nuxt build` in CI produced `.output/`
  instead of the `dist/` + `.netlify/functions-internal/` that the deploy step uploads. This was
  the reason a CI deploy would have failed/served nothing.
- **Confirmed the API base is runtime-configurable**: every data call reads
  `useRuntimeConfig().public.apiBase`, so setting `NUXT_PUBLIC_API_BASE` as a per-site Netlify env
  var works for both server-render and client. ⚠️ The value **must include the `/api/v1` path**
  (the composables call `${apiBase}/projects`, `${apiBase}/blogs`, …).
- ✅ Verified: `npm run lint` (0 errors) and `npm run typecheck` (0 errors).

> **Note on pushing:** I committed these changes on `develop` but did **not** push. Pushing the
> frontend will trigger its CI deploy step, which will fail until the Netlify secrets exist
> (Part 2, step F2). Push only after you've added those secrets — or push now and ignore the one
> expected deploy failure; CI's `validate` job will still pass.

---

# Part 2 — What YOU do manually (in order, when your card is ready)

Work **develop first**, verify it end-to-end, then repeat for **prod**. Keep a private notes file
(NOT in any git repo) and paste every URL / key / ID into it as you go.

## Step 0 — Accounts & prerequisites

> Neon and Cloudinary need **no credit card** — you can do 0c–0f anytime. Only Render (Step B5)
> needs the card.

**0a. Create accounts**
1. **Render** — https://render.com → *Get Started* → **Sign in with GitHub** (approve access so it
   can read your repos). *(Adding a payment method is required before you can create a Web Service.)*
2. **Neon** — https://neon.tech → *Sign up* (GitHub login is fine). No card.
3. **Cloudinary** — https://cloudinary.com → *Sign up for free*. No card.
4. **Netlify** — log in; confirm your two existing sites and note which is **develop** vs **prod**.

**0b. (Optional) Docker Desktop** — only to test the image on your laptop. Render builds it in the
cloud regardless, so you can skip this.

**0c. Create the backend `develop` branch** (if not already done):
```powershell
cd "c:\Users\mohamed.essamm\Desktop\Mohamed Essam\portfolio-backend"
git checkout main; git pull
git checkout -b develop
git push -u origin develop
```

**0d. Default branch + protect `main`** — for **each** repo on GitHub → *Settings → Branches*:
1. Set the **default branch** to `develop`.
2. *Branch protection rules → Add rule* → branch `main` → enable **Require a pull request before
   merging** and **Require status checks to pass before merging** (pick the CI check after it has
   run once). Save.

**0e. Neon — two projects (one per env)** — do this twice:
1. Neon console → **New Project** → name `portfolio-develop` (then `portfolio-prod`); pick a region.
2. Copy **both** connection strings from the dashboard:
   - **Pooled** connection string → save as `DATABASE_URL`.
   - **Direct / unpooled** connection string → save as `DIRECT_URL` (Prisma migrations need this).
3. Label them `DEVELOP DATABASE_URL` / `DEVELOP DIRECT_URL`, then `PROD …`.

**0f. Cloudinary — one account**
1. On the **Dashboard**, copy **Cloud name**, **API Key**, **API Secret** → save as
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
2. No folders to pre-create — environments are separated by the `CLOUDINARY_FOLDER` variable
   (`portfolio/develop` vs `portfolio/prod`).

**0g. Generate a fresh JWT secret per environment** (don't reuse your local dev secret):
```powershell
# Pure PowerShell (no extra tools):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```
Run it twice; label `DEVELOP JWT_SECRET` / `PROD JWT_SECRET`.

---

## Step B5 — Render backend (needs the credit card)

### B5a. Create the Render Web Service (do this twice: develop, then prod)
1. Render dashboard → **New +** → **Web Service**.
2. **Connect a repository** → choose `portfolio-api`. (Click *Configure account* if it's not listed
   and grant Render access to that repo.)
3. Render detects the `Dockerfile` → **Runtime: Docker**.
4. **Name:** `portfolio-api-develop` (first) / `portfolio-api-prod` (second).
5. **Branch:** `develop` (first) / `main` (second).
6. **Region:** the same as / nearest your Neon region.
7. **Instance type:** **Free** is fine for develop; for prod you can upgrade later to avoid
   cold-start sleeps.
8. **Advanced → Auto-Deploy: No** (GitHub Actions controls deploys via the hook).
9. **Health Check Path:** `/api/v1/health`.
10. Click **Create Web Service**. The first build may fail until env vars are set — that's expected;
    set them next.

### B5b. Add environment variables (Render service → Environment)
Use **this env's** Neon values; Cloudinary creds are identical for both, only `CLOUDINARY_FOLDER`
differs. **Do NOT set `PORT`** — Render injects it and the app reads it.
```
NODE_ENV=production
DATABASE_URL=<this env's Neon POOLED string>
DIRECT_URL=<this env's Neon DIRECT/unpooled string>
JWT_SECRET=<this env's fresh secret from 0g>
JWT_EXPIRES_IN=15d
CLOUDINARY_CLOUD_NAME=<from Cloudinary>
CLOUDINARY_API_KEY=<from Cloudinary>
CLOUDINARY_API_SECRET=<from Cloudinary>
CLOUDINARY_FOLDER=portfolio/develop          # prod service: portfolio/prod
ALLOWED_ORIGINS=<your Netlify DEVELOP site URL>   # prod service: your prod site URL(s)
RESEND_API_KEY=<real key on a verified domain; develop may be left blank>
MAIL_FROM=Portfolio Contact <noreply@yourdomain>
CONTACT_TO=mohameddessam303@gmail.com
```
After saving, click **Manual Deploy → Deploy latest commit**.

### B5c. Copy the deploy hook
Service → **Settings → Deploy Hook** → copy the URL. Save as `DEVELOP deploy hook` / `PROD deploy hook`.

### B5d. Add the deploy-hook secrets to GitHub
Backend repo → *Settings → Secrets and variables → Actions → New repository secret*:
- `RENDER_DEPLOY_HOOK_DEV` = develop service hook URL
- `RENDER_DEPLOY_HOOK_PROD` = prod service hook URL

### B5e. Seed the database (once per environment)
The container runs `prisma migrate deploy` on boot, so the schema is created automatically on the
first deploy. To add your content/owner user, run the seed locally pointing at that env's DB:
```powershell
cd "c:\Users\mohamed.essamm\Desktop\Mohamed Essam\portfolio-backend"
$env:DATABASE_URL="<that env's POOLED url>"
$env:DIRECT_URL="<that env's DIRECT url>"
$env:SEED_EMAIL="admin@portfolio.com"; $env:SEED_USERNAME="mohamed"; $env:SEED_PASSWORD="<strong-unique-password>"
npm run seed
npm run seed-portfolio
```
Then close that terminal so the env vars don't linger. Use a **strong, unique** `SEED_PASSWORD`
for prod.

### B5f. Verify, then repeat for prod
- Push a small commit to `develop` → GitHub **Actions** goes green → Render shows a deploy →
  open `https://portfolio-api-develop.onrender.com/api/v1/health` → expect `{ "status": "ok", ... }`.
- Redo B5a–B5e for the **prod** service (branch `main`, prod Neon values,
  `CLOUDINARY_FOLDER=portfolio/prod`), then merge `develop` → `main` to deploy prod.

---

## Step F2 — Netlify frontend + GitHub secrets (no card needed)

### F2a. For EACH Netlify site (develop, then prod)
1. *Site configuration → General → Site details* → copy the **Site ID** (API ID). Save as
   `DEVELOP site id` / `PROD site id`.
2. *Build & deploy → Continuous deployment* → ensure Netlify is **NOT** auto-building from Git
   (unlink the repo or set the build to manual). **GitHub Actions is the only deployer** — leaving
   Netlify's Git build on causes double, conflicting deploys.
3. *Environment variables → Add a variable*:
   - `NUXT_PUBLIC_API_BASE`
     - develop site → `https://portfolio-api-develop.onrender.com/api/v1`
     - prod site → `https://portfolio-api-prod.onrender.com/api/v1`
     - ⚠️ include the `/api/v1` suffix.
   - `NUXT_PUBLIC_APP_ENV` → `develop` / `production`
   - `NUXT_PUBLIC_APP_NAME` → `Portfolio`

### F2b. Create a Netlify access token
Avatar → *User settings → Applications → Personal access tokens → New access token* → name it
`github-actions-deploy` → copy it once (you can't view it again) and save it.

### F2c. Add the GitHub secrets (frontend repo)
*Settings → Secrets and variables → Actions → New repository secret*:
- `NETLIFY_AUTH_TOKEN` = the token from F2b
- `NETLIFY_SITE_ID_DEV` = develop site ID
- `NETLIFY_SITE_ID_PROD` = prod site ID

### F2d. CORS link-up
Back in **Render** → each service → **Environment** → confirm `ALLOWED_ORIGINS` contains the
matching Netlify site's domain (develop API ← develop site; prod API ← prod site). Save and
**Manual Deploy** if you changed it.

---

## Step G — Go-live verification & ongoing workflow

**Smoke test (develop first, then prod):**
1. Push to `develop` → backend CI green → Render develop deploys → `/api/v1/health` ok; frontend
   CI green → Netlify develop site deploys.
2. Open the develop site: in the browser **Network tab**, confirm requests hit
   `portfolio-api-develop.onrender.com/api/v1` (not `localhost`). Upload an image in the admin and
   confirm it appears in Cloudinary `portfolio/develop` and renders. Try the contact form.
3. Merge `develop` → `main` → prod backend + prod frontend deploy against the **prod** Neon DB and
   **prod** Cloudinary folder.
4. Confirm: no CORS errors in the console; Swagger is OFF in prod (`/api/docs` returns 404);
   security headers (helmet) present.

**Day-to-day from here on:**
- New work: branch off `develop` → PR into `develop` → it auto-deploys to develop → test live.
- Release: PR `develop` → `main` → it auto-deploys to production.
- DB schema change: create the Prisma migration locally and commit it; `prisma migrate deploy`
  applies it automatically on each environment's next deploy.
- Never commit `.env`. Manage all secrets only in the Render / Netlify / GitHub dashboards.
- ⚠️ Treat the secrets in your local `portfolio-backend/.env` as **dev-only**. Use the fresh
  per-environment secrets you generated for staging/prod.

**Optional hardening (later):** custom domains + HTTPS on Netlify/Render; a paid Render instance
for prod to avoid cold starts; uptime ping to `/api/v1/health`; error tracking (e.g. Sentry).

---

## Quick reference — all secrets/vars

| Where | Name | Value |
|---|---|---|
| GitHub (backend) | `RENDER_DEPLOY_HOOK_DEV` | Render develop service deploy hook URL |
| GitHub (backend) | `RENDER_DEPLOY_HOOK_PROD` | Render prod service deploy hook URL |
| GitHub (frontend) | `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| GitHub (frontend) | `NETLIFY_SITE_ID_DEV` | Netlify develop site ID |
| GitHub (frontend) | `NETLIFY_SITE_ID_PROD` | Netlify prod site ID |
| Render (each service) | env vars | see B5b |
| Netlify (each site) | `NUXT_PUBLIC_API_BASE` (+ APP_ENV, APP_NAME) | see F2a |

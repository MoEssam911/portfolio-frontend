# AUDIT.md — Phase 0: API layer standardization & tech-debt cleanup

> Living document. Records the clean baseline established before the admin-dashboard
> build, and the conventions every later phase must follow. Update it as the dashboard
> phases (BFF, `$admin` write client, auth) land.
>
> **Status:** Phase 0 complete. No dashboard features built yet.

---

## 1. Why this phase existed

Before building the dashboard we had **three overlapping ways** to talk to the API:

- `app/core/api/client.ts` — a `$fetch.create` transport with `auth_at`/`auth_rt`
  cookie injection and silent 401 refresh.
- `app/core/api/useApi.ts` — a `.get`/`.post`/… wrapper that re-implemented
  `useAsyncData` on top of that client.
- The module composables — which ignored both and called Nuxt's `useFetch` directly,
  each repeating `const apiBase = config.public.apiBase` + a manual `.data` unwrap.

Only the third was actually used by the site. The first two were dead code that also
**conflicted with the planned dashboard auth model** (httpOnly cookies set by a Nuxt
BFF, not client-readable `auth_at` cookies). This phase collapses everything to a
single, well-typed read primitive and deletes the conflicting transport.

---

## 2. New API conventions (the single source of truth)

**Reads → `useApiFetch`** (`app/shared/composables/useApiFetch.ts`)

The ONE read primitive for the whole app. A thin wrapper over `useFetch` that:

- injects `baseURL` from `runtimeConfig.public.apiBase`;
- auto-unwraps the `{ success, data }` envelope via a default `transform`;
- applies a `default` (caller-provided; nullability carried by the `DataT` generic);
- wires `getCachedData` for SWR hydration (SSR payload + prerendered static data).

Usage:

```ts
// Standard envelope → data is the inner T
const { data } = useApiFetch<ApiSuccess<Service[]>>('/services', {
  key: 'services-list',
  default: () => [],
})

// Paginated, need meta → identity transform, widen generic, opt out of SWR cache
const { data } = useApiFetch<ApiPaginated<Project>, ApiPaginated<Project> | null>(
  '/projects',
  { key: 'projects-page', query: { page, limit }, transform: (res) => res,
    getCachedData: undefined, default: () => null },
)
```

**Writes → `$admin` (future).** POST/PATCH/DELETE do NOT go through `useApiFetch`.
A separate authenticated client (`$admin`) will be added in the dashboard phase and
will route through a Nuxt server-side BFF that holds the httpOnly auth cookies. Read
vs write are intentionally split.

**Error normalization → `app/core/api/errors.ts`.** Transport-agnostic helpers
(`normalizeError`, `extractErrorMessage`, `isApiError`) plus the normalized client-side
`ApiError` type (`{ status, message, errors }`). Both reads and the future `$admin`
writes can funnel caught errors through `normalizeError` for consistent UI handling.

> Two `ApiError` types exist deliberately and are NOT the same:
> - `~/core/api/errors.ts` → the **normalized client error** the UI consumes.
> - `~/shared/types/api.ts` → the **raw backend wire shape** (`success:false`, `statusCode`, …).

---

## 3. What changed

### Added

- `app/shared/composables/useApiFetch.ts` — the read primitive (documented at the top).
- `app/core/api/errors.ts` — moved error helpers + normalized `ApiError` type.
- `AUDIT.md` (this file).
- `.env.example` / `.env.development` — reserved server-only BFF var
  `NUXT_API_INTERNAL_BASE` (commented placeholder, no secrets).
- `CLAUDE.md` — new "Known exceptions" section + updated "Data fetching" rule.

### Removed

- `app/core/api/client.ts` — `$fetch.create` transport with `auth_at`/`auth_rt` cookie
  logic and silent 401 refresh. **Conflicts with the httpOnly BFF** auth model and was
  unused by the site. Error helpers it held were moved to `errors.ts`.
- `app/core/api/useApi.ts` — `.get` re-implemented `useAsyncData`; unused. Reads are
  `useApiFetch`; writes will be `$admin`.
- `app/core/api/types.ts` — `ApiError` moved to `errors.ts`; `QueryOptions`,
  `MutationOptions`, `QueryResult`, `MutationResult`, `ApiResponse` were orphaned by
  the deletions above and removed.
- `motion-v` dependency + `'motion-v/nuxt'` from `nuxt.config.ts` modules. It was only
  pulled in for its auto-imported `useReducedMotion()`. No `<Motion>`/`<AnimatePresence>`
  components exist in the codebase.

### Changed

- **All public read composables migrated to `useApiFetch`** — identical return shapes,
  keys, SSR hydration, and derivations; only the `apiBase`/`.data` boilerplate is gone:
  `useSettings`, `useResume`, `useServices`, `useTestimonials`, `useProject`, `usePost`,
  `useProjects` (+ `featuredProjects`), `useProjectsList`, `useBlog`, `useBlogList`.
  (`useBlogSearch` and `usePostContent` do no fetching — untouched.)
- **`useReducedMotion()` → `@vueuse/core`'s `usePreferredReducedMotion()`** in
  `useHero.ts`, `useScrollReveal.ts`, `AuroraBackground.vue`, `TableOfContents.vue`.
  vueuse returns `'reduce' | 'no-preference'` (SSR-safe), so the boolean checks were
  adapted (`=== 'reduce'` / `=== 'no-preference'`). `motion` (vanilla) is KEPT — it
  drives the animation composables.
- `app/plugins/persistedstate.ts` — `nuxtApp.$pinia as any` → `as Pinia`
  (typed import from `pinia`). The last lint warning is gone.
- `app/core/utils/error-logger.ts` — `ApiError` import repointed to `~/core/api/errors`.

---

## 4. What was intentionally KEPT

- `motion` (vanilla) — used by `useHero`/`useScrollReveal` for `animate`/`stagger`.
- `app/core/utils/request-id.ts` — small, reusable, no transport coupling.
- The `{ success, data, meta }` backend envelope and `ApiSuccess`/`ApiPaginated`/
  `PaginationMeta` types in `~/shared/types/api.ts` — they match the backend contract.
- The two documented rule exceptions (vendored shadcn `dark:` classes, resume print
  hex) — see CLAUDE.md "Known exceptions".

---

## 5. Backend gaps to address in later phases

Tracked here so the dashboard build accounts for them:

- **Media delete is not reference-safe.** Deleting a media item does not check whether
  it is still referenced (project thumbnail/gallery, blog cover, testimonial avatar).
  Needs a reference check (or soft-delete) before the dashboard exposes media deletion.
- **Testimonial `avatarId` ownership is not validated.** A testimonial can point at a
  media item it does not own; the write path must validate ownership before the
  dashboard allows setting avatars.
- **Contact has no dashboard GET endpoint.** Contact submissions are sent via the Nuxt
  server route + Resend; there is no backend endpoint to LIST/READ submissions for a
  dashboard inbox view. Needs a persisted store + `GET` endpoint.

---

## 6. Verification (Phase 0 exit criteria)

- `npm run typecheck` → zero errors.
- `npm run lint` → zero errors/warnings.
- Public pages render with all 4 states (loading/error/empty/populated) unchanged —
  return shapes of every migrated composable are identical to before.

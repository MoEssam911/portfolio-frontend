# Design System — Portfolio

**Direction:** "Precision" — Violet (`#8B5CF6`) on a deep cool-neutral dark base.
**Theme:** Dark-only. `:root` **is** the dark theme. There is **no light mode**, no
`.dark` class, and no `dark:` variants anywhere.

**Stack:** Tailwind CSS **v4** (`@theme`-driven), shadcn-vue (reka-ui), `@nuxt/fonts`.

---

## File map (`app/assets/css/`)

| File | Responsibility |
| --- | --- |
| `main.css` | Entry. Wires imports + `@source`. Nothing else. |
| `tokens.css` | **Single source of truth.** LAYER 1 primitives + LAYER 2 `@theme` + chrome/z/motion/gradient vars. |
| `base.css` | `@layer base` — resets, `html`/`body`, heading defaults. |
| `typography.css` | `@layer base` — `.prose`, code/`kbd`, `.label`, `::selection`. |
| `utilities.css` | `@layer utilities` — app helpers (`.card-surface`, `.touch-target`, gradients). |

---

## Token architecture — two layers

```
LAYER 1  Primitive palette   →  raw hex / rgba. The ONLY place literal color lives.
LAYER 2  @theme semantic      →  every value is var(--primitive). Generates the
                                 Tailwind utilities components consume.
```

**To re-theme the whole app, edit LAYER 1 values only.** Never hardcode a hex, rgba,
or arbitrary shadow in a component — add or reuse a token in `tokens.css` instead.

### Rules

- **Components use semantic utilities only:** `bg-background`, `text-foreground`,
  `bg-card`, `bg-muted`, `text-muted-foreground`, `border-border`, `bg-primary`,
  `text-destructive`, `bg-success-muted`, etc.
- **Brand violet = `primary`** (`bg-primary`, `text-primary`, `ring-ring`). Use it
  **sparingly** — it's the signature color. Full `primary-50…900` scale exists for
  gradients/charts. Violet washes for tinted backgrounds: `bg-primary-subtle`
  (6%), `-muted` (10%), `-wash` (14%), `border-primary-border` (20%).
- **`accent` and `secondary` are neutral surfaces** (shadcn convention), **not** the
  brand color. `accent` = interactive hover bg; `secondary` = elevated surface.
- **Status colors** never use violet: `success`, `warning`, `destructive`, `info` —
  each has a base, `-foreground`, `-muted` (soft bg), `-muted-foreground` (ink on dark).

---

## Typography

- **Display / headings:** `font-display` → **Bricolage Grotesque** (weights 400/600/700).
- **Body / UI:** `font-sans` → **Geist** (300/400/500/600).
- **Code:** `font-mono` → **Geist Mono** (400/500).
- Fonts are self-hosted via `@nuxt/fonts` (configured in `nuxt.config.ts`, `display: swap`).
  Family **tokens** live in `tokens.css`; never hardcode font names.
- **Never use font-weight > 700** — heavier rarely renders refined at screen size.

### Type scale

- **UI text is fixed** (`text-xs`…`text-2xl`) for crispness.
- **Display tiers are fluid** `clamp()` (`text-3xl`…`text-7xl`) — scale smoothly
  mobile→desktop with tightened tracking baked in. Use these for hero/section titles.
- Semantic admin sizes (`text-h1/h2/h3`, `text-display`, `text-label`, `text-caption`)
  are kept for the holdover `Base*` components.
- `tracking-*` and `leading-*` scales exist — tight tracking on large display is
  essential to the precision feel; never track body text.

---

## Motion

Pair every duration with a matching easing. Tokens in `tokens.css`:
`--duration-fast|normal|slow|slower|cinematic`, `--ease-out|in-out|spring|cinematic`,
`--stagger-fast|normal|slow`. Easings also generate utilities (`ease-out`, `ease-spring`).

---

## Other tokens

- **Radius:** `rounded-sm…rounded-3xl` + `rounded-full`. shadcn reads bare `--radius`.
- **Shadows:** elevation via dark shadow (`shadow-sm…xl`, `shadow-modal`). Violet glow
  (`--shadow-glow`, `--shadow-cta`) reserved for primary CTAs / focused key elements only.
- **Z-index:** named scale in `tokens.css` (`--z-dropdown` … `--z-toast`) — no magic numbers.
- **Gradients:** `--gradient-hero|card-glow|mesh|fade-bottom`. All intentionally subtle —
  this is not a neon portfolio.

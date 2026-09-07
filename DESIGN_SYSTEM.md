# Design System — Portfolio

**Direction:** "Terminal Lime" — neon lime (`#C6F432`) on a cool near-black base, with glass surfaces and soft neon glow.
**Theme:** Dark-only. `:root` **is** the dark theme. There is **no light mode**, no
`.dark` class, and no `dark:` variants anywhere (except vendored `app/components/ui/`).

**Stack:** Tailwind CSS **v4** (`@theme`-driven), shadcn-vue (reka-ui), `@nuxt/fonts`.

---

## File map (`app/assets/css/`)

| File | Responsibility |
| --- | --- |
| `main.css` | Entry. Wires imports + `@source`. Nothing else. |
| `tokens.css` | **Single source of truth.** LAYER 1 primitives + LAYER 2 `@theme` + chrome/z/motion/gradient/glass vars. |
| `base.css` | `@layer base` — resets, `html`/`body`, heading defaults. |
| `typography.css` | `@layer base` — `.prose`, code/`kbd`, `.label`, `::selection`. |
| `utilities.css` | `@layer utilities` — `.glass-surface`, `.neon-glow`, `.text-gradient`, touch targets, glows. |

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
- **Brand lime = `primary`** (`bg-primary`, `text-primary`, `ring-ring`). Use it
  **sparingly** — signature accent, not body text. Lime CTA buttons use **dark** ink
  (`text-primary-foreground`). Accent text on dark prefers `text-primary-light` / foreground.
  Lime washes: `bg-primary-subtle`, `-muted`, `-wash`, `border-primary-border`.
- **`accent` and `secondary` are neutral surfaces** (shadcn convention), **not** the
  brand color.
- **Status colors** never use lime: `success`, `warning`, `destructive`, `info`.

### Glass + neon

Primitives in `tokens.css` (`--glass-*`, `--shadow-neon`). Prefer utilities:

- `.glass-surface` / `.glass-surface-strong` — frosted panels
- `.neon-glow` — lime hover halo
- `.text-gradient` — mono-hue lime signature gradient on short display phrases
- `.page-grain` — subtle noise overlay

---

## Typography

- **Display / headings:** `font-display` → **Space Grotesk** (weights 400/500/600/700).
- **Body / UI:** `font-sans` → **Geist** (300/400/500/600).
- **Code:** `font-mono` → **Geist Mono** (400/500).
- Fonts via `@nuxt/fonts` (`nuxt.config.ts`, `display: swap`). Family tokens in `tokens.css`.
- **Never use font-weight > 700.**

### Type scale

- **UI text is fixed** (`text-xs`…`text-2xl`).
- **Display tiers are fluid** `clamp()` (`text-3xl`…`text-7xl`) for hero/section titles.
- Tight tracking on large display; never track body text.

---

## Motion

Pair every duration with a matching easing. Tokens in `tokens.css`:
`--duration-fast|normal|slow|slower|cinematic`, `--ease-out|in-out|spring|cinematic`,
`--stagger-fast|normal|slow`.

Gate animations on `prefers-reduced-motion`. Prefer `transform` / `opacity` over layout properties.

---

## Other tokens

- **Radius:** `rounded-sm`…`rounded-3xl` + `rounded-full`.
- **Shadows:** elevation via dark shadow; neon glow (`--shadow-glow`, `--shadow-neon`) for primary CTAs / focus.
- **Z-index:** named scale in `tokens.css` (`--z-dropdown` … `--z-toast`).
- **Gradients:** `--gradient-hero|card-glow|mesh|fade-bottom|signature` — lime blooms on near-black.

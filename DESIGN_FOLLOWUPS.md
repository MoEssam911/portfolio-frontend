# Design follow-ups (after cleanup)

Trivial cleanup done: violet leftovers removed, broken project thumbnail URLs
nulled until real assets live under `public/images/projects/`.

## Still to verify visually

- [ ] Responsive at 375 / 768 / 1024 / 1440 — no horizontal scroll
- [ ] Touch targets ≥ 44px on nav, filters, CTAs
- [ ] Lime-on-dark contrast (body text never lime; CTAs use dark ink)
- [ ] `prefers-reduced-motion` — typewriter, marquees, parallax, reveals
- [ ] Case study gallery / lightbox with real screenshots
- [ ] Contact success state on Netlify deploy
- [ ] OG image (`public/og-image.svg`) and SEO meta on all routes
- [ ] `@nuxt/image` / WebP for project shots once added

Do not reintroduce 3D / WebGL / TresJS.

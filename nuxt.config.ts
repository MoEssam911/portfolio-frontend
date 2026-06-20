import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app/',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css', 'vue-sonner/style.css'],

  components: [
    // extensions:['vue'] keeps the scanner from registering module types/composables
    // (.ts) as components — only .vue files become auto-imported components.
    { path: '~/components', pathPrefix: false, extensions: ['vue'] }, // shadcn-vue ui/
    { path: '~/shared/components', pathPrefix: false, extensions: ['vue'] }, // AppHeader, etc.
    { path: '~/modules', pathPrefix: false, extensions: ['vue'] }, // all module components
  ],

  imports: {
    dirs: [
      'shared/composables',
      'modules/settings/composables',
      'modules/projects/composables',
      'modules/blog/composables',
      'modules/resume/composables',
      'modules/services/composables',
      'modules/testimonials/composables',
      'modules/dashboard/composables',
      'modules/dashboard/stores', // keeps useAuthStore auto-imported
      'stores', // keeps useUiStore auto-imported
      'core/utils', // keeps core/utils helpers auto-imported
      // Add new module composable dirs here as modules are created
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: [
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
  ],

  // Self-hosted Google fonts (downloaded at build, served locally). Matches the
  // family tokens in app/assets/css/tokens.css. display:swap avoids invisible text.
  fonts: {
    families: [
      { name: 'Bricolage Grotesque', provider: 'google', weights: [400, 600, 700] },
      { name: 'Geist', provider: 'google', weights: [300, 400, 500, 600] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] },
    ],
    defaults: {
      styles: ['normal'],
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  // ── Rendering & caching (Phase 10) ──────────────────────────────────────────
  // Public content pages are universal-SSR + edge SWR so dashboard edits surface
  // within the TTL while serving instantly from cache. The dashboard is a private,
  // client-only SPA section that is never SSR'd and never cached. BFF endpoints
  // carry per-session data and must never be cached anywhere.
  //
  // NOTE: the build plan suggested `'/' : { prerender: true }`. We use `swr`
  // instead — prerender freezes the home hero/settings at build time, which would
  // stop dashboard Settings edits from ever appearing without a redeploy. SWR keeps
  // the page dynamic (reflects edits within the window) while still caching. TTLs
  // are conservative; tune against the running backend if revalidation feels slow.
  routeRules: {
    '/': { swr: 3600 },
    '/blog': { swr: 3600 },
    '/blog/**': { swr: 3600 },
    '/projects': { swr: 3600 },
    '/projects/**': { swr: 3600 },
    // resume / contact / about are left as plain SSR (no rule) — dynamic, uncached.
    '/dashboard/**': { ssr: false, headers: { 'cache-control': 'no-store' } },
    '/api/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/api/auth/**': { headers: { 'cache-control': 'no-store' } },
  },

  runtimeConfig: {
    // Server-only private keys — NEVER exposed to the browser.
    // Add secrets here: apiSecret, databaseUrl, jwtSecret, etc.
    // Access in server routes via: const { apiSecret } = useRuntimeConfig()

    // Internal/private base URL the dashboard BFF (server/api/**) uses to reach the
    // backend. Falls back to public.apiBase when unset (see server/utils/bff.ts).
    // Never exposed to the browser.
    apiInternalBase: process.env.NUXT_API_INTERNAL_BASE ?? '',

    public: {
      // Exposed to both server and client-side code. Never put secrets here.
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4000',
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? 'Portfolio',
      appEnv: process.env.NUXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  experimental: {
    typedPages: true, // Type-safe useRoute() params — zero runtime cost
    viewTransition: true, // Smooth page transitions via View Transitions API
  },
});

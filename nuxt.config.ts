import tailwindcss from '@tailwindcss/vite';

import posts from './app/assets/data/posts.json';
import projects from './app/assets/data/projects.json';

const projectRoutes = (projects as { slug: string }[]).map((p) => `/projects/${p.slug}`);
const blogRoutes = (posts as { slug: string; draft?: boolean }[])
  .filter((p) => !p.draft)
  .map((p) => `/blog/${p.slug}`);

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app/',
  // Devtools only in development — keeps production/static builds lean.
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
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
      'modules/resume/composables',
      'modules/blog/composables',
      'core/utils',
      // Add new module composable dirs here as modules are created
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxt/fonts', '@nuxt/eslint', '@vee-validate/nuxt', '@nuxt/icon', '@nuxt/image'],

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt', ...projectRoutes, ...blogRoutes],
    },
  },

  // Self-hosted fonts via @nuxt/fonts (downloaded at build). Matches tokens.css.
  fonts: {
    families: [
      { name: 'Space Grotesk', provider: 'google', weights: [500, 600, 700] },
      { name: 'Geist', provider: 'google', weights: [400, 500, 600] },
      { name: 'Geist Mono', provider: 'google', weights: [400] },
    ],
    defaults: {
      styles: ['normal'],
      subsets: ['latin'],
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  runtimeConfig: {
    public: {
      // Exposed to both server and client-side code. Never put secrets here.
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? 'Mohamed Essam',
      appEnv: process.env.NUXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? '',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  experimental: {
    typedPages: true, // Type-safe useRoute() params — zero runtime cost
    // View Transitions delay bf-cache restoration and add first-paint work.
    viewTransition: false,
  },
});

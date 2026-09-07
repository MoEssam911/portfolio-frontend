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
      'modules/resume/composables',
      'modules/services/composables',
      'modules/testimonials/composables',
      'stores',
      'core/utils',
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

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt'],
    },
  },

  // Self-hosted Google fonts (downloaded at build, served locally). Matches the
  // family tokens in app/assets/css/tokens.css. display:swap avoids invisible text.
  fonts: {
    families: [
      { name: 'Space Grotesk', provider: 'google', weights: [400, 500, 600, 700] },
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

  runtimeConfig: {
    public: {
      // Exposed to both server and client-side code. Never put secrets here.
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

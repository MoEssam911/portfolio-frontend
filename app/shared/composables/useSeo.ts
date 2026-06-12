interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

/** Brand fallback social card served from /public (see public/og-image.svg). */
export const DEFAULT_OG_IMAGE = '/og-image.svg';

/** Build an absolute URL for the current origin (OG/canonical tags require it). */
export const absoluteUrl = (path: string, origin: string) =>
  /^https?:\/\//.test(path) ? path : `${origin}${path.startsWith('/') ? '' : '/'}${path}`;

/**
 * Sets page SEO meta tags with consistent title formatting and an OG/Twitter
 * image (falling back to the brand card). Call once per page inside
 * `<script setup>`. Site-wide defaults (canonical link, og:site_name,
 * twitter:card, default image) live in app.vue — this only sets per-page values.
 *
 * @example
 * useSeo({
 *   title: 'Dashboard',
 *   description: 'Overview of your account activity.',
 * })
 */
export const useSeo = (options: SeoOptions) => {
  const config = useRuntimeConfig();
  const url = useRequestURL();
  const route = useRoute();

  const fullTitle = `${options.title} — ${config.public.appName}`;
  const image = absoluteUrl(options.image || DEFAULT_OG_IMAGE, url.origin);

  useSeoMeta({
    title: fullTitle,
    ogTitle: fullTitle,
    description: options.description,
    ogDescription: options.description,
    ogUrl: `${url.origin}${route.path}`,
    ogImage: image,
    twitterImage: image,
    robots: options.noIndex ? 'noindex,nofollow' : 'index,follow',
  });
};

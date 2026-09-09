interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

/** Brand fallback social card served from /public. */
export const DEFAULT_OG_IMAGE = '/og-image.png';

/** Build an absolute URL for the current origin (OG/canonical tags require it). */
export const absoluteUrl = (path: string, origin: string) =>
  /^https?:\/\//.test(path) ? path : `${origin}${path.startsWith('/') ? '' : '/'}${path}`;

/**
 * Per-page SEO. Site-wide defaults (canonical, og:site_name, twitter:card) live in app.vue.
 * Title is set as a plain page title — app.vue titleTemplate appends the site name once.
 */
export const useSeo = (options: SeoOptions) => {
  const url = useRequestURL();
  const route = useRoute();
  const image = absoluteUrl(options.image || DEFAULT_OG_IMAGE, url.origin);

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    ogUrl: `${url.origin}${route.path}`,
    ogImage: image,
    twitterImage: image,
    robots: options.noIndex ? 'noindex,nofollow' : 'index,follow',
  });
};

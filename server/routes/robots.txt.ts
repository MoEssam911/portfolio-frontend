// Sitemap host prefers NUXT_PUBLIC_SITE_URL so static generates don't emit localhost.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const configured = (config.public.siteUrl as string | undefined)?.replace(/\/$/, '');
  const origin = configured || getRequestURL(event).origin;

  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  setHeader(event, 'cache-control', 'max-age=3600, public');

  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n');
});

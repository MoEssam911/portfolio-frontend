// Dynamic robots.txt so the Sitemap line carries the live origin (host-aware,
// works in dev, preview, and prod without hardcoding a domain).
export default defineEventHandler((event) => {
  const { origin } = getRequestURL(event);

  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  setHeader(event, 'cache-control', 'max-age=3600, public');

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
});

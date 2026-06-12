import { escapeXml, fetchPosts, fetchProjects } from '../utils/public-content';

// Static, indexable top-level routes and their relative priority.
const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/projects', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/resume', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'yearly' },
];

function urlEntry(loc: string, opts: { lastmod?: string; priority?: string; changefreq?: string }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    opts.lastmod ? `    <lastmod>${opts.lastmod.slice(0, 10)}</lastmod>` : '',
    opts.changefreq ? `    <changefreq>${opts.changefreq}</changefreq>` : '',
    opts.priority ? `    <priority>${opts.priority}</priority>` : '',
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export default defineEventHandler(async (event) => {
  const { origin } = getRequestURL(event);
  const [projects, posts] = await Promise.all([fetchProjects(), fetchPosts()]);

  const entries = [
    ...STATIC_ROUTES.map((r) =>
      urlEntry(`${origin}${r.path}`, { priority: r.priority, changefreq: r.changefreq }),
    ),
    ...projects.map((p) =>
      urlEntry(`${origin}/projects/${p.slug}`, { lastmod: p.updatedAt, priority: '0.7', changefreq: 'monthly' }),
    ),
    ...posts.map((p) =>
      urlEntry(`${origin}/blog/${p.slug}`, { lastmod: p.updatedAt, priority: '0.6', changefreq: 'monthly' }),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  setHeader(event, 'cache-control', 'max-age=3600, public');
  return xml;
});

import { escapeXml, fetchPosts } from '../utils/public-content';

// RSS 2.0 feed of the latest blog posts, newest first. Served at /feed.xml.
export default defineEventHandler(async (event) => {
  const { origin } = getRequestURL(event);
  const config = useRuntimeConfig();
  const appName = (config.public.appName as string) || 'Portfolio';

  const posts = (await fetchPosts())
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  const lastBuild = posts[0]?.createdAt ?? new Date().toISOString();

  const items = posts
    .map((p) => {
      const link = `${origin}/blog/${p.slug}`;
      return [
        '    <item>',
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>`,
        p.excerpt ? `      <description>${escapeXml(p.excerpt)}</description>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(appName)} — Blog</title>
    <link>${origin}/blog</link>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Latest writing from ${escapeXml(appName)}.</description>
    <language>en</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8');
  setHeader(event, 'cache-control', 'max-age=3600, public');
  return xml;
});

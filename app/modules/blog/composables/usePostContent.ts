import sanitizeHtml from 'sanitize-html';
import type { MaybeRefOrGetter } from 'vue';

export interface PostHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Allowlist for the trusted, owner-authored HTML the backend stores. */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'a', 'strong', 'em', 'b', 'i', 'u', 's', 'br', 'hr',
    'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote',
    'code', 'pre', 'img', 'figure', 'figcaption', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'loading', 'decoding'],
    '*': ['id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    // Force safe link behaviour on any anchor in the content.
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface ParsedContent {
  html: string;
  headings: PostHeading[];
}

/**
 * Sanitize the stored HTML and inject stable `id`s onto h2/h3 headings so the
 * Table of Contents can deep-link to them. Pure string ops + sanitize-html, so
 * it runs identically on server and client (no DOM dependency).
 */
function parseContent(raw: string): ParsedContent {
  if (!raw) return { html: '', headings: [] };

  const clean = sanitizeHtml(raw, SANITIZE_OPTIONS);
  const headings: PostHeading[] = [];
  const seen = new Set<string>();

  const html = clean.replace(
    /<(h2|h3)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      let id = slugify(text) || 'section';
      let n = 1;
      while (seen.has(id)) id = `${slugify(text) || 'section'}-${++n}`;
      seen.add(id);
      headings.push({ id, text, level: tag.toLowerCase() === 'h2' ? 2 : 3 });
      return `<${tag} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html, headings };
}

export function usePostContent(content: MaybeRefOrGetter<string | null | undefined>) {
  const parsed = computed(() => parseContent(toValue(content) ?? ''));
  const html = computed(() => parsed.value.html);
  const headings = computed(() => parsed.value.headings);
  return { html, headings };
}

/** Average adult reading speed used to estimate post length. */
const WORDS_PER_MINUTE = 200;

/**
 * Estimate reading time (in whole minutes, min 1) for a body of content.
 * Strips HTML tags before counting words, so it works on the raw HTML the
 * backend stores for blog posts. Always explicitly imported (shared/utils).
 */
export function readingTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

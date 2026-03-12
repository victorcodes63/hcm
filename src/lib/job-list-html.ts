/**
 * Helpers for job list content (requirements, responsibilities, benefits).
 * Supports both raw HTML (new) and legacy array format.
 */

import { sanitizeJobContent } from './sanitize-html';

/** Convert legacy array format to HTML for display or editor. */
export function arrayToHtml(items: string[]): string {
  if (!Array.isArray(items) || items.length === 0) {
    return '<ul><li></li></ul>';
  }
  const list = items
    .filter((x): x is string => typeof x === 'string')
    .map((item) => {
      const safe = sanitizeJobContent(item);
      const wrapped = /^<p[\s>]/i.test(safe.trim()) ? safe : `<p>${safe}</p>`;
      return `<li>${wrapped}</li>`;
    })
    .join('');
  return `<ul>${list}</ul>`;
}

/** Normalize value to HTML string - handles both string and legacy array. */
export function toHtmlString(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) return arrayToHtml(value);
  return '';
}

/** Normalize value for API - returns string for storage. */
export function forApi(value: unknown): string {
  return toHtmlString(value);
}

/** Extract first N list items from HTML as plain text (for previews). Handles ul/ol and nested p. */
export function htmlToListPreviewItems(html: string, maxItems = 2): string[] {
  if (!html || typeof html !== 'string') return [];
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(html)) !== null && items.length < maxItems) {
    const content = match[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (content) items.push(content);
  }
  return items;
}

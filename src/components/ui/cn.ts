/** Join conditional class names. Later arguments win by CSS order, so callers
 *  should pass their overriding `className` last. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

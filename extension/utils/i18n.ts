/**
 * Helper function that handles both simple translations and those with substitutions
 * @param key The translation key to use
 * @param count Optional count for plural forms
 * @param substitutions Optional array of substitutions for $1, $2, etc.
 * @returns Translated string
 */
export function __(key: string, count?: number, substitutions?: string[]): string {
  return i18n.t(key, count, substitutions);
}

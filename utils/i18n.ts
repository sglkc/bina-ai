import { createI18n } from '@wxt-dev/i18n'

/**
 * Helper function that handles both simple translations and those with substitutions
 * @param key The translation key to use
 * @param count Optional count for plural forms
 * @param substitutions Optional array of substitutions for $1, $2, etc.
 * @returns Translated string
 */
export const __ = createI18n().t

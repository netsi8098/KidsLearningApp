// ── Translation Hook ────────────────────────────────────
// Simple t(key) hook reading from locale strings.

import { useCallback } from 'react';
import en from './en';
import type { Locale } from './i18nConfig';

const strings: Record<Locale, Record<string, string>> = {
  en,
  // Future: import and add es, fr, am
  es: en, // fallback to English
  fr: en,
  am: en,
};

/**
 * Returns a t() function for translating UI strings.
 * Currently defaults to English. When locale support is added,
 * this will read from the profile's preferredLocale.
 */
export function useTranslation(locale: Locale = 'en') {
  const dict = strings[locale] ?? strings.en;

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      let str = dict[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, v);
        }
      }
      return str;
    },
    [dict]
  );

  return { t, locale };
}

// ── i18n Configuration ──────────────────────────────────
// Locale types and metadata for future multilingual support.

export type Locale = 'en' | 'es' | 'fr' | 'am';

export const defaultLocale: Locale = 'en';

export interface LanguageMeta {
  code: Locale;
  label: string;
  nativeLabel: string;
  emoji: string;
  direction: 'ltr' | 'rtl';
}

export const languages: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', emoji: '🇺🇸', direction: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', emoji: '🇪🇸', direction: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', emoji: '🇫🇷', direction: 'ltr' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', emoji: '🇪🇹', direction: 'ltr' },
];

export function getLanguageMeta(code: Locale): LanguageMeta {
  return languages.find((l) => l.code === code) ?? languages[0];
}
